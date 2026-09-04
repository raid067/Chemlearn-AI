export interface StudentData {
  uid: string;
  email: string;
  displayName: string;
  xp: number;
  quizScore: number;
  streak: number;
  dailyChallengeDate?: string;
  dailyChallengeStreak?: number;
  completedPomodoros?: number;
  avatar?: string;
  role?: string;
  createdAt?: Date;
}

export interface Badge {
  id: string;
  emoji: string;
  label: string;
  unlocked: boolean;
  condition: (data: StudentData) => boolean;
}

export interface ChallengeQuestion {
  q: string;
  options: string[];
  answer: number;
}
