jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
  },
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import {
  normalizeChemistryAnswer,
  gradeStructuredDeterministic,
  evaluateQuizAnswers,
  AuthoritativeStructuredQuestion,
  gradeChallengeSubmission,
} from '@/lib/server/quizzes';
import { adminDb } from '@/lib/firebase-admin';
import { getMalaysianDateString } from '@/lib/server/gamification';

describe('Security Hardening & Authoritative Grading Tests', () => {
  describe('normalizeChemistryAnswer', () => {
    it('normalizes case, whitespace, and punctuation', () => {
      expect(normalizeChemistryAnswer('  Ammonia Gas.  ')).toBe('ammonia gas');
      expect(normalizeChemistryAnswer('Copper(II) sulfate!')).toBe('copper(ii) sulfate');
    });

    it('translates Unicode subscripts and superscripts into standard characters', () => {
      expect(normalizeChemistryAnswer('H₂O')).toBe('h2o');
      expect(normalizeChemistryAnswer('CuSO₄')).toBe('cuso4');
      expect(normalizeChemistryAnswer('Fe²⁺')).toBe('fe2+');
    });

    it('normalizes common chemistry concentration and volume units', () => {
      expect(normalizeChemistryAnswer('1.5 mol dm⁻³')).toBe('1.5 mol/dm3');
      expect(normalizeChemistryAnswer('25 cm³')).toBe('25 cm3');
      expect(normalizeChemistryAnswer('1.2 g/cm³')).toBe('1.2 g/cm3');
    });
  });

  describe('gradeStructuredDeterministic', () => {
    it('strictly awards 0 marks for empty, null, or whitespace answers', () => {
      expect(gradeStructuredDeterministic('', 'Ammonia', 2).score).toBe(0);
      expect(gradeStructuredDeterministic('   ', 'Ammonia', 2).score).toBe(0);
      expect(gradeStructuredDeterministic('...', 'Ammonia', 2).score).toBe(0);
    });

    it('awards full marks for exact or normalized match', () => {
      const res = gradeStructuredDeterministic('ammonia', 'Ammonia', 2);
      expect(res.score).toBe(2);
      expect(res.isCorrect).toBe(true);
    });

    it('awards full marks when student matches one of multiple accepted alternatives', () => {
      const rubric = 'Copper(II) oxide / CuO | copper oxide';
      expect(gradeStructuredDeterministic('CuO', rubric, 2).score).toBe(2);
      expect(gradeStructuredDeterministic('copper(ii) oxide', rubric, 2).score).toBe(2);
      expect(gradeStructuredDeterministic('copper oxide', rubric, 2).score).toBe(2);
    });

    it('accurately evaluates numerical calculations and unit awareness', () => {
      const rubric = '2.5 mol/dm3';
      // Correct value + correct unit -> full marks
      const full = gradeStructuredDeterministic('2.5 mol/dm3', rubric, 2);
      expect(full.score).toBe(2);
      expect(full.isCorrect).toBe(true);

      // Correct value but missing/mismatched unit -> partial marks
      const partial = gradeStructuredDeterministic('2.5', rubric, 2);
      expect(partial.score).toBe(1);
      expect(partial.feedback).toContain('missing or incorrect unit');

      // Incorrect numerical value -> 0 marks
      const wrong = gradeStructuredDeterministic('3.5 mol/dm3', rubric, 2);
      expect(wrong.score).toBe(0);
      expect(wrong.isCorrect).toBe(false);
    });

    it('awards partial marks for concept/keyword matches on descriptive questions', () => {
      const rubric = 'Electrons are transferred from sodium to chlorine forming ionic bond';
      const student = 'Sodium transfers electrons to chlorine';
      const res = gradeStructuredDeterministic(student, rubric, 3);
      expect(res.score).toBeGreaterThan(0);
    });

    it('awards 0 marks for completely unrelated nonsense answers', () => {
      const rubric = 'The precipitate formed is lead(II) iodide';
      const student = 'The sun rises in the east and sets in the west';
      const res = gradeStructuredDeterministic(student, rubric, 2);
      expect(res.score).toBe(0);
      expect(res.isCorrect).toBe(false);
    });
  });

  describe('evaluateQuizAnswers with Structured Questions (Anti-Cheat Validation)', () => {
    const structuredQuestions: AuthoritativeStructuredQuestion[] = [
      {
        question: 'State the name of the gas released when zinc reacts with hydrochloric acid.',
        marks: 2,
        expectedAnswer: 'Hydrogen gas / H2',
      },
      {
        question: 'Calculate the concentration of NaOH in mol/dm3.',
        marks: 2,
        expectedAnswer: '0.5 mol/dm3',
      },
    ];

    it('does NOT award unconditional marks for non-empty answers (closes cheat exploit)', () => {
      // Prior vulnerability: Any non-empty string used to receive full marks!
      const garbageAnswers = {
        0: 'asdfghjkl',
        1: 'random text',
      };

      const result = evaluateQuizAnswers(structuredQuestions, 'Structured', garbageAnswers);
      expect(result.score).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.breakdown[0].isCorrect).toBe(false);
      expect(result.breakdown[1].isCorrect).toBe(false);
    });

    it('accurately scores correct structured submissions', () => {
      const validAnswers = {
        0: 'Hydrogen gas',
        1: '0.5 mol/dm3',
      };

      const result = evaluateQuizAnswers(structuredQuestions, 'Structured', validAnswers);
      expect(result.score).toBe(4);
      expect(result.percentage).toBe(100);
      expect(result.breakdown[0].isCorrect).toBe(true);
      expect(result.breakdown[1].isCorrect).toBe(true);
    });
  });

  describe('Daily Challenge Hardening (gradeChallengeSubmission)', () => {
    const mockUid = 'student-test-123';
    const mockChallengeId = 'challenge_2026-09-05_abcdef';
    const todayStr = getMalaysianDateString();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('rejects submissions if the quiz document is not marked as isDailyChallenge', async () => {
      const mockDoc = {
        exists: true,
        data: () => ({
          quizId: mockChallengeId,
          uid: mockUid,
          isDailyChallenge: false, // NOT a daily challenge
          challengeDate: todayStr,
          type: 'MCQ',
          questions: [],
        }),
      };

      (adminDb.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc),
        }),
      });

      await expect(
        gradeChallengeSubmission(mockChallengeId, mockUid, {})
      ).rejects.toThrow('Invalid challenge: the requested quiz is not a daily challenge.');
    });

    it('rejects submissions if the challenge belongs to another user', async () => {
      const mockDoc = {
        exists: true,
        data: () => ({
          quizId: mockChallengeId,
          uid: 'different-student-999', // Owner mismatch!
          isDailyChallenge: true,
          challengeDate: todayStr,
          type: 'MCQ',
          questions: [],
        }),
      };

      (adminDb.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc),
        }),
      });

      await expect(
        gradeChallengeSubmission(mockChallengeId, mockUid, {})
      ).rejects.toThrow('Unauthorized: this daily challenge belongs to another user.');
    });

    it('rejects submissions if the challenge has expired (different date)', async () => {
      const mockDoc = {
        exists: true,
        data: () => ({
          quizId: mockChallengeId,
          uid: mockUid,
          isDailyChallenge: true,
          challengeDate: '2026-01-01', // Expired!
          type: 'MCQ',
          questions: [],
        }),
      };

      (adminDb.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc),
        }),
      });

      await expect(
        gradeChallengeSubmission(mockChallengeId, mockUid, {})
      ).rejects.toThrow('This daily challenge expired on 2026-01-01');
    });
  });
});
