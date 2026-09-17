import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
  IdTokenResult,
} from 'firebase/auth';
import { auth, app } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  claims: Record<string, unknown>;
  isTeacher: boolean;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  init: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  claims: {},
  isTeacher: false,
  isAdmin: false,
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
      if (displayName && cred.user) {
        try {
          await updateProfile(cred.user, { displayName });
        } catch (e) {
          console.warn('Could not update user profile displayName:', e);
        }
      }
      const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore(app);
      await setDoc(doc(db, 'students', cred.user.uid), {
        email,
        displayName: displayName || email.split('@')[0],
        xp: 0,
        quizScore: 0,
        streak: 0,
        createdAt: serverTimestamp(),
      });
    } finally {
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      
      if (cred.user) {
        try {
          const { getFirestore, doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
          const db = getFirestore(app);
          const studentDocRef = doc(db, 'students', cred.user.uid);
          const snap = await getDoc(studentDocRef);
          
          // If student document does not exist yet, provision it safely complying with firestore.rules validStudentCreate
          if (!snap.exists()) {
            const email = cred.user.email || '';
            const displayName = cred.user.displayName || email.split('@')[0] || 'Student';
            await setDoc(studentDocRef, {
              email,
              displayName,
              xp: 0,
              quizScore: 0,
              streak: 0,
              createdAt: serverTimestamp(),
            });
          }
        } catch (dbErr) {
          console.warn('[useAuthStore] Non-fatal student profile auto-provisioning warning:', dbErr);
        }
      }
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email: string) => {
    set({ loading: true });
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, claims: {}, isTeacher: false, isAdmin: false });
  },

  init: () => {
    let unsubscribeDoc: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult: IdTokenResult = await user.getIdTokenResult();
        
        // Check if user is a teacher (custom claims first to avoid unnecessary Firestore read)
        let isTeacher = Boolean(tokenResult.claims?.teacher);
        const isAdmin = Boolean(tokenResult.claims?.admin);
        if (!isTeacher) {
          try {
            const { getDoc, doc, getFirestore } = await import('firebase/firestore');
            const db = getFirestore(app);
            const docSnap = await getDoc(doc(db, 'teachers', user.uid));
            isTeacher = docSnap.exists();
          } catch (e) {
            console.warn("Failed to check teacher document status:", e);
          }
        }

        set({ user, claims: tokenResult.claims as Record<string, unknown>, isTeacher, isAdmin, initialized: true });
        
        // Listen to student data to populate dashboard
        import('firebase/firestore').then(({ doc, onSnapshot, getFirestore }) => {
          import('@/stores/useDashboardStore').then(({ useDashboardStore }) => {
            if (unsubscribeDoc) {
              unsubscribeDoc();
            }
            const db = getFirestore(app);
            unsubscribeDoc = onSnapshot(
              doc(db, 'students', user.uid),
              (snap) => {
                if (snap.exists()) {
                  useDashboardStore.getState().setStudentData(snap.data() as unknown as import('@/types/student').StudentData);
                }
              },
              (err) => {
                console.warn("[Auth Listener] Student document snapshot unavailable:", err.message);
              }
            );
          });
        });
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        set({ user: null, claims: {}, isTeacher: false, initialized: true });
        import('@/stores/useDashboardStore').then(({ useDashboardStore }) => {
          useDashboardStore.getState().setStudentData(null);
        });
      }
    });
    return () => {
      unsubscribe();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  },
}));
