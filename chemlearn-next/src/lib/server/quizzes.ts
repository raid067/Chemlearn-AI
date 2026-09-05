import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';
import { awardXPEvent, updateAuthoritativeStreak } from './gamification';

export interface AuthoritativeMCQQuestion {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface AuthoritativeStructuredQuestion {
  question: string;
  marks?: number;
  expectedAnswer: string;
}

export interface AuthoritativeQuizDoc {
  quizId: string;
  uid: string;
  topic: string;
  difficulty: string;
  type: 'MCQ' | 'Structured';
  questions: (AuthoritativeMCQQuestion | AuthoritativeStructuredQuestion)[];
  createdAt: FirebaseFirestore.FieldValue | FirebaseFirestore.Timestamp;
}

export interface ClientSanitizedQuestion {
  index: number;
  type: 'MCQ' | 'Structured';
  question: string;
  options?: string[];
  marks?: number;
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

/**
 * Strips secret answer keys, explanations, and mark schemes from questions
 * before returning them to the client.
 */
export function sanitizeQuestionsForClient(
  questions: (AuthoritativeMCQQuestion | AuthoritativeStructuredQuestion)[],
  type: 'MCQ' | 'Structured'
): ClientSanitizedQuestion[] {
  return questions.map((q, index) => {
    if (type === 'MCQ') {
      const mcq = q as AuthoritativeMCQQuestion;
      return {
        index,
        type: 'MCQ',
        question: mcq.q,
        options: mcq.options,
      };
    } else {
      const structured = q as AuthoritativeStructuredQuestion;
      return {
        index,
        type: 'Structured',
        question: structured.question,
        marks: structured.marks || 2,
      };
    }
  });
}

/**
 * Saves generated quiz questions and secret answers in the server-only collection.
 */
export async function storeAuthoritativeQuiz(
  uid: string,
  topic: string,
  difficulty: string,
  type: 'MCQ' | 'Structured',
  rawQuestions: any[]
): Promise<{ quizId: string; sanitizedQuestions: ClientSanitizedQuestion[] }> {
  const quizId = `quiz_${Date.now()}_${randomBytes(4).toString('hex')}`;
  const quizRef = adminDb.collection('server_quizzes').doc(quizId);

  const formattedQuestions = rawQuestions.map((q) => {
    if (type === 'MCQ') {
      return {
        q: q.q || q.question || 'Question',
        options: Array.isArray(q.options) ? q.options : [],
        answer: typeof q.answer === 'number' ? q.answer : (typeof q.correctIndex === 'number' ? q.correctIndex : 0),
        explanation: q.explanation || 'No explanation provided.',
      };
    } else {
      return {
        question: q.question || q.q || 'Question',
        marks: Number(q.marks) || 2,
        expectedAnswer: q.expectedAnswer || 'Refer to marking scheme.',
      };
    }
  });

  await quizRef.set({
    quizId,
    uid,
    topic,
    difficulty,
    type,
    questions: formattedQuestions,
    createdAt: FieldValue.serverTimestamp(),
  });

  const sanitizedQuestions = sanitizeQuestionsForClient(formattedQuestions, type);
  return { quizId, sanitizedQuestions };
}

/**
 * Pure evaluation function for grading quiz answers against authoritative question bank.
 */
export function evaluateQuizAnswers(
  questions: (AuthoritativeMCQQuestion | AuthoritativeStructuredQuestion)[],
  type: 'MCQ' | 'Structured',
  answers: Record<number | string, number | string>
): {
  score: number;
  percentage: number;
  total: number;
  breakdown: QuestionGradingResult[];
} {
  const total = questions.length;
  let score = 0;
  const breakdown: QuestionGradingResult[] = [];

  for (let i = 0; i < total; i++) {
    const q = questions[i];
    const studentAnswer = answers[i] !== undefined ? answers[i] : answers[String(i)];

    if (type === 'MCQ') {
      const mcq = q as AuthoritativeMCQQuestion;
      const numericSelected = typeof studentAnswer === 'number' ? studentAnswer : Number(studentAnswer);
      const isCorrect = numericSelected === mcq.answer;
      if (isCorrect) score++;

      breakdown.push({
        questionIndex: i,
        question: mcq.q,
        selectedOption: numericSelected,
        correctIndex: mcq.answer,
        isCorrect,
        explanation: mcq.explanation,
      });
    } else {
      const structured = q as AuthoritativeStructuredQuestion;
      const isProvided = typeof studentAnswer === 'string' && studentAnswer.trim().length > 0;
      if (isProvided) score++;

      breakdown.push({
        questionIndex: i,
        question: structured.question,
        selectedOption: studentAnswer || '',
        expectedAnswer: structured.expectedAnswer,
        isCorrect: isProvided,
        explanation: `Expected: ${structured.expectedAnswer}`,
      });
    }
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  return { score, percentage, total, breakdown };
}

/**
 * Server-authoritative grading of user quiz answers.
 * Compares against secret answers in server_quizzes, computes score and percentage,
 * writes attempt to quiz_results, awards idempotent XP, and updates streak.
 */
export async function gradeQuizSubmission(
  quizId: string,
  uid: string,
  answers: Record<number | string, number | string>
): Promise<QuizGradingResponse> {
  const quizSnap = await adminDb.collection('server_quizzes').doc(quizId).get();
  if (!quizSnap.exists) {
    throw new Error('Quiz not found or expired. Please generate a new quiz.');
  }

  const quizData = quizSnap.data() as AuthoritativeQuizDoc;
  const questions = quizData.questions || [];
  const { score, percentage, total, breakdown } = evaluateQuizAnswers(questions, quizData.type, answers);

  // Authoritatively record result in quiz_results via Admin SDK
  const resultRef = adminDb.collection('quiz_results').doc();
  await resultRef.set({
    uid,
    quizId,
    score,
    total,
    percentage,
    topic: quizData.topic,
    timestamp: FieldValue.serverTimestamp(),
    answers,
  });

  // Calculate base XP (15 XP for completing + 10 XP bonus for score >= 80%)
  const baseXP = 15;
  const bonusXP = percentage >= 80 ? 10 : 0;
  const totalXP = baseXP + bonusXP;

  // Idempotently award XP for this quiz attempt
  const xpResult = await awardXPEvent(uid, 'QUIZ', quizId, totalXP, {
    score,
    total,
    percentage,
  });

  // Authoritatively update daily streak
  await updateAuthoritativeStreak(uid);

  return {
    quizId,
    score,
    total,
    percentage,
    breakdown,
    xpAwarded: xpResult.xpAwarded,
    currentXp: xpResult.currentXp,
    currentLevel: xpResult.currentLevel,
    levelUp: xpResult.levelUp,
  };
}
