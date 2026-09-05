import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { awardXPEvent } from './gamification';

export interface ServerDuelQuestion {
  q: string;
  options: string[];
  ans: number;
}

export interface ServerDuelDoc {
  matchId: string;
  creatorUid: string;
  questions: ServerDuelQuestion[];
  createdAt: FirebaseFirestore.FieldValue | FirebaseFirestore.Timestamp;
}

/**
 * Stores authoritative duel questions and secret answers in the server-only collection.
 */
export async function storeAuthoritativeDuel(
  matchId: string,
  creatorUid: string,
  questions: ServerDuelQuestion[]
): Promise<void> {
  await adminDb.collection('server_duels').doc(matchId).set({
    matchId,
    creatorUid,
    questions,
    createdAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Server-authoritative answer evaluation and score increment for multiplayer duels.
 * Prevents clients from inspecting answer keys or modifying scores directly.
 */
export async function submitDuelAnswer(
  matchId: string,
  uid: string,
  questionIndex: number,
  selectedOption: number
): Promise<{ correct: boolean; score: number }> {
  const serverSnap = await adminDb.collection('server_duels').doc(matchId).get();
  if (!serverSnap.exists) {
    throw new Error('Match not found or expired');
  }

  const serverData = serverSnap.data() as ServerDuelDoc;
  const targetQuestion = serverData.questions[questionIndex];
  if (!targetQuestion) {
    throw new Error('Invalid question index');
  }

  const isCorrect = selectedOption === targetQuestion.ans;
  const duelRef = adminDb.collection('duels').doc(matchId);

  // Atomically verify eligibility and increment score in Firestore via Admin SDK
  const updatedScore = await adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(duelRef);
    if (!doc.exists) throw new Error('Match vanished');

    const data = doc.data() || {};
    if (data.status !== 'playing' && data.status !== 'waiting') {
      throw new Error('Match is not active');
    }

    const isPlayer1 = data.player1?.uid === uid;
    const isPlayer2 = data.player2?.uid === uid;

    if (!isPlayer1 && !isPlayer2) {
      throw new Error('You are not a participant in this duel');
    }

    const playerKey = isPlayer1 ? 'player1' : 'player2';
    const playerData = data[playerKey] || {};
    const answeredIndices: number[] = Array.isArray(playerData.answeredIndices)
      ? playerData.answeredIndices
      : [];

    // Anti-cheat: prevent replaying or spamming options for the same question index
    if (answeredIndices.includes(questionIndex)) {
      throw new Error('Question already answered');
    }

    const oldScore = Number(playerData.score) || 0;
    const newScore = isCorrect ? oldScore + 10 : oldScore;
    const newAnswered = [...answeredIndices, questionIndex];

    transaction.update(duelRef, {
      [`${playerKey}.score`]: newScore,
      [`${playerKey}.answeredIndices`]: newAnswered,
    });

    return newScore;
  });

  return { correct: isCorrect, score: updatedScore };
}

export type DuelRewardStatus = 'none' | 'pending' | 'awarded' | 'failed';

/**
 * Server-authoritative match finalization and winner XP reward.
 * Implements durable reward states ('pending' -> 'awarded' / 'failed') with safe retry.
 * Moves XP awarding outside transaction to avoid nested transaction deadlock.
 */
export async function finishDuelPlayer(
  matchId: string,
  uid: string
): Promise<{ status: string; winnerUid: string | null; rewardStatus: DuelRewardStatus; xpAwarded: number }> {
  const duelRef = adminDb.collection('duels').doc(matchId);

  const txResult = await adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(duelRef);
    if (!doc.exists) throw new Error('Match not found');

    const data = doc.data() || {};
    const isPlayer1 = data.player1?.uid === uid;
    const isPlayer2 = data.player2?.uid === uid;

    if (!isPlayer1 && !isPlayer2) {
      throw new Error('Not a participant in this match');
    }

    const playerKey = isPlayer1 ? 'player1' : 'player2';
    const opponentKey = isPlayer1 ? 'player2' : 'player1';

    const opponentFinished = Boolean(data[opponentKey]?.finished);
    const matchFinished = opponentFinished;

    const updates: Record<string, unknown> = {
      [`${playerKey}.finished`]: true,
    };

    let winnerUid: string | null = data.winnerUid || null;
    let rewardStatus: DuelRewardStatus = data.rewardStatus || 'none';

    if (matchFinished) {
      updates.status = 'finished';
      const myScore = Number(data[playerKey]?.score) || 0;
      const opponentScore = Number(data[opponentKey]?.score) || 0;

      if (!winnerUid) {
        if (myScore > opponentScore) {
          winnerUid = uid;
        } else if (opponentScore > myScore) {
          winnerUid = data[opponentKey]?.uid || null;
        }
      }

      updates.winnerUid = winnerUid;

      // Only transition to pending if not already awarded
      if (rewardStatus !== 'awarded') {
        rewardStatus = winnerUid ? 'pending' : 'none';
        updates.rewardStatus = rewardStatus;
      }
    }

    transaction.update(duelRef, updates);

    return {
      status: matchFinished ? 'finished' : (data.status || 'playing'),
      winnerUid,
      matchFinished,
      rewardStatus,
      p1Score: data.player1?.score,
      p2Score: data.player2?.score,
    };
  });

  // Award winner 20 XP idempotently outside transaction to prevent nested transaction deadlock
  let xpAwarded = 0;
  if (txResult.matchFinished && txResult.winnerUid && txResult.rewardStatus !== 'awarded') {
    try {
      const xpResult = await awardXPEvent(txResult.winnerUid, 'DUEL', matchId, 20, {
        matchId,
        p1Score: txResult.p1Score,
        p2Score: txResult.p2Score,
      });
      if (txResult.winnerUid === uid) {
        xpAwarded = xpResult.xpAwarded;
      }

      await duelRef.update({
        rewardStatus: 'awarded',
        rewardAwardedAt: FieldValue.serverTimestamp(),
      });
      txResult.rewardStatus = 'awarded';
    } catch (err) {
      console.error('[duels] Failed to award winner XP event:', err);
      await duelRef.update({
        rewardStatus: 'failed',
        rewardError: err instanceof Error ? err.message : String(err),
      }).catch(() => {});
      txResult.rewardStatus = 'failed';
    }
  }

  return {
    status: txResult.status,
    winnerUid: txResult.winnerUid,
    rewardStatus: txResult.rewardStatus,
    xpAwarded,
  };
}

