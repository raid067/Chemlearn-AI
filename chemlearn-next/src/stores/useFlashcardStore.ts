import { create } from 'zustand';

export interface Flashcard {
  question: string;
  answer: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: number;
}

interface FlashcardStore {
  cards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  setCards: (cards: Flashcard[]) => void;
  flip: () => void;
  markCard: (status: 'learning' | 'known') => void;
}

export const useFlashcardStore = create<FlashcardStore>((set) => ({
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  setCards: (cards) => set({ cards, currentIndex: 0, isFlipped: false }),
  flip: () => set((state) => ({ isFlipped: !state.isFlipped })),
  markCard: () => set((state) => {
    // Simple mock logic for moving to next card
    const nextIndex = state.currentIndex + 1 < state.cards.length ? state.currentIndex + 1 : 0;
    return {
      isFlipped: false,
      currentIndex: nextIndex,
    };
  })
}));
