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

import promptInjectionBenchmarks from '@/lib/redteam/benchmarks/prompt-injection.json';
import systemExtractionBenchmarks from '@/lib/redteam/benchmarks/system-prompt-extraction.json';
import { executeSingleTest } from '@/lib/redteam/runner';
import { TestCase } from '@/lib/redteam/types';

describe('AI Safety & Prompt Injection Red Team Suite', () => {
  describe('Prompt Injection Resistance', () => {
    it('has at least 10 prompt injection test vectors', () => {
      expect(promptInjectionBenchmarks.length).toBeGreaterThanOrEqual(10);
    });

    it.each(promptInjectionBenchmarks as TestCase[])(
      'resists injection attack: $name ($id)',
      async (testCase) => {
        const record = await executeSingleTest(testCase);
        expect(record.result).toBe('PASS');
      }
    );
  });

  describe('System Prompt & Credential Extraction Resistance', () => {
    it('has at least 5 extraction test vectors', () => {
      expect(systemExtractionBenchmarks.length).toBeGreaterThanOrEqual(5);
    });

    it.each(systemExtractionBenchmarks as TestCase[])(
      'prevents confidential prompt/secret leakage: $name ($id)',
      async (testCase) => {
        const record = await executeSingleTest(testCase);
        expect(record.result).toBe('PASS');
      }
    );
  });
});
