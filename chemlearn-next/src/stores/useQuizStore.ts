import { create } from 'zustand';
import { QuizQuestion } from '@/types/quiz';

interface QuizState {
  // AI Quiz
  aiQuestions: QuizQuestion[];
  aiScore: number;
  aiAnswered: number;
  aiModalOpen: boolean;
  // Duel
  duelModalOpen: boolean;
  matchId: string | null;
  playerRole: 'A' | 'B' | null;
  duelScore: number;
  duelAnswered: number;
  duelQuestions: { q: string; options: string[]; ans: number }[];
  // Actions
  setAIQuestions: (q: QuizQuestion[]) => void;
  incrementAIScore: () => void;
  incrementAIAnswered: () => void;
  resetAIQuiz: () => void;
  openAIModal: () => void;
  closeAIModal: () => void;
  directModalOpen: boolean;
  openDirectModal: () => void;
  closeDirectModal: () => void;
  openDuelModal: () => void;
  closeDuelModal: () => void;
  setMatchId: (id: string) => void;
  setPlayerRole: (role: 'A' | 'B') => void;
  setDuelQuestions: (q: { q: string; options: string[]; ans: number }[]) => void;
  incrementDuelScore: () => void;
  incrementDuelAnswered: () => void;
  resetDuel: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  aiQuestions: [],
  aiScore: 0,
  aiAnswered: 0,
  aiModalOpen: false,
  directModalOpen: false,
  duelModalOpen: false,
  matchId: null,
  playerRole: null,
  duelScore: 0,
  duelAnswered: 0,
  duelQuestions: [],
  setAIQuestions: (q) => set({ aiQuestions: q }),
  incrementAIScore: () => set((s) => ({ aiScore: s.aiScore + 1 })),
  incrementAIAnswered: () => set((s) => ({ aiAnswered: s.aiAnswered + 1 })),
  resetAIQuiz: () => set({ aiQuestions: [], aiScore: 0, aiAnswered: 0 }),
  openAIModal: () => set({ aiModalOpen: true }),
  closeAIModal: () => set({ aiModalOpen: false }),
  openDirectModal: () => set({ directModalOpen: true }),
  closeDirectModal: () => set({ directModalOpen: false }),
  openDuelModal: () => set({ duelModalOpen: true }),
  closeDuelModal: () => set({ duelModalOpen: false }),
  setMatchId: (id) => set({ matchId: id }),
  setPlayerRole: (role) => set({ playerRole: role }),
  setDuelQuestions: (q) => set({ duelQuestions: q }),
  incrementDuelScore: () => set((s) => ({ duelScore: s.duelScore + 1 })),
  incrementDuelAnswered: () => set((s) => ({ duelAnswered: s.duelAnswered + 1 })),
  resetDuel: () => set({ matchId: null, playerRole: null, duelScore: 0, duelAnswered: 0, duelQuestions: [] }),
}));
