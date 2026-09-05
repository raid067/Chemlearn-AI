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
  syncWithFirebase: (uid: string) => Promise<{ xp: number; level: number } | null>;
}

// Logic for calculating the user's level based on authoritative XP thresholds (Levels 1 to 10)
const calculateLevel = (xp: number) => {
  if (xp >= 14000) return 10;
  if (xp >= 11000) return 9;
  if (xp >= 8800) return 8;
  if (xp >= 6800) return 7;
  if (xp >= 5000) return 6;
  if (xp >= 3500) return 5;
  if (xp >= 2200) return 4;
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

      syncWithFirebase: async (uid: string) => {
        try {
          const { auth } = await import('@/lib/firebase');
          const token = await auth.currentUser?.getIdToken();
          if (!token) {
            return null;
          }

          const res = await fetch('/api/gamification/sync', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const json = await res.json();
          if (!res.ok) {
            throw new Error(json.error || "Server rejected state sync.");
          }

          const serverData = json.data as { xp: number; level: number; streak?: number; badges?: Badge[] };
          const prevLevel = get().level;

          set({
            xp: serverData.xp,
            level: serverData.level,
            streak: serverData.streak ?? get().streak,
            badges: serverData.badges ?? get().badges,
            levelUpModalTrigger: serverData.level > prevLevel
          });

          console.log(`[Gamification] Authoritatively refreshed for ${uid}: XP=${serverData.xp}, Level=${serverData.level}`);
          return serverData;
        } catch (error: unknown) {
          console.error(`[Gamification Error] Failed to sync profile for user ${uid}:`, error);
          useUIStore.getState().showToast(
            'Sync Note',
            'Could not refresh online progress from server',
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
