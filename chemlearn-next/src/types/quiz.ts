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

export interface QuestionGradingResult {
  questionIndex: number;
  question: string;
  selectedOption: number | string;
  correctIndex?: number;
  expectedAnswer?: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizGradingResponse {
  quizId: string;
  score: number;
  total: number;
  percentage: number;
  breakdown: QuestionGradingResult[];
  xpAwarded: number;
  currentXp: number;
  currentLevel: number;
  levelUp: boolean;
}
