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
  ADVERSARIAL_CHEMISTRY_DATASET,
} from './data/adversarial-chemistry-dataset';
import { gradeStructuredDeterministic } from '@/lib/server/quizzes';

describe('Adversarial Chemistry Grading Engine Benchmark (Phase 12)', () => {
  it('contains at least 100 diverse chemistry test cases', () => {
    expect(ADVERSARIAL_CHEMISTRY_DATASET.length).toBeGreaterThanOrEqual(100);
  });

  it('covers all essential adversarial and variance categories', () => {
    const categories = new Set(ADVERSARIAL_CHEMISTRY_DATASET.map((tc) => tc.category));
    expect(categories.has('exact_match')).toBe(true);
    expect(categories.has('spelling_variant')).toBe(true);
    expect(categories.has('capitalization')).toBe(true);
    expect(categories.has('unit_variant')).toBe(true);
    expect(categories.has('scientific_notation')).toBe(true);
    expect(categories.has('numerical_rounding')).toBe(true);
    expect(categories.has('equation_permutation')).toBe(true);
    expect(categories.has('wrong_unit')).toBe(true);
    expect(categories.has('wrong_formula')).toBe(true);
    expect(categories.has('misconception')).toBe(true);
    expect(categories.has('irrelevant')).toBe(true);
    expect(categories.has('prompt_injection')).toBe(true);
  });

  it('achieves >= 95% grading accuracy across the full 104-case adversarial benchmark', () => {
    let passedCount = 0;
    const failures: Array<{
      id: string;
      category: string;
      expectedScore: number;
      actualScore: number;
      notes: string;
      feedback: string;
    }> = [];

    for (const tc of ADVERSARIAL_CHEMISTRY_DATASET) {
      const result = gradeStructuredDeterministic(
        tc.studentAnswer,
        tc.expectedAnswer,
        tc.maxMarks
      );

      const isScoreMatching = result.score === tc.expectedDeterministicScore;
      const isCorrectMatching = result.isCorrect === tc.expectedCorrect;

      if (isScoreMatching && isCorrectMatching) {
        passedCount++;
      } else {
        failures.push({
          id: tc.id,
          category: tc.category,
          expectedScore: tc.expectedDeterministicScore,
          actualScore: result.score,
          notes: tc.notes,
          feedback: result.feedback,
        });
      }
    }

    const accuracyRate = (passedCount / ADVERSARIAL_CHEMISTRY_DATASET.length) * 100;
    console.log(
      `[Chemistry Grading Benchmark]: ${passedCount}/${ADVERSARIAL_CHEMISTRY_DATASET.length} passed (${accuracyRate.toFixed(2)}% accuracy).`
    );

    if (failures.length > 0) {
      console.warn('[Benchmark Failures]:', failures);
    }

    // Must exceed the 95% target requirement
    expect(accuracyRate).toBeGreaterThanOrEqual(95);
  });

  describe('Prompt Injection Immunity', () => {
    const injectionCases = ADVERSARIAL_CHEMISTRY_DATASET.filter(
      (tc) => tc.category === 'prompt_injection'
    );

    it('rejects 100% of prompt injection and override attacks deterministically', () => {
      expect(injectionCases.length).toBeGreaterThanOrEqual(10);
      for (const tc of injectionCases) {
        const result = gradeStructuredDeterministic(
          tc.studentAnswer,
          tc.expectedAnswer,
          tc.maxMarks
        );
        expect(result.score).toBe(0);
        expect(result.isCorrect).toBe(false);
      }
    });
  });

  describe('Chemical Equation Permutations', () => {
    const equationCases = ADVERSARIAL_CHEMISTRY_DATASET.filter(
      (tc) => tc.category === 'equation_permutation'
    );

    it('accurately evaluates 100% of equation permutations regardless of reactant/product order', () => {
      expect(equationCases.length).toBeGreaterThanOrEqual(10);
      for (const tc of equationCases) {
        const result = gradeStructuredDeterministic(
          tc.studentAnswer,
          tc.expectedAnswer,
          tc.maxMarks
        );
        expect(result.score).toBe(tc.maxMarks);
        expect(result.isCorrect).toBe(true);
      }
    });
  });

  describe('Scientific Notation & Numerical Tolerance', () => {
    const sciCases = ADVERSARIAL_CHEMISTRY_DATASET.filter(
      (tc) => tc.category === 'scientific_notation' || tc.category === 'numerical_rounding'
    );

    it('accurately recognizes valid scientific notations and numerical variances <= 2%', () => {
      expect(sciCases.length).toBeGreaterThanOrEqual(20);
      for (const tc of sciCases) {
        const result = gradeStructuredDeterministic(
          tc.studentAnswer,
          tc.expectedAnswer,
          tc.maxMarks
        );
        expect(result.score).toBe(tc.maxMarks);
        expect(result.isCorrect).toBe(true);
      }
    });
  });
});
