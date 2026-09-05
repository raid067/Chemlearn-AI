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
  const [serverSnap, publicSnap] = await Promise.all([
    adminDb.collection('server_duels').doc(matchId).get(),
    adminDb.collection('duels').doc(matchId).get(),
  ]);

  if (!serverSnap.exists || !publicSnap.exists) {
    throw new Error('Match not found or expired');
  }

  const serverData = serverSnap.data() as ServerDuelDoc;
  const publicData = publicSnap.data() || {};

  if (publicData.status !== 'playing' && publicData.status !== 'waiting') {
    throw new Error('Match is not active');
  }

  const isPlayer1 = publicData.player1?.uid === uid;
  const isPlayer2 = publicData.player2?.uid === uid;

  if (!isPlayer1 && !isPlayer2) {
    throw new Error('You are not a participant in this duel');
  }

  const targetQuestion = serverData.questions[questionIndex];
  if (!targetQuestion) {
    throw new Error('Invalid question index');
  }

  const isCorrect = selectedOption === targetQuestion.ans;

  if (!isCorrect) {
    const currentScore = isPlayer1 ? (publicData.player1?.score || 0) : (publicData.player2?.score || 0);
    return { correct: false, score: currentScore };
  }

  // Atomically increment score in Firestore via Admin SDK
  const duelRef = adminDb.collection('duels').doc(matchId);
  const updatedScore = await adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(duelRef);
    if (!doc.exists) throw new Error('Match vanished');

    const data = doc.data() || {};
    const playerKey = isPlayer1 ? 'player1' : 'player2';
    const oldScore = Number(data[playerKey]?.score) || 0;
    const newScore = oldScore + 10;

    transaction.update(duelRef, {
      [`${playerKey}.score`]: newScore,
    });

    return newScore;
  });

  return { correct: true, score: updatedScore };
}

/**
 * Server-authoritative match finalization and winner XP reward.
 */
export async function finishDuelPlayer(
  matchId: string,
  uid: string
): Promise<{ status: string; winnerUid: string | null; xpAwarded: number }> {
  const duelRef = adminDb.collection('duels').doc(matchId);

  return await adminDb.runTransaction(async (transaction) => {
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

    let winnerUid: string | null = null;
    let xpAwarded = 0;

    if (matchFinished) {
      updates.status = 'finished';
      const myScore = Number(data[playerKey]?.score) || 0;
      const opponentScore = Number(data[opponentKey]?.score) || 0;

      if (myScore > opponentScore) {
        winnerUid = uid;
      } else if (opponentScore > myScore) {
        winnerUid = data[opponentKey]?.uid || null;
      }
    }

    transaction.update(duelRef, updates);

    // If match finished and there is a winner, award 20 XP idempotently
    if (matchFinished && winnerUid) {
      const xpResult = await awardXPEvent(winnerUid, 'DUEL', matchId, 20, {
        matchId,
        p1Score: data.player1?.score,
        p2Score: data.player2?.score,
      });
      if (winnerUid === uid) {
        xpAwarded = xpResult.xpAwarded;
      }
    }

    return {
      status: matchFinished ? 'finished' : (data.status || 'playing'),
      winnerUid,
      xpAwarded,
    };
  });
}
