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

import chemistryAccuracyBenchmarks from '@/lib/redteam/benchmarks/chemistry-accuracy.json';
import markingBenchmarks from '@/lib/redteam/benchmarks/marking.json';
import { executeSingleTest } from '@/lib/redteam/runner';
import { TestCase } from '@/lib/redteam/types';

describe('SPM Chemistry Accuracy & AI Marking Red Team Suite', () => {
  describe('KSSM Form 4 & Form 5 Benchmark Coverage', () => {
    it('covers all Form 4 Chapters 1 through 8', () => {
      const f4Chapters = new Set(
        chemistryAccuracyBenchmarks
          .filter((t) => t.metadata?.form === 4)
          .map((t) => t.metadata?.chapter)
      );
      for (let ch = 1; ch <= 8; ch++) {
        expect(f4Chapters.has(ch)).toBe(true);
      }
    });

    it('covers Form 5 Chapters 1 through 5', () => {
      const f5Chapters = new Set(
        chemistryAccuracyBenchmarks
          .filter((t) => t.metadata?.form === 5)
          .map((t) => t.metadata?.chapter)
      );
      for (let ch = 1; ch <= 5; ch++) {
        expect(f5Chapters.has(ch)).toBe(true);
      }
    });

    it('benchmarks both English and Bahasa Melayu questions', () => {
      const languages = new Set(
        chemistryAccuracyBenchmarks.map((t) => t.metadata?.language)
      );
      expect(languages.has('English')).toBe(true);
      expect(languages.has('Bahasa Melayu')).toBe(true);
    });

    it.each(chemistryAccuracyBenchmarks as TestCase[])(
      'passes SPM accuracy benchmark: $name ($id)',
      async (testCase) => {
        const record = await executeSingleTest(testCase);
        expect(record.result).toBe('PASS');
      }
    );
  });

  describe('AI Marking Tiers & Trick Answers', () => {
    it('correctly grades full mark, partial mark, zero mark, and trick answers', async () => {
      for (const tc of markingBenchmarks as TestCase[]) {
        const record = await executeSingleTest(tc);
        expect(record.result).toBe('PASS');
      }
    });

    it('identifies and penalizes trick answers violating SPM mark scheme', async () => {
      const trickTests = (markingBenchmarks as TestCase[]).filter(
        (tc) => tc.metadata?.trickAnswer
      );
      expect(trickTests.length).toBeGreaterThanOrEqual(3);

      for (const tc of trickTests) {
        const record = await executeSingleTest(tc);
        expect(record.result).toBe('PASS');
        // Trick answers must result in 0 score awarded
        const resp = record.response as { awardedScore: number };
        expect(resp.awardedScore).toBe(0);
      }
    });
  });
});
