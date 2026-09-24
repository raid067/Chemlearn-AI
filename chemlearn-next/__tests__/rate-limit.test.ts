import {
  isRateLimited,
  isRateLimitedAsync,
  RateLimitError,
  RATE_LIMIT_TIERS,
  getClientIp,
  resetMemoryLimiters,
  resetRedisClient,
} from '@/lib/rate-limit';

// Mock Upstash Ratelimit and Redis
const mockLimit = jest.fn();
const mockSlidingWindow = jest.fn().mockReturnValue('mock-limiter');

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@upstash/ratelimit', () => {
  const MockRatelimit = jest.fn().mockImplementation((config) => ({
    limit: mockLimit,
    limiter: config.limiter,
    prefix: config.prefix,
  }));
  (MockRatelimit as unknown as { slidingWindow: typeof mockSlidingWindow }).slidingWindow = mockSlidingWindow;
  return {
    Ratelimit: MockRatelimit,
  };
});

describe('Rate Limiter Test Suite', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    resetMemoryLimiters();
    resetRedisClient();
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Synchronous In-Memory Limiter', () => {
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

  describe('Multi-Tenant Client IP Extraction', () => {
    it('extracts IP from x-forwarded-for header (first IP in chain)', () => {
      const req = {
        headers: new Headers({
          'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
        }),
      };
      expect(getClientIp(req)).toBe('203.0.113.195');
    });

    it('extracts IP from x-real-ip when x-forwarded-for is missing', () => {
      const req = {
        headers: new Headers({
          'x-real-ip': '198.51.100.42',
        }),
      };
      expect(getClientIp(req)).toBe('198.51.100.42');
    });

    it('extracts IP from cf-connecting-ip (Cloudflare edge)', () => {
      const req = {
        headers: new Headers({
          'cf-connecting-ip': '192.0.2.1',
        }),
      };
      expect(getClientIp(req)).toBe('192.0.2.1');
    });

    it('falls back to 127.0.0.1 when no proxy headers are provided', () => {
      const req = {
        headers: new Headers(),
      };
      expect(getClientIp(req)).toBe('127.0.0.1');
    });
  });

  describe('Tiered Policy Configurations', () => {
    it('defines strict, moderate, and relaxed tiers', () => {
      expect(RATE_LIMIT_TIERS.STRICT.maxRequests).toBe(15);
      expect(RATE_LIMIT_TIERS.MODERATE.maxRequests).toBe(30);
      expect(RATE_LIMIT_TIERS.RELAXED.maxRequests).toBe(60);
    });
  });

  function setNodeEnv(env: string) {
    (process.env as Record<string, string | undefined>).NODE_ENV = env;
  }

  describe('Asynchronous Limiter & Production Fail-Closed Behavior', () => {
    it('falls back to in-memory rate limiter when Upstash credentials are missing in development', async () => {
      setNodeEnv('development');
      const key = 'dev-test-' + Date.now();
      const uid = 'dev-user';

      const res1 = await isRateLimitedAsync(key, uid, 2, 5000);
      const res2 = await isRateLimitedAsync(key, uid, 2, 5000);
      const res3 = await isRateLimitedAsync(key, uid, 2, 5000);

      expect(res1).toBe(false);
      expect(res2).toBe(false);
      expect(res3).toBe(true);
    });

    it('throws RateLimitError (503) in production when failClosedInProduction is true and Upstash is unconfigured', async () => {
      setNodeEnv('production');

      await expect(
        isRateLimitedAsync('ai-chat', 'prod-user', 10, 60_000, { failClosedInProduction: true })
      ).rejects.toThrow(RateLimitError);

      try {
        await isRateLimitedAsync('ai-chat', 'prod-user', 10, 60_000, { failClosedInProduction: true });
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).statusCode).toBe(503);
        expect((err as RateLimitError).code).toBe('RATE_LIMIT_UNAVAILABLE');
      }
    });

    it('uses Upstash Ratelimit when configured and permits requests when within limit', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://mock-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token';

      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60_000,
      });

      const blocked = await isRateLimitedAsync('ai-chat', 'user-456', 10, 60_000);
      expect(blocked).toBe(false);
      expect(mockLimit).toHaveBeenCalledWith('user-456');
    });

    it('blocks request when Upstash Ratelimit returns success: false', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://mock-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token';

      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60_000,
      });

      const blocked = await isRateLimitedAsync('ai-chat', 'abusive-user', 10, 60_000);
      expect(blocked).toBe(true);
    });

    it('throws RateLimitError in production if Upstash throws and failClosedInProduction is set', async () => {
      setNodeEnv('production');
      process.env.UPSTASH_REDIS_REST_URL = 'https://mock-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token';

      mockLimit.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(
        isRateLimitedAsync('ai-chat', 'user-fail', 10, 60_000, { failClosedInProduction: true })
      ).rejects.toThrow(RateLimitError);
    });

    it('gracefully falls back to in-memory in development if Upstash throws an exception', async () => {
      setNodeEnv('development');
      process.env.UPSTASH_REDIS_REST_URL = 'https://mock-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token';

      mockLimit.mockRejectedValueOnce(new Error('Network timeout'));

      // Should fall back to in-memory and allow the first request
      const blocked = await isRateLimitedAsync('ai-chat-fallback', 'user-fallback', 2, 5000);
      expect(blocked).toBe(false);
    });
  });
});
