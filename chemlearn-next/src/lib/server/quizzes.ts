import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';
import { awardXPEvent, updateAuthoritativeStreak, getMalaysianDateString } from './gamification';
import {
  gradeStructuredRubricWithGateway,
  StructuredRubricEvaluation,
  structuredRubricSchema,
} from './ai-gateway';
export type { StructuredRubricEvaluation };
export { structuredRubricSchema };

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
  isDailyChallenge?: boolean;
  challengeDate?: string;
  enabled?: boolean;
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

const SCRIPT_CHAR_MAP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁺': '+', '⁻': '-', '₊': '+', '₋': '-',
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
};

/**
 * Normalizes chemistry answers for fair, deterministic matching:
 * - strips trailing punctuation
 * - collapses whitespace
 * - lowercases
 * - standardizes Unicode subscripts (H₂O -> h2o) and superscript notations (Fe²⁺ -> fe2+)
 * - normalizes common chemistry units (mol/dm3, g/cm3, cm3)
 */
export function normalizeChemistryAnswer(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const str = raw
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?]+$/g, '')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₊₋₀₁₂₃₄₅₆₇₈₉]/g, (ch) => SCRIPT_CHAR_MAP[ch] || ch)
    .replace(/[\u2080-\u2089]/g, (ch) => String(ch.charCodeAt(0) - 0x2080));

  return str
    .replace(/\s*mol\s*(?:\/|\s*per\s*|\s*)\s*dm\s*[-^]?\s*3/g, ' mol/dm3')
    .replace(/\s*g\s*(?:\/|\s*per\s*|\s*)\s*cm\s*[-^]?\s*3/g, ' g/cm3')
    .replace(/(?<!\/)\s*cm\s*[-^]?\s*3/g, ' cm3')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministically grades a structured question answer against an authoritative expected answer/rubric.
 * Supports:
 * - Exact normalized match
 * - Alternative acceptable answers separated by '/', '|', or ' or '
 * - Numerical matching with or without standard units
 * - Keyword/concept matching with proportional partial marks
 * - Never awards marks for mere non-empty or irrelevant input
 */
export function gradeStructuredDeterministic(
  studentAnswer: string,
  expectedAnswer: string,
  maxMarks = 2
): { score: number; isCorrect: boolean; feedback: string } {
  const normStudent = normalizeChemistryAnswer(studentAnswer);
  if (!normStudent) {
    return { score: 0, isCorrect: false, feedback: 'No answer was provided.' };
  }

  const normExpected = normalizeChemistryAnswer(expectedAnswer);

  // 1. Exact normalized match
  if (normStudent === normExpected) {
    return { score: maxMarks, isCorrect: true, feedback: 'Correct!' };
  }

  // 2. Acceptable alternatives (split by '/', '|', or ' or ')
  const alternatives = expectedAnswer
    .split(/\s*(?:\/|\||\bor\b)\s*/i)
    .map(normalizeChemistryAnswer)
    .filter(Boolean);

  for (const alt of alternatives) {
    if (normStudent === alt) {
      return { score: maxMarks, isCorrect: true, feedback: 'Correct!' };
    }
  }

  // 3. Numerical matching (e.g. expected: "2.5 mol/dm3" or "2.5")
  const studentNumMatch = normStudent.match(/^([+-]?\d+(?:\.\d+)?)(?:\s*([a-z0-9/^-]+))?$/i);
  const expectedNumMatch = normExpected.match(/^([+-]?\d+(?:\.\d+)?)(?:\s*([a-z0-9/^-]+))?$/i);

  if (expectedNumMatch) {
    if (studentNumMatch) {
      const studentVal = parseFloat(studentNumMatch[1]);
      const expectedVal = parseFloat(expectedNumMatch[1]);
      const studentUnit = studentNumMatch[2] || '';
      const expectedUnit = expectedNumMatch[2] || '';

      const numMatch = Math.abs(studentVal - expectedVal) < 0.01;
      if (numMatch) {
        if (!expectedUnit || studentUnit === expectedUnit) {
          return { score: maxMarks, isCorrect: true, feedback: 'Correct numerical value and units.' };
        } else {
          const partial = Math.max(1, Math.floor(maxMarks / 2));
          return {
            score: partial,
            isCorrect: partial === maxMarks,
            feedback: `Correct numerical calculation, but missing or incorrect unit (expected: ${expectedUnit}).`,
          };
        }
      } else {
        // Numerical calculation mismatch: do NOT fall through to keyword matching!
        return {
          score: 0,
          isCorrect: false,
          feedback: `Incorrect numerical value. Expected ${expectedVal}${expectedUnit ? ' ' + expectedUnit : ''}.`,
        };
      }
    } else {
      // Expected is a numerical answer, but student provided non-numeric text
      return {
        score: 0,
        isCorrect: false,
        feedback: `Expected a numerical answer (expected: ${expectedAnswer}).`,
      };
    }
  }


  // 4. Keyword & Concept matching for descriptive chemistry questions
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'has', 'are', 'was',
    'were', 'will', 'which', 'when', 'into', 'than', 'then', 'because', 'what'
  ]);

  const expectedKeywords = Array.from(
    new Set(
      normExpected
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !stopWords.has(w))
    )
  );

  if (expectedKeywords.length > 0) {
    const studentWords = new Set(
      normStudent
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 3)
    );

    let matchCount = 0;
    for (const kw of expectedKeywords) {
      if (studentWords.has(kw) || normStudent.includes(kw)) {
        matchCount++;
      }
    }

    const ratio = matchCount / expectedKeywords.length;

    if (ratio >= 0.75) {
      return { score: maxMarks, isCorrect: true, feedback: 'Accurate and comprehensive answer.' };
    } else if (ratio >= 0.4) {
      const partial = Math.max(1, Math.floor(maxMarks * ratio));
      return {
        score: Math.min(maxMarks, partial),
        isCorrect: false,
        feedback: `Partially correct. Key concepts identified (${matchCount}/${expectedKeywords.length}).`,
      };
    }
  }

  return {
    score: 0,
    isCorrect: false,
    feedback: `Incorrect. Expected answer: ${expectedAnswer}`,
  };
}

/**
 * Safely grades a free-response answer using the two-stage rubric protocol:
 * 1. Deterministic evaluation: if clearly correct or clearly incorrect, returns immediately.
 * 2. Ambiguous / conceptual evaluation: routes to the centralized fail-closed AI Gateway with strict Zod validation.
 * 3. Falls back gracefully to deterministic grading if AI invocation times out or errors.
 */
export async function gradeStructuredAnswerWithAI(
  question: string,
  expectedAnswer: string,
  studentAnswer: string,
  maxMarks = 2,
  uid = 'authoritative-grader',
  markingScheme?: string
): Promise<StructuredRubricEvaluation> {
  const normStudent = normalizeChemistryAnswer(studentAnswer);
  if (!normStudent) {
    return {
      score: 0,
      maxScore: maxMarks,
      correct: false,
      reason: 'No answer was provided.',
      matchedConcepts: [],
      missingConcepts: ['Complete answer'],
      misconceptions: [],
      feedback: 'No answer was provided.',
    };
  }

  // Stage 1: Deterministic evaluation
  const deterministic = gradeStructuredDeterministic(studentAnswer, expectedAnswer, maxMarks);

  // Clearly correct: full marks awarded deterministically
  if (deterministic.isCorrect && deterministic.score === maxMarks) {
    return {
      score: maxMarks,
      maxScore: maxMarks,
      correct: true,
      reason: deterministic.feedback,
      matchedConcepts: ['Matched authoritative chemistry answer key'],
      missingConcepts: [],
      misconceptions: [],
      feedback: deterministic.feedback,
    };
  }

  // Clearly incorrect: expected a numerical answer but student provided non-numeric text
  const numMatch = expectedAnswer.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (numMatch && !studentAnswer.match(/[-+]?[0-9]*\.?[0-9]+/)) {
    return {
      score: 0,
      maxScore: maxMarks,
      correct: false,
      reason: deterministic.feedback,
      matchedConcepts: [],
      missingConcepts: ['Numerical value and correct chemistry unit'],
      misconceptions: ['Provided non-numeric answer for numerical calculation question'],
      feedback: deterministic.feedback,
    };
  }

  // Stage 2: Ambiguous or conceptual answer -> Centralized AI Gateway rubric evaluation
  try {
    return await gradeStructuredRubricWithGateway({
      uid,
      question,
      expectedAnswer,
      markingScheme,
      maximumMarks: maxMarks,
      studentAnswer,
    });
  } catch (err) {
    console.warn('[quizzes] AI Gateway rubric grading unavailable, falling back to deterministic evaluation:', err);
    return {
      score: deterministic.score,
      maxScore: maxMarks,
      correct: deterministic.isCorrect,
      reason: deterministic.feedback,
      matchedConcepts: deterministic.isCorrect ? ['Matched expected answer'] : [],
      missingConcepts: deterministic.isCorrect ? [] : ['Key chemical points'],
      misconceptions: [],
      feedback: deterministic.feedback,
    };
  }
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
  rawQuestions: (AuthoritativeMCQQuestion | AuthoritativeStructuredQuestion)[]
): Promise<{ quizId: string; sanitizedQuestions: ClientSanitizedQuestion[] }> {
  const quizId = `quiz_${Date.now()}_${randomBytes(4).toString('hex')}`;
  const quizRef = adminDb.collection('server_quizzes').doc(quizId);

  const formattedQuestions: (AuthoritativeMCQQuestion | AuthoritativeStructuredQuestion)[] = rawQuestions.map((q) => {
    if (type === 'MCQ') {
      const mcq = q as AuthoritativeMCQQuestion;
      return {
        q: mcq.q,
        options: Array.isArray(mcq.options) ? mcq.options : [],
        answer: typeof mcq.answer === 'number' ? mcq.answer : 0,
        explanation: mcq.explanation || 'No explanation provided.',
      };
    } else {
      const struct = q as AuthoritativeStructuredQuestion;
      return {
        question: struct.question,
        marks: Number(struct.marks) || 2,
        expectedAnswer: struct.expectedAnswer || 'Refer to marking scheme.',
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
 * Saves an authoritative Daily Challenge with explicit challengeDate, daily tag, and user binding.
 */
export async function storeAuthoritativeChallenge(
  uid: string,
  topic: string,
  rawQuestions: AuthoritativeMCQQuestion[],
  challengeDate = getMalaysianDateString()
): Promise<{ challengeId: string; sanitizedQuestions: ClientSanitizedQuestion[] }> {
  const challengeId = `challenge_${challengeDate}_${randomBytes(4).toString('hex')}`;
  const challengeRef = adminDb.collection('server_quizzes').doc(challengeId);

  const formattedQuestions: AuthoritativeMCQQuestion[] = rawQuestions.map((q) => ({
    q: q.q,
    options: Array.isArray(q.options) ? q.options : [],
    answer: typeof q.answer === 'number' ? q.answer : 0,
    explanation: q.explanation || 'Daily Challenge SPM Chemistry question.',
  }));

  await challengeRef.set({
    quizId: challengeId,
    uid,
    topic: `Daily Challenge: ${topic}`,
    difficulty: 'Medium',
    type: 'MCQ',
    isDailyChallenge: true,
    challengeDate,
    enabled: true,
    questions: formattedQuestions,
    createdAt: FieldValue.serverTimestamp(),
  });

  const sanitizedQuestions = sanitizeQuestionsForClient(formattedQuestions, 'MCQ');
  return { challengeId, sanitizedQuestions };
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
      const maxMarks = structured.marks || 2;
      const grading = gradeStructuredDeterministic(
        typeof studentAnswer === 'string' ? studentAnswer : String(studentAnswer || ''),
        structured.expectedAnswer,
        maxMarks
      );

      score += grading.score;

      breakdown.push({
        questionIndex: i,
        question: structured.question,
        selectedOption: studentAnswer !== undefined ? String(studentAnswer) : '',
        expectedAnswer: structured.expectedAnswer,
        isCorrect: grading.isCorrect,
        explanation: grading.feedback || `Expected: ${structured.expectedAnswer}`,
      });
    }
  }

  const maxPossible = type === 'MCQ'
    ? total
    : questions.reduce((sum, q) => sum + ((q as AuthoritativeStructuredQuestion).marks || 2), 0);
  const percentage = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
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

/**
 * Authoritatively grades a Daily Challenge submission.
 * Enforces:
 * 1. The challenge exists and has isDailyChallenge === true
 * 2. User ownership: challenge was created for this user
 * 3. Challenge date matches today in Asia/Kuala_Lumpur
 * 4. Awards daily challenge XP (10 XP) idempotently per Malaysian day
 * 5. Updates authoritative streak
 */
export async function gradeChallengeSubmission(
  challengeId: string,
  uid: string,
  answers: Record<number | string, number | string>
): Promise<QuizGradingResponse> {
  const quizSnap = await adminDb.collection('server_quizzes').doc(challengeId).get();
  if (!quizSnap.exists) {
    throw new Error('Daily challenge not found or expired.');
  }

  const quizData = quizSnap.data() as AuthoritativeQuizDoc & {
    isDailyChallenge?: boolean;
    challengeDate?: string;
  };

  if (!quizData.isDailyChallenge) {
    throw new Error('Invalid challenge: the requested quiz is not a daily challenge.');
  }

  if (quizData.uid && quizData.uid !== uid) {
    throw new Error('Unauthorized: this daily challenge belongs to another user.');
  }

  const todayStr = getMalaysianDateString();
  if (quizData.challengeDate && quizData.challengeDate !== todayStr) {
    throw new Error(`This daily challenge expired on ${quizData.challengeDate}. Please generate today's challenge.`);
  }

  const questions = quizData.questions || [];
  const { score, percentage, total, breakdown } = evaluateQuizAnswers(questions, quizData.type, answers);

  // Authoritatively record result in quiz_results via Admin SDK
  const resultRef = adminDb.collection('quiz_results').doc();
  await resultRef.set({
    uid,
    quizId: challengeId,
    score,
    total,
    percentage,
    topic: quizData.topic,
    isDailyChallenge: true,
    challengeDate: todayStr,
    timestamp: FieldValue.serverTimestamp(),
    answers,
  });

  // Award daily challenge bonus XP with deterministic daily event ID (10 XP per day)
  const challengeXP = await awardXPEvent(uid, 'CHALLENGE', todayStr, 10, {
    challengeId,
    score,
    total,
    date: todayStr,
  });

  // Authoritatively update daily streak
  await updateAuthoritativeStreak(uid);

  return {
    quizId: challengeId,
    score,
    total,
    percentage,
    breakdown,
    xpAwarded: challengeXP.xpAwarded,
    currentXp: challengeXP.currentXp,
    currentLevel: challengeXP.currentLevel,
    levelUp: challengeXP.levelUp,
  };
}

