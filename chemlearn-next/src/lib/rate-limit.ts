/**
 * Distributed rate limiter for API routes.
 * 
 * NOTE: For production at scale, consider Redis or Firestore-based rate limiting.
 * This file replaces the old in-memory per-instance sliding window with a
 * centralized distributed limiter (Firestore with TTL) fallback,
 * protecting against rapid-fire abuse.
 */
import { adminDb } from '@/lib/firebase-admin';

/**
 * Fallback rate limiter using Cloud Firestore.
 * Supports TTL index on `resetAt` field if configured.
 */
async function firestoreFallbackRateLimiter(
  key: string,
  uid: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const docRef = adminDb.collection('rate_limits').doc(`${key}_${uid}`);
  const now = Date.now();

  try {
    return await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);

      if (!doc.exists) {
        transaction.set(docRef, {
          count: 1,
          resetAt: new Date(now + windowMs),
        });
        return false;
      }

      const data = doc.data()!;
      const resetAt = data.resetAt?.toMillis ? data.resetAt.toMillis() : (data.resetAt || 0);

      if (now >= resetAt) {
        transaction.set(docRef, {
          count: 1,
          resetAt: new Date(now + windowMs),
        });
        return false;
      }

      const newCount = (data.count || 0) + 1;
      transaction.update(docRef, { count: newCount });

      return newCount > maxRequests;
    });
  } catch (err) {
    console.error('[rate-limit] Firestore fallback transaction failed:', err);
    // Fail closed on error if we can't verify rate limits
    return true;
  }
}

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

/**
 * Distributed rate limiter supporting Upstash Redis REST API when configured.
 * In production, sensitive AI endpoints can enforce fail-closed behavior (503 RATE_LIMIT_UNAVAILABLE)
 * if Redis is unreachable, preventing unmetered LLM resource consumption.
 * In development or testing, automatically falls back to in-memory sliding window limiter.
 * @returns true if the request should be BLOCKED, false if allowed
 */
export async function isRateLimited(
  key: string,
  uid: string,
  maxRequests: number = 10,
  windowMs: number = 60_000,
  options: RateLimitOptions = {}
): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === 'production';
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Fail-closed guard: in production, sensitive operations must reject if rate limiting is absent
  if (isProduction && options.failClosedInProduction && (!upstashUrl || !upstashToken)) {
    throw new RateLimitError(
      'Rate limiting service is unconfigured or unavailable in production. Rejecting request to protect AI infrastructure.',
      503,
      'RATE_LIMIT_UNAVAILABLE'
    );
  }

  if (!upstashUrl || !upstashToken) {
    return await firestoreFallbackRateLimiter(key, uid, maxRequests, windowMs);
  }

  try {
    const redisKey = `ratelimit:${key}:${uid}`;
    const response = await fetch(`${upstashUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', redisKey],
        ['PTTL', redisKey],
      ]),
      cache: 'no-store',
    });

    if (!response.ok) {
      if (isProduction && options.failClosedInProduction) {
        throw new RateLimitError(
          'Rate limiting service error in production. Rejecting request to protect AI infrastructure.',
          503,
          'RATE_LIMIT_UNAVAILABLE'
        );
      }
      console.warn('[rate-limit] Upstash Redis request failed, using firestore fallback limiter');
      return await firestoreFallbackRateLimiter(key, uid, maxRequests, windowMs);
    }

    const data = (await response.json()) as Array<{ result: number }>;
    const currentCount = Number(data[0]?.result) || 1;
    const pttl = Number(data[1]?.result);

    // If key had no TTL (PTTL returns -1), set its expiration to windowMs
    if (pttl === -1 || pttl === -2) {
      await fetch(`${upstashUrl}/pexpire/${encodeURIComponent(redisKey)}/${windowMs}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store',
      }).catch(() => {});
    }

    return currentCount > maxRequests;
  } catch (err) {
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
    console.warn('[rate-limit] Distributed limiter exception, using firestore fallback:', err);
    return await firestoreFallbackRateLimiter(key, uid, maxRequests, windowMs);
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
