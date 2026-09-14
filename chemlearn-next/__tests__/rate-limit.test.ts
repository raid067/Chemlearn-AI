jest.mock('@/lib/firebase-admin', () => {
  const store = new Map();
  return {
    adminDb: {
      collection: () => ({
        doc: (id: string) => ({
          get: async () => {
            const data = store.get(id);
            return { exists: !!data, data: () => data };
          },
          set: async (data: any) => {
            store.set(id, data);
          },
          update: async (data: any) => {
            const existing = store.get(id) || {};
            store.set(id, { ...existing, ...data });
          }
        })
      }),
      runTransaction: async (cb: any) => {
        // Simple mock transaction that just passes a mock transaction object
        const mockTransaction = {
          get: async (ref: any) => ref.get(),
          set: (ref: any, data: any) => ref.set(data),
          update: (ref: any, data: any) => ref.update(data),
        };
        return cb(mockTransaction);
      }
    }
  };
});

import { isRateLimited } from '@/lib/rate-limit';

describe('Rate Limiter (Sliding Window & Edge Cases)', () => {
  it('allows requests within limit and blocks requests exceeding limit', async () => {
    const bucket = 'test-bucket-' + Date.now();
    const uid = 'user-123';
    const maxRequests = 3;
    const windowMs = 5000;

    expect(await isRateLimited(bucket, uid, maxRequests, windowMs)).toBe(false);
    expect(await isRateLimited(bucket, uid, maxRequests, windowMs)).toBe(false);
    expect(await isRateLimited(bucket, uid, maxRequests, windowMs)).toBe(false);

    // 4th request must be rate-limited
    expect(await isRateLimited(bucket, uid, maxRequests, windowMs)).toBe(true);
    // Consecutive duplicate requests remain blocked
    expect(await isRateLimited(bucket, uid, maxRequests, windowMs)).toBe(true);
  });

  it('isolates rate limits between different users', async () => {
    const bucket = 'user-isolation-' + Date.now();
    const maxRequests = 2;
    const windowMs = 5000;

    expect(await isRateLimited(bucket, 'user-a', maxRequests, windowMs)).toBe(false);
    expect(await isRateLimited(bucket, 'user-a', maxRequests, windowMs)).toBe(false);
    expect(await isRateLimited(bucket, 'user-a', maxRequests, windowMs)).toBe(true);

    expect(await isRateLimited(bucket, 'user-b', maxRequests, windowMs)).toBe(false);
    expect(await isRateLimited(bucket, 'user-b', maxRequests, windowMs)).toBe(false);
    expect(await isRateLimited(bucket, 'user-b', maxRequests, windowMs)).toBe(true);
  });

  it('isolates rate limits between different endpoints', async () => {
    const uid = 'user-cross-endpoint';
    const maxRequests = 2;
    const windowMs = 5000;

    const bucketA = 'bucket-quiz-' + Date.now();
    const bucketB = 'bucket-chat-' + Date.now();

    expect(await isRateLimited(bucketA, uid, maxRequests, windowMs)).toBe(false);
    expect(await isRateLimited(bucketA, uid, maxRequests, windowMs)).toBe(false);
    expect(await isRateLimited(bucketA, uid, maxRequests, windowMs)).toBe(true);

    // Bucket B remains open
    expect(await isRateLimited(bucketB, uid, maxRequests, windowMs)).toBe(false);
  });
});
