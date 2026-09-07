const mockGenerateGeminiText = jest.fn();
const mockGenerateGeminiJson = jest.fn();

const mockFirestoreStore = new Map<string, Record<string, any>>();
let txQueue = Promise.resolve();

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
              data: () => (data ? { ...data } : {}),
            };
          }),
          set: jest.fn(async (data: any, options?: any) => {
            if (options?.merge) {
              const current = mockFirestoreStore.get(fullKey) || {};
              mockFirestoreStore.set(fullKey, { ...current, ...data });
            } else {
              mockFirestoreStore.set(fullKey, { ...data });
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
          set: jest.fn((docRef: any, data: any, options?: any) => {
            if (options?.merge) {
              const current = mockFirestoreStore.get(docRef.path) || {};
              mockFirestoreStore.set(docRef.path, { ...current, ...data });
            } else {
              mockFirestoreStore.set(docRef.path, { ...data });
            }
          }),
        };
        return await updateFunction(tx);
      };

      const next = txQueue.then(execute, execute);
      txQueue = next.then(() => {}, () => {});
      return next;
    }),
  },
}));

jest.mock('@/lib/server/gemini', () => ({
  generateGeminiText: (...args: any[]) => mockGenerateGeminiText(...args),
  generateGeminiJson: (...args: any[]) => mockGenerateGeminiJson(...args),
  GEMINI_MODELS: {
    DEFAULT: 'gemini-3.8-flash',
    LIGHT: 'gemini-3.5-flash-lite',
    FALLBACK: 'gemini-2.5-flash',
  },
}));

import { secureGenerateAI } from '@/lib/server/ai-gateway';

describe('Distributed AI Idempotency Concurrency & User Isolation (Phase 3)', () => {
  beforeEach(() => {
    mockFirestoreStore.clear();
    jest.clearAllMocks();
    mockGenerateGeminiText.mockResolvedValue('Authoritative Chemistry Explanation');
  });

  it('handles 2 simultaneous requests: invokes Gemini once and returns identical response', async () => {
    const promises = [
      secureGenerateAI({
        uid: 'student_1',
        endpoint: 'ai-chat',
        prompt: 'Explain Boyle Law',
        idempotencyKey: 'boyle_key_2',
      }),
      secureGenerateAI({
        uid: 'student_1',
        endpoint: 'ai-chat',
        prompt: 'Explain Boyle Law',
        idempotencyKey: 'boyle_key_2',
      }),
    ];

    const results = await Promise.all(promises);
    expect(results[0]).toBe('Authoritative Chemistry Explanation');
    expect(results[1]).toBe('Authoritative Chemistry Explanation');
    expect(mockGenerateGeminiText).toHaveBeenCalledTimes(1);
  });

  it('handles 10 simultaneous requests: invokes Gemini once and returns identical response', async () => {
    const promises = Array.from({ length: 10 }, () =>
      secureGenerateAI({
        uid: 'student_1',
        endpoint: 'ai-chat',
        prompt: 'Explain Charles Law',
        idempotencyKey: 'charles_key_10',
      })
    );

    const results = await Promise.all(promises);
    expect(results.length).toBe(10);
    results.forEach((r) => expect(r).toBe('Authoritative Chemistry Explanation'));
    expect(mockGenerateGeminiText).toHaveBeenCalledTimes(1);
  });

  it('handles 50 simultaneous requests: invokes Gemini once without race conditions', async () => {
    const promises = Array.from({ length: 50 }, () =>
      secureGenerateAI({
        uid: 'student_1',
        endpoint: 'ai-chat',
        prompt: 'Explain Avogadro Law',
        idempotencyKey: 'avogadro_key_50',
      })
    );

    const results = await Promise.all(promises);
    expect(results.length).toBe(50);
    results.forEach((r) => expect(r).toBe('Authoritative Chemistry Explanation'));
    expect(mockGenerateGeminiText).toHaveBeenCalledTimes(1);
  });

  it('handles 100 simultaneous requests: invokes Gemini exactly once under high load', async () => {
    const promises = Array.from({ length: 100 }, () =>
      secureGenerateAI({
        uid: 'student_1',
        endpoint: 'ai-chat',
        prompt: 'Explain Ideal Gas Law',
        idempotencyKey: 'ideal_gas_key_100',
      })
    );

    const results = await Promise.all(promises);
    expect(results.length).toBe(100);
    results.forEach((r) => expect(r).toBe('Authoritative Chemistry Explanation'));
    expect(mockGenerateGeminiText).toHaveBeenCalledTimes(1);
  });

  it('strictly isolates users: User A and User B using same idempotencyKey do not collide', async () => {
    mockGenerateGeminiText
      .mockResolvedValueOnce('Result for Alice')
      .mockResolvedValueOnce('Result for Bob');

    const [aliceRes, bobRes] = await Promise.all([
      secureGenerateAI({
        uid: 'alice_user',
        endpoint: 'ai-chat',
        prompt: 'Explain Ionic Bonds',
        idempotencyKey: 'shared_key_name',
      }),
      secureGenerateAI({
        uid: 'bob_user',
        endpoint: 'ai-chat',
        prompt: 'Explain Ionic Bonds',
        idempotencyKey: 'shared_key_name',
      }),
    ]);

    expect(aliceRes).toBe('Result for Alice');
    expect(bobRes).toBe('Result for Bob');
    expect(mockGenerateGeminiText).toHaveBeenCalledTimes(2);
  });

  it('recovers from failed generation: does not permanently poison idempotency key', async () => {
    mockGenerateGeminiText
      .mockRejectedValueOnce(new Error('Transient Gemini Outage'))
      .mockResolvedValueOnce('Recovered Explanation');

    await expect(
      secureGenerateAI({
        uid: 'student_retry',
        endpoint: 'ai-chat',
        prompt: 'Explain Covalent Bonds',
        idempotencyKey: 'covalent_retry_key',
      })
    ).rejects.toThrow();

    const retryResult = await secureGenerateAI({
      uid: 'student_retry',
      endpoint: 'ai-chat',
      prompt: 'Explain Covalent Bonds',
      idempotencyKey: 'covalent_retry_key',
    });

    expect(retryResult).toBe('Recovered Explanation');
    expect(mockGenerateGeminiText).toHaveBeenCalledTimes(2);
  });
});