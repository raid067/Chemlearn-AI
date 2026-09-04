import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  IdTokenResult,
} from 'firebase/auth';
import { auth, app } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  claims: Record<string, unknown>;
  isTeacher: boolean;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  init: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  claims: {},
  isTeacher: false,
  loading: false,
  initialized: false,

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore(app);
      await setDoc(doc(db, 'students', cred.user.uid), {
        email,
        displayName,
        xp: 0,
        quizScore: 0,
        streak: 0,
        createdAt: serverTimestamp(),
      });
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, claims: {} });
  },

  init: () => {
    let unsubscribeDoc: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult: IdTokenResult = await user.getIdTokenResult();
        
        // Check if user is a teacher
        let isTeacher = false;
        try {
          const { getDoc, doc, getFirestore } = await import('firebase/firestore');
          const db = getFirestore(app);
          const docSnap = await getDoc(doc(db, 'teachers', user.uid));
          isTeacher = docSnap.exists();
        } catch (e) {
          console.error("Failed to check teacher status:", e);
        }

        set({ user, claims: tokenResult.claims as Record<string, unknown>, isTeacher, initialized: true });
        
        // Listen to student data to populate dashboard
        import('firebase/firestore').then(({ doc, onSnapshot, getFirestore }) => {
          import('@/stores/useDashboardStore').then(({ useDashboardStore }) => {
            if (unsubscribeDoc) {
              unsubscribeDoc();
            }
            const db = getFirestore(app);
            unsubscribeDoc = onSnapshot(doc(db, 'students', user.uid), (snap) => {
              if (snap.exists()) {
                useDashboardStore.getState().setStudentData(snap.data() as any);
              }
            });
          });
        });
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        set({ user: null, claims: {}, isTeacher: false, initialized: true });
        import('@/stores/useDashboardStore').then(({ useDashboardStore }) => {
          useDashboardStore.getState().setStudentData(null as any);
        });
      }
    });
    return () => {
      unsubscribe();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  },
}));
