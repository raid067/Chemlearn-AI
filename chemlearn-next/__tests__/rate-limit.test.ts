import { isRateLimited } from '@/lib/rate-limit';

describe('Rate Limiter (Sliding Window & Edge Cases)', () => {
  it('allows requests within limit and blocks requests exceeding limit', () => {
    const bucket = 'test-bucket-' + Date.now();
    const uid = 'user-123';
    const maxRequests = 3;
    const windowMs = 5000;

    expect(isRateLimited(bucket, uid, maxRequests, windowMs)).toBe(false);
    expect(isRateLimited(bucket, uid, maxRequests, windowMs)).toBe(false);
    expect(isRateLimited(bucket, uid, maxRequests, windowMs)).toBe(false);

    // 4th request must be rate-limited
    expect(isRateLimited(bucket, uid, maxRequests, windowMs)).toBe(true);
    // Consecutive duplicate requests remain blocked
    expect(isRateLimited(bucket, uid, maxRequests, windowMs)).toBe(true);
  });

  it('isolates rate limits between different users', () => {
    const bucket = 'user-isolation-' + Date.now();
    const maxRequests = 2;
    const windowMs = 5000;

    expect(isRateLimited(bucket, 'user-a', maxRequests, windowMs)).toBe(false);
    expect(isRateLimited(bucket, 'user-a', maxRequests, windowMs)).toBe(false);
    expect(isRateLimited(bucket, 'user-a', maxRequests, windowMs)).toBe(true);

    expect(isRateLimited(bucket, 'user-b', maxRequests, windowMs)).toBe(false);
    expect(isRateLimited(bucket, 'user-b', maxRequests, windowMs)).toBe(false);
    expect(isRateLimited(bucket, 'user-b', maxRequests, windowMs)).toBe(true);
  });

  it('isolates rate limits between different endpoints', () => {
    const uid = 'user-cross-endpoint';
    const maxRequests = 2;
    const windowMs = 5000;

    const bucketA = 'bucket-quiz-' + Date.now();
    const bucketB = 'bucket-chat-' + Date.now();

    expect(isRateLimited(bucketA, uid, maxRequests, windowMs)).toBe(false);
    expect(isRateLimited(bucketA, uid, maxRequests, windowMs)).toBe(false);
    expect(isRateLimited(bucketA, uid, maxRequests, windowMs)).toBe(true);

    // Bucket B remains open
    expect(isRateLimited(bucketB, uid, maxRequests, windowMs)).toBe(false);
  });
});
