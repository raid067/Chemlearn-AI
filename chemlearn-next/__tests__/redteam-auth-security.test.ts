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

import authBypassBenchmarks from '@/lib/redteam/benchmarks/auth-bypass.json';
import { executeSingleTest } from '@/lib/redteam/runner';
import { TestCase } from '@/lib/redteam/types';

describe('Authentication & Token Bypass Red Team Suite', () => {
  it('contains test cases for missing, expired, and malformed tokens', () => {
    expect(authBypassBenchmarks.length).toBeGreaterThanOrEqual(5);
  });

  it.each(authBypassBenchmarks as TestCase[])(
    'strictly enforces authentication: $name ($id)',
    async (testCase) => {
      const record = await executeSingleTest(testCase);
      expect(record.result).toBe('PASS');
    }
  );

  it('rejects unauthenticated requests with 401 status', async () => {
    const unauthCase = (authBypassBenchmarks as TestCase[]).find(
      (t) => t.id === 'auth-001'
    );
    expect(unauthCase).toBeDefined();
    const record = await executeSingleTest(unauthCase!);
    expect(record.result).toBe('PASS');
    const resp = record.response as { status: number };
    expect(resp.status).toBe(401);
  });

  it('forbids students from accessing admin routes with 403 status', async () => {
    const adminCase = (authBypassBenchmarks as TestCase[]).find(
      (t) => t.id === 'auth-006'
    );
    expect(adminCase).toBeDefined();
    const record = await executeSingleTest(adminCase!);
    expect(record.result).toBe('PASS');
    const resp = record.response as { status: number };
    expect(resp.status).toBe(403);
  });
});
