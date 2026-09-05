jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn(),
  },
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import {
  sanitizeQuestionsForClient,
  evaluateQuizAnswers,
  AuthoritativeMCQQuestion,
} from '@/lib/server/quizzes';
import { calculateLevel } from '@/lib/server/gamification';

describe('Anti-Cheat & Authoritative Evaluation Logic', () => {
  const sampleServerQuestions: AuthoritativeMCQQuestion[] = [
    {
      q: 'Which of the following is a transition element?',
      options: ['Iron', 'Sodium', 'Calcium', 'Aluminium'],
      answer: 0,
      explanation: 'Iron (Fe) is in the d-block and is a transition metal.',
    },
    {
      q: 'What is the color of Fe2+ ions in aqueous solution?',
      options: ['Brown', 'Green', 'Blue', 'Yellow'],
      answer: 1,
      explanation: 'Fe2+ displays a pale green color in aqueous solutions.',
    },
  ];

  describe('sanitizeQuestionsForClient', () => {
    it('strips secret answers and explanations before client transmission', () => {
      const sanitized = sanitizeQuestionsForClient(sampleServerQuestions, 'MCQ');

      expect(sanitized).toHaveLength(2);
      sanitized.forEach((q, idx) => {
        expect((q as any).answer).toBeUndefined();
        expect((q as any).explanation).toBeUndefined();
        expect(q.index).toBe(idx);
        expect(q.question).toBeDefined();
        if (q.type === 'MCQ') {
          expect(q.options).toHaveLength(4);
        }
      });
    });
  });

  describe('evaluateQuizAnswers', () => {
    it('accurately calculates 100% score when all answers match server key', () => {
      const submission = {
        0: 0, // Iron
        1: 1, // Green
      };

      const result = evaluateQuizAnswers(sampleServerQuestions, 'MCQ', submission);
      expect(result.score).toBe(2);
      expect(result.percentage).toBe(100);
      expect(result.total).toBe(2);
      expect(result.breakdown[0].isCorrect).toBe(true);
      expect(result.breakdown[1].isCorrect).toBe(true);
    });

    it('accurately calculates partial score and marks incorrect answers', () => {
      const submission = {
        0: 0, // Iron (correct)
        1: 0, // Brown (incorrect, answer is 1)
      };

      const result = evaluateQuizAnswers(sampleServerQuestions, 'MCQ', submission);
      expect(result.score).toBe(1);
      expect(result.percentage).toBe(50);
      expect(result.breakdown[1].isCorrect).toBe(false);
      expect(result.breakdown[1].selectedOption).toBe(0);
    });

    it('handles empty submission gracefully without throwing', () => {
      const result = evaluateQuizAnswers(sampleServerQuestions, 'MCQ', {});
      expect(result.score).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.breakdown[0].isCorrect).toBe(false);
      expect(result.breakdown[1].isCorrect).toBe(false);
    });
  });

  describe('calculateLevel', () => {
    it('computes correct gamification levels based on authoritative thresholds', () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(499)).toBe(1);
      expect(calculateLevel(500)).toBe(2);
      expect(calculateLevel(1199)).toBe(2);
      expect(calculateLevel(1200)).toBe(3);
      expect(calculateLevel(2500)).toBe(4);
      expect(calculateLevel(5000)).toBe(5);
      expect(calculateLevel(10000)).toBe(10);
      expect(calculateLevel(50000)).toBe(10);
    });
  });
});
