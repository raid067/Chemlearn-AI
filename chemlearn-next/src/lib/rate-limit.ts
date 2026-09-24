/**
 * Production-Grade Distributed Rate Limiter for ChemLearn AI.
 * 
 * Powered by Upstash Redis and @upstash/ratelimit for distributed, multi-instance
 * rate limiting across auto-scaling serverless environments (Firebase App Hosting / Vercel).
 * 
 * Includes:
 * - Distributed sliding-window algorithm backed by Upstash Redis.
 * - Tiered rate limits (Strict for AI, Moderate for mutations, Relaxed for sync).
 * - Multi-tenant identification (UID or Client IP extraction).
 * - Strict fail-closed defense for expensive AI endpoints in production.
 * - Resilient, isolated in-memory sliding window fallback for local development and test environments.
 */

import type { Redis } from '@upstash/redis';
import type { Ratelimit } from '@upstash/ratelimit';

// --- In-Memory Fallback Storage ---
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryLimiters = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Reset memory limiters (primarily for unit tests).
 */
export function resetMemoryLimiters(): void {
  memoryLimiters.clear();
}

/**
 * Synchronous in-memory sliding-window rate limiter.
 * Used for development fallback and synchronous callers.
 */
export function isRateLimited(
  key: string,
  uid: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): boolean {
  if (!memoryLimiters.has(key)) {
    memoryLimiters.set(key, new Map());
  }

  const bucket = memoryLimiters.get(key)!;
  const now = Date.now();
  const entry = bucket.get(uid);

  if (!entry || now >= entry.resetAt) {
    bucket.set(uid, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return true;
  }

  return false;
}

// --- Rate Limit Error Definition ---
export class RateLimitError extends Error {
  statusCode: number;
  code: string;

  constructor(
    message = 'Rate limiting service temporarily unavailable.',
    statusCode = 503,
    code = 'RATE_LIMIT_UNAVAILABLE'
  ) {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface RateLimitOptions {
  failClosedInProduction?: boolean;
}

// --- Rate Limiting Tiers ---
export const RATE_LIMIT_TIERS = {
  STRICT: { maxRequests: 15, windowMs: 60_000, name: 'strict-ai' },       // Gemini inference
  MODERATE: { maxRequests: 30, windowMs: 60_000, name: 'moderate-mut' },  // Quizzes, Challenges, Classes
  RELAXED: { maxRequests: 60, windowMs: 60_000, name: 'relaxed-sync' },   // State sync, Leaderboard reads
} as const;

// --- Client IP Extraction Helper ---
/**
 * Safely extracts client IP address from request headers with multi-proxy support.
 */
export function getClientIp(req: Request | { headers: Headers }): string {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      const firstIp = forwarded.split(',')[0].trim();
      if (firstIp) return firstIp;
    }

    const realIp = req.headers.get('x-real-ip');
    if (realIp && realIp.trim()) {
      return realIp.trim();
    }

    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    if (cfConnectingIp && cfConnectingIp.trim()) {
      return cfConnectingIp.trim();
    }
  } catch {
    // Non-fatal header parsing error
  }

  return '127.0.0.1';
}

// --- Upstash Redis & Ratelimit Singletons ---
let redisClient: Redis | null = null;
const ratelimitInstances = new Map<string, Ratelimit>();

export function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!redisClient) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis: UpstashRedis } = require('@upstash/redis');
    redisClient = new UpstashRedis({
      url,
      token,
    });
  }
  return redisClient;
}

/**
 * Resets the cached Redis client and ratelimit instances.
 * Useful for switching environment variables during tests.
 */
export function resetRedisClient(): void {
  redisClient = null;
  ratelimitInstances.clear();
}

/**
 * Helper to obtain or instantiate an Upstash Ratelimit instance with sliding window.
 */
function getUpstashRatelimit(key: string, maxRequests: number, windowMs: number): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;

  const instanceKey = `${key}:${maxRequests}:${windowMs}`;
  let instance = ratelimitInstances.get(instanceKey);

  if (!instance) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Ratelimit: UpstashRatelimit } = require('@upstash/ratelimit');
    // Format windowMs to a human-readable duration accepted by Upstash (e.g. '60000 ms')
    const windowFormatted = `${windowMs} ms` as `${number} ms`;
    instance = new UpstashRatelimit({
      redis,
      limiter: UpstashRatelimit.slidingWindow(maxRequests, windowFormatted),
      prefix: `@chemlearn:ratelimit:${key}`,
      analytics: false,
    });
    ratelimitInstances.set(instanceKey, instance as Ratelimit);
  }

  return instance || null;
}

/**
 * Distributed rate limiter supporting Upstash Redis when configured.
 * 
 * - In production: Sensitive endpoints can enforce fail-closed behavior (503 RATE_LIMIT_UNAVAILABLE)
 *   if Redis is unconfigured or unreachable, eliminating unmetered LLM resource draining.
 * - In dev/test: Gracefully falls back to isolated in-memory sliding-window limiter.
 * 
 * @param key - The rate limit bucket identifier (e.g. 'ai-chat', 'quiz-submit')
 * @param identifier - Unique identifier: user UID or client IP
 * @param maxRequests - Maximum requests allowed per window
 * @param windowMs - Time window in milliseconds (default: 60,000 ms)
 * @param options - Fail-closed options for production security
 * @returns true if the request is RATE LIMITED (blocked), false if allowed
 */
export async function isRateLimitedAsync(
  key: string,
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60_000,
  options: RateLimitOptions = {}
): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === 'production';
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Fail-closed guard: in production, sensitive operations must reject if rate limiting credentials are missing
  if (isProduction && options.failClosedInProduction && (!url || !token)) {
    throw new RateLimitError(
      'Rate limiting service is unconfigured or unavailable in production. Rejecting request to protect AI infrastructure.',
      503,
      'RATE_LIMIT_UNAVAILABLE'
    );
  }

  // If Upstash credentials are not provided (e.g. local dev / test), use in-memory fallback
  if (!url || !token) {
    return isRateLimited(key, identifier, maxRequests, windowMs);
  }

  try {
    const ratelimit = getUpstashRatelimit(key, maxRequests, windowMs);
    if (!ratelimit) {
      if (isProduction && options.failClosedInProduction) {
        throw new RateLimitError(
          'Failed to initialize distributed rate limiter in production.',
          503,
          'RATE_LIMIT_UNAVAILABLE'
        );
      }
      return isRateLimited(key, identifier, maxRequests, windowMs);
    }

    const result = await ratelimit.limit(identifier);

    // Upstash Ratelimit returns success: false if request exceeds limit
    return !result.success;
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      throw err;
    }

    if (isProduction && options.failClosedInProduction) {
      throw new RateLimitError(
        'Rate limiting service exception in production. Rejecting request to protect AI infrastructure.',
        503,
        'RATE_LIMIT_UNAVAILABLE'
      );
    }

    console.warn('[rate-limit] Distributed limiter exception, using in-memory fallback:', err);
    return isRateLimited(key, identifier, maxRequests, windowMs);
  }
}

/** Maximum allowed base64 payload size in bytes (5MB) */
export const MAX_IMAGE_PAYLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Validates a base64 image payload size.
 * @returns error message if too large, null if OK
 */
export function validateImagePayload(base64: string | undefined): string | null {
  if (!base64) return null;
  // Base64 string length is roughly 4/3 of the binary size
  const estimatedBytes = (base64.length * 3) / 4;
  if (estimatedBytes > MAX_IMAGE_PAYLOAD_BYTES) {
    return `Image payload too large (${Math.round(estimatedBytes / 1024 / 1024)}MB). Maximum is 5MB.`;
  }
  return null;
}
