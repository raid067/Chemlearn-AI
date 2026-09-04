import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUIStore } from '@/stores/useUIStore';

export interface Badge {
  id: string;
  emoji: string;
  label: string;
}

export type GamificationAction = 'COMPLETE_LESSON' | 'WIN_DUEL' | 'COMPLETE_QUIZ' | 'DAILY_CHALLENGE';

interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  badges: Badge[];
  levelUpModalTrigger: boolean;
  
  // Actions
  addXP: (amount: number, reason: string, action?: GamificationAction) => Promise<void>;
  incrementStreak: () => void;
  unlockBadge: (badge: Badge) => void;
  dismissLevelUp: () => void;
  syncWithFirebase: (uid: string, action: GamificationAction) => Promise<{ xp: number; level: number } | null>;
}

// Logic for calculating the user's level based on XP thresholds
const calculateLevel = (xp: number) => {
  if (xp >= 10000) return 10;
  if (xp >= 5000) return 5;
  if (xp >= 2500) return 4;
  if (xp >= 1200) return 3;
  if (xp >= 500) return 2;
  return 1;
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      levelUpModalTrigger: false,

      addXP: async (amount: number, reason: string, action?: GamificationAction) => {
        console.log(`[Gamification] Award XP requested (${amount} for: ${reason}, action: ${action || 'none'})`);

        if (action) {
          try {
            const { auth } = await import('@/lib/firebase');
            const uid = auth.currentUser?.uid;
            if (uid) {
              await get().syncWithFirebase(uid, action);
              return;
            }
          } catch (e) {
            console.warn('[Gamification] Could not get user auth for sync, falling back to local state:', e);
          }
        }

        // Local fallback for guest / unauthenticated session
        const { xp, level } = get();
        const newXP = xp + amount;
        const newLevel = calculateLevel(newXP);

        set({ 
          xp: newXP,
          level: newLevel,
          levelUpModalTrigger: newLevel > level
        });
      },

      incrementStreak: () => {
        set((state) => ({ streak: state.streak + 1 }));
      },

      unlockBadge: (badge: Badge) => {
        const { badges } = get();
        // Prevent duplicate badges
        if (!badges.find((b) => b.id === badge.id)) {
          set({ badges: [...badges, badge] });
        }
      },

      dismissLevelUp: () => set({ levelUpModalTrigger: false }),

      syncWithFirebase: async (uid: string, action: GamificationAction) => {
        try {
          const { auth } = await import('@/lib/firebase');
          const token = await auth.currentUser?.getIdToken();
          if (!token) {
            throw new Error("You are not signed in. Sign in to save your XP!");
          }

          const res = await fetch('/api/gamification/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action })
          });

          const json = await res.json();
          if (!res.ok) {
            throw new Error(json.error || "Server rejected XP update.");
          }

          const serverData = json.data as { xp: number; level: number };
          const prevLevel = get().level;
          const xpGained = serverData.xp - get().xp;

          set({
            xp: serverData.xp,
            level: serverData.level,
            levelUpModalTrigger: serverData.level > prevLevel
          });

          const actionLabel = action.replace(/_/g, ' ').toLowerCase();
          useUIStore.getState().showToast(
            'XP Earned!',
            `+${xpGained > 0 ? xpGained : ''} XP from ${actionLabel}`,
            '⚡'
          );

          console.log(`[Gamification] Synced ${action} for ${uid}: XP=${serverData.xp}, Level=${serverData.level}`);
          return serverData;
        } catch (error: any) {
          console.error(`[Gamification Error] Failed to sync ${action} for user ${uid}:`, error);
          useUIStore.getState().showToast(
            'XP Sync Failed',
            error?.message || 'Could not save progress to server',
            '⚠️'
          );
          return null;
        }
      }
    }),
    {
      name: 'chemlearn-gamification-storage',
    }
  )
);
