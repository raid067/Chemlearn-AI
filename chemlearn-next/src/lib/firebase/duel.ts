import { app } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc,
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

export const joinMatch = async (matchId: string, uid: string, displayName: string) => {
  const matchRef = doc(db, 'duels', matchId);
  const snap = await getDoc(matchRef);

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

  await updateDoc(matchRef, {
    player2: { uid, displayName, score: 0, finished: false },
    status: 'playing',
  });

  return (await getDoc(matchRef)).data() as DuelState;
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
    await updateDoc(matchRef, { 'player1.finished': true });
  } else if (data.player2?.uid === uid) {
    await updateDoc(matchRef, { 'player2.finished': true });
  }

  // Check if both finished
  const updatedSnap = await getDoc(matchRef);
  const updatedData = updatedSnap.data() as DuelState;
  
  if (updatedData.player1.finished && updatedData.player2?.finished) {
    await updateDoc(matchRef, { status: 'finished' });
  }
};

export const subscribeToMatch = (matchId: string, callback: (data: DuelState) => void) => {
  const matchRef = doc(db, 'duels', matchId);
  return onSnapshot(matchRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as DuelState);
    }
  });
};
