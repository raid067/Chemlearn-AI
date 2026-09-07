import { enforceAIQuota, refundAIQuota, claimDistributedIdempotency, completeDistributedIdempotency } from '@/lib/server/ai-gateway';

// Transactional state harness that accurately models Firestore transaction serialization
const mockFirestoreStore = new Map<string, Record<string, any>>();

let transactionQueue = Promise.resolve();

jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn((colName: string) => ({
      doc: jest.fn((docId: string) => {
        const fullKey = `${colName}/${docId}`;
        return {
          id: docId,
          path: fullKey,
          get: jest.fn(async () => {
            const data = mockFirestoreStore.get(fullKey);
            return {
              exists: !!data,
              data: () => data || {},
            };
          }),
          set: jest.fn(async (newData: any, options?: { merge?: boolean }) => {
            if (options?.merge && mockFirestoreStore.has(fullKey)) {
              mockFirestoreStore.set(fullKey, { ...mockFirestoreStore.get(fullKey), ...newData });
            } else {
              mockFirestoreStore.set(fullKey, { ...newData });
            }
          }),
          delete: jest.fn(async () => {
            mockFirestoreStore.delete(fullKey);
          }),
        };
      }),
    })),
    runTransaction: jest.fn((updateFunction: (tx: any) => Promise<any>) => {
      const execute = async () => {
        const tx = {
          get: jest.fn(async (docRef: any) => {
            const data = mockFirestoreStore.get(docRef.path);
            return {
              exists: !!data,
              data: () => (data ? { ...data } : {}),
            };
          }),
          set: jest.fn((docRef: any, newData: any, options?: { merge?: boolean }) => {
            if (options?.merge && mockFirestoreStore.has(docRef.path)) {
              mockFirestoreStore.set(docRef.path, { ...mockFirestoreStore.get(docRef.path), ...newData });
            } else {
              mockFirestoreStore.set(docRef.path, { ...newData });
            }
          }),
          update: jest.fn((docRef: any, updates: any) => {
            const current = mockFirestoreStore.get(docRef.path) || {};
            mockFirestoreStore.set(docRef.path, { ...current, ...updates });
          }),
        };
        return await updateFunction(tx);
      };

      const next = transactionQueue.then(execute, execute);
      transactionQueue = next.then(() => {}, () => {});
      return next;
    }),
  },
}));

describe('Phase 4: Quota Concurrency & Transactional Resilience', () => {
  beforeEach(() => {
    mockFirestoreStore.clear();
    jest.clearAllMocks();
  });

  it('simulates 10 concurrent requests within quota: all 10 succeed', async () => {
    const uid = 'student_test_10';
    const promises = Array.from({ length: 10 }, () =>
      enforceAIQuota(uid, 'ai-chat', 50, 'tutor')
    );

    const results = await Promise.all(promises);
    expect(results.length).toBe(10);

    // Verify usage doc accurately recorded 10 requests
    const usageKey = Array.from(mockFirestoreStore.keys()).find((k) => k.startsWith('ai_usage/' + uid));
    expect(usageKey).toBeDefined();
    const usageData = mockFirestoreStore.get(usageKey!)!;
    expect(usageData.totalRequests).toBe(10);
    expect(usageData.task_tutor).toBe(10);
  });

  it('simulates 50 concurrent requests at exact quota boundary: all 50 succeed', async () => {
    const uid = 'student_test_50';
    const quota = 50;
    const promises = Array.from({ length: quota }, () =>
      enforceAIQuota(uid, 'ai-quiz', quota, 'grading')
    );

    const results = await Promise.all(promises);
    expect(results.length).toBe(50);

    const usageKey = Array.from(mockFirestoreStore.keys()).find((k) => k.startsWith('ai_usage/' + uid));
    const usageData = mockFirestoreStore.get(usageKey!)!;
    expect(usageData.totalRequests).toBe(50);
  });

  it('simulates 100 concurrent requests against a 50-limit quota: exactly 50 succeed and 50 fail without overshoot', async () => {
    const uid = 'student_test_100';
    const quota = 50; // Task limit
    const totalRequests = 100;

    const promises = Array.from({ length: totalRequests }, () =>
      enforceAIQuota(uid, 'ai-duel', quota, 'duelGeneration').catch((err) => err)
    );

    const outcomes = await Promise.all(promises);
    const successes = outcomes.filter((r) => r && typeof r.usedToday === 'number');
    const quotaRejections = outcomes.filter((r) => r instanceof Error && r.message.includes('quota'));

    expect(successes.length).toBe(50);
    expect(quotaRejections.length).toBe(50);

    // Verify storage never overshot the quota
    const usageKey = Array.from(mockFirestoreStore.keys()).find((k) => k.startsWith('ai_usage/' + uid));
    const usageData = mockFirestoreStore.get(usageKey!)!;
    expect(usageData.totalRequests).toBe(50);
    expect(usageData.task_duelGeneration).toBe(50);
  });

  it('simulates 200 concurrent requests against a 50-limit quota: exactly 50 succeed, 150 rejected', async () => {
    const uid = 'student_test_200';
    const quota = 50;
    const totalRequests = 200;

    const promises = Array.from({ length: totalRequests }, () =>
      enforceAIQuota(uid, 'ai-flashcards', quota, 'flashcards').catch((err) => err)
    );

    const outcomes = await Promise.all(promises);
    const successes = outcomes.filter((r) => r && typeof r.usedToday === 'number');
    const quotaRejections = outcomes.filter((r) => r instanceof Error && r.message.includes('quota'));

    expect(successes.length).toBe(50);
    expect(quotaRejections.length).toBe(150);

    const usageKey = Array.from(mockFirestoreStore.keys()).find((k) => k.startsWith('ai_usage/' + uid));
    const usageData = mockFirestoreStore.get(usageKey!)!;
    expect(usageData.totalRequests).toBe(50);
  });

  it('verifies quota refund on failed AI operation: restores quota slot without negative overshoot', async () => {
    const uid = 'student_refund_test';
    // Consume 1 quota slot
    const initial = await enforceAIQuota(uid, 'ai-chat', 10, 'tutor');
    expect(initial.usedToday).toBe(1);

    // Simulate failed AI call triggering refund
    await refundAIQuota(uid, 'ai-chat', 'tutor');

    const usageKey = Array.from(mockFirestoreStore.keys()).find((k) => k.startsWith('ai_usage/' + uid));
    const usageData = mockFirestoreStore.get(usageKey!)!;
    expect(usageData.totalRequests).toBe(0);
    expect(usageData.task_tutor).toBe(0);

    // Further refund attempt does not go below 0
    await refundAIQuota(uid, 'ai-chat', 'tutor');
    const safeData = mockFirestoreStore.get(usageKey!)!;
    expect(safeData.totalRequests).toBe(0);
  });

  it('verifies strict cross-user isolation: User A quota exhaustion does not affect User B', async () => {
    const userA = 'student_A';
    const userB = 'student_B';
    const quota = 5;

    // Exhaust User A's quota
    for (let i = 0; i < quota; i++) {
      await enforceAIQuota(userA, 'ai-chat', quota, 'tutor');
    }
    await expect(enforceAIQuota(userA, 'ai-chat', quota, 'tutor')).rejects.toThrow(/quota/i);

    // User B should still have full quota
    const userBResult = await enforceAIQuota(userB, 'ai-chat', quota, 'tutor');
    expect(userBResult.usedToday).toBe(1);
    expect(userBResult.remainingToday).toBe(4);
  });

  it('verifies distributed idempotency claim semantics across concurrent requests', async () => {
    const uid = 'student_idempotency_concurrent';
    const docId = 'distributed_hash_123';

    // First request claims the slot
    const claim1 = await claimDistributedIdempotency(uid, docId, 45000);
    expect(claim1.status).toBe('claimed');

    // Second simultaneous request with same docId sees in_progress
    const claim2 = await claimDistributedIdempotency(uid, docId, 45000);
    expect(claim2.status).toBe('in_progress');

    // First request completes
    await completeDistributedIdempotency(docId, uid, { answer: 'H2SO4' }, 45000);

    // Third request with same docId receives completed cached result
    const claim3 = await claimDistributedIdempotency(uid, docId, 45000);
    expect(claim3.status).toBe('cached');
    expect((claim3 as any).data).toEqual({ answer: 'H2SO4' });
  });
});
