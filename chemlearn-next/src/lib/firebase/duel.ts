import { app } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  runTransaction,
  serverTimestamp,
  getFirestore
} from 'firebase/firestore';
import { generateMatchId } from '../utils';

const db = getFirestore(app);

export interface DuelPlayer {
  uid: string;
  displayName: string;
  score: number;
  finished: boolean;
}

export interface DuelState {
  matchId: string;
  status: 'waiting' | 'playing' | 'finished';
  player1: DuelPlayer;
  player2?: DuelPlayer;
  questions: any[];
  createdAt: any;
}

export const createMatch = async (uid: string, displayName: string, questions: any[]) => {
  const matchId = generateMatchId();
  const matchRef = doc(collection(db, 'duels'), matchId);

  const newMatch: DuelState = {
    matchId,
    status: 'waiting',
    player1: { uid, displayName, score: 0, finished: false },
    questions,
    createdAt: serverTimestamp(),
  };

  await setDoc(matchRef, newMatch);
  return matchId;
};

export const joinMatch = async (matchId: string, uid: string, displayName: string): Promise<DuelState> => {
  const matchRef = doc(db, 'duels', matchId);

  return await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(matchRef);

    if (!snap.exists()) {
      throw new Error('Match not found');
    }

    const data = snap.data() as DuelState;
    
    if (data.status !== 'waiting') {
      throw new Error('Match already started or finished');
    }

    if (data.player1.uid === uid) {
      return data; // Rejoining own match
    }

    const updatedState: DuelState = {
      ...data,
      player2: { uid, displayName, score: 0, finished: false },
      status: 'playing',
    };

    transaction.update(matchRef, {
      player2: { uid, displayName, score: 0, finished: false },
      status: 'playing',
    });

    return updatedState;
  });
};

export const updateScore = async (matchId: string, uid: string, score: number) => {
  const matchRef = doc(db, 'duels', matchId);
  const snap = await getDoc(matchRef);
  if (!snap.exists()) return;

  const data = snap.data() as DuelState;
  
  if (data.player1.uid === uid) {
    await updateDoc(matchRef, { 'player1.score': score });
  } else if (data.player2?.uid === uid) {
    await updateDoc(matchRef, { 'player2.score': score });
  }
};

export const finishMatch = async (matchId: string, uid: string) => {
  const matchRef = doc(db, 'duels', matchId);
  const snap = await getDoc(matchRef);
  if (!snap.exists()) return;

  const data = snap.data() as DuelState;
  
  if (data.player1.uid === uid) {
    const opponentFinished = data.player2?.finished === true;
    await updateDoc(matchRef, {
      'player1.finished': true,
      ...(opponentFinished ? { status: 'finished' } : {})
    });
  } else if (data.player2?.uid === uid) {
    const opponentFinished = data.player1.finished === true;
    await updateDoc(matchRef, {
      'player2.finished': true,
      ...(opponentFinished ? { status: 'finished' } : {})
    });
  }
};

export const subscribeToMatch = (
  matchId: string, 
  callback: (data: DuelState) => void,
  onError?: (error: Error) => void
) => {
  const matchRef = doc(db, 'duels', matchId);
  return onSnapshot(
    matchRef, 
    (doc) => {
      if (doc.exists()) {
        callback(doc.data() as DuelState);
      }
    },
    (err) => {
      if (onError) onError(err);
      else console.warn(`[Duel Listener] Match ${matchId} snapshot error:`, err.message);
    }
  );
};
