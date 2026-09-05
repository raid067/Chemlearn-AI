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
import { calculateLevel, LEVEL_THRESHOLDS } from '@/lib/server/gamification';

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
    it('computes correct gamification levels across all 10 authoritative tiers', () => {
      // Level 1: 0 - 499
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(499)).toBe(1);

      // Level 2: 500 - 1,199
      expect(calculateLevel(500)).toBe(2);
      expect(calculateLevel(1199)).toBe(2);

      // Level 3: 1,200 - 2,199
      expect(calculateLevel(1200)).toBe(3);
      expect(calculateLevel(2199)).toBe(3);

      // Level 4: 2,200 - 3,499
      expect(calculateLevel(2200)).toBe(4);
      expect(calculateLevel(3499)).toBe(4);

      // Level 5: 3,500 - 4,999
      expect(calculateLevel(3500)).toBe(5);
      expect(calculateLevel(4999)).toBe(5);

      // Level 6: 5,000 - 6,799
      expect(calculateLevel(5000)).toBe(6);
      expect(calculateLevel(6799)).toBe(6);

      // Level 7: 6,800 - 8,799
      expect(calculateLevel(6800)).toBe(7);
      expect(calculateLevel(8799)).toBe(7);

      // Level 8: 8,800 - 10,999
      expect(calculateLevel(8800)).toBe(8);
      expect(calculateLevel(10999)).toBe(8);

      // Level 9: 11,000 - 13,999
      expect(calculateLevel(11000)).toBe(9);
      expect(calculateLevel(13999)).toBe(9);

      // Level 10: 14,000+
      expect(calculateLevel(14000)).toBe(10);
      expect(calculateLevel(50000)).toBe(10);
    });

    it('exposes a monotonic 10-tier LEVEL_THRESHOLDS specification', () => {
      expect(LEVEL_THRESHOLDS).toHaveLength(10);
      for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
        expect(LEVEL_THRESHOLDS[i].minXp).toBeGreaterThan(LEVEL_THRESHOLDS[i + 1].minXp);
        expect(LEVEL_THRESHOLDS[i].level).toBe(LEVEL_THRESHOLDS[i + 1].level + 1);
      }
    });
  });
});
