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

import hallucinationBenchmarks from '@/lib/redteam/benchmarks/hallucination.json';
import { executeSingleTest } from '@/lib/redteam/runner';
import { TestCase } from '@/lib/redteam/types';

describe('Chemistry Hallucination & False Premise Red Team Suite', () => {
  it('contains tests for fictional compounds, impossible reactions, and syllabus boundaries', () => {
    expect(hallucinationBenchmarks.length).toBeGreaterThanOrEqual(5);
  });

  it.each(hallucinationBenchmarks as TestCase[])(
    'flags invalid chemistry premise rather than hallucinating: $name ($id)',
    async (testCase) => {
      const record = await executeSingleTest(testCase);
      expect(record.result).toBe('PASS');
    }
  );

  it('specifically rejects fictional compounds like krypton(IV) hydroxide', async () => {
    const fictionalCase = (hallucinationBenchmarks as TestCase[]).find(
      (t) => t.id === 'hal-001'
    );
    expect(fictionalCase).toBeDefined();
    const record = await executeSingleTest(fictionalCase!);
    expect(record.result).toBe('PASS');
    const respStr = typeof record.response === 'string' ? record.response : JSON.stringify(record.response);
    expect(respStr.toLowerCase()).toContain('does not exist');
  });
});
