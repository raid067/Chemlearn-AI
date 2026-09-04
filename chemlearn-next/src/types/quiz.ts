export interface MCQQuestion {
  type: 'MCQ';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StructuredQuestion {
  type: 'Structured';
  question: string;
  expectedAnswer: string;
}

export type QuizQuestion = MCQQuestion | StructuredQuestion;

export interface DuelMatch {
  matchId: string;
  playerAId: string;
  playerBId?: string;
  playerBJoined: boolean;
  playerAScore: number;
  playerBScore: number;
  playerAFinished: boolean;
  playerBFinished: boolean;
  questions: { q: string; options: string[]; ans: number }[];
  createdAt: Date;
}

export interface ExternalQuiz {
  title: string;
  description?: string;
  platform: 'zep' | 'wayground' | 'kahoot';
  url: string;
  topic: string;
  emoji: string;
}
