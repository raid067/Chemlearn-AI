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

import apiAbuseBenchmarks from '@/lib/redteam/benchmarks/api-abuse.json';
import { executeSingleTest } from '@/lib/redteam/runner';
import { TestCase } from '@/lib/redteam/types';

describe('API Abuse & Rate Limit Resistance Red Team Suite', () => {
  it('contains test cases for payload tampering, oversized bodies, and rate limits', () => {
    expect(apiAbuseBenchmarks.length).toBeGreaterThanOrEqual(6);
  });

  it.each(apiAbuseBenchmarks as TestCase[])(
    'resists abuse vector: $name ($id)',
    async (testCase) => {
      const record = await executeSingleTest(testCase);
      expect(record.result).toBe('PASS');
    }
  );

  it('triggers 429 Too Many Requests when hit with rapid bursts', async () => {
    const burstCase = (apiAbuseBenchmarks as TestCase[]).find(
      (t) => t.id === 'abuse-007'
    );
    expect(burstCase).toBeDefined();
    const record = await executeSingleTest(burstCase!);
    expect(record.result).toBe('PASS');
    const resp = record.response as { status: number };
    expect(resp.status).toBe(429);
  });
});
