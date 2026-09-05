import { create } from 'zustand';
import { StudentData } from '@/types/student';

interface DashboardState {
  studentData: StudentData | null;
  challengeStarted: boolean;
  challengeScore: number;
  challengeIndex: number;
  challengeComplete: boolean;
  setStudentData: (data: StudentData | null) => void;
  startChallenge: () => void;
  setChallengeScore: (score: number) => void;
  nextChallengeQuestion: () => void;
  completeChallenge: () => void;
  resetChallenge: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  studentData: null,
  challengeStarted: false,
  challengeScore: 0,
  challengeIndex: 0,
  challengeComplete: false,
  setStudentData: (data) => set({ studentData: data }),
  startChallenge: () => set({ challengeStarted: true, challengeScore: 0, challengeIndex: 0, challengeComplete: false }),
  setChallengeScore: (score) => set({ challengeScore: score }),
  nextChallengeQuestion: () => set((s) => ({ challengeIndex: s.challengeIndex + 1 })),
  completeChallenge: () => set({ challengeComplete: true }),
  resetChallenge: () => set({ challengeStarted: false, challengeScore: 0, challengeIndex: 0, challengeComplete: false }),
}));
