/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window counter per user UID.
 * 
 * NOTE: This is per-instance. In a serverless environment (Firebase Hosting / Vercel),
 * each cold start gets its own Map. For production at scale, consider
 * Redis or Firestore-based rate limiting. This still provides meaningful
 * protection against rapid-fire abuse within a single instance.
 * 
 * TODO(production-readiness): Replace this in-memory sliding window limiter with a
 * centralized distributed limiter (e.g. Upstash Redis / Cloud Firestore with TTL)
 * before taking real user traffic. Because Gemini LLM inference incurs direct API
 * costs and quotas, distributed rate limiting is the sole barrier against distributed
 * abuse across auto-scaling serverless container instances.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limiters = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Check if a request should be rate-limited using synchronous in-memory storage.
 * @param key - A unique key for the rate limit bucket (e.g. route name)
 * @param uid - The user's UID
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request should be BLOCKED, false if allowed
 */
export function isRateLimited(
  key: string,
  uid: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): boolean {
  if (!limiters.has(key)) {
    limiters.set(key, new Map());
  }

  const bucket = limiters.get(key)!;
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

/**
 * Distributed rate limiter supporting Upstash Redis REST API when configured,
 * with automatic fallback to the in-memory limiter.
 * @returns true if the request should be BLOCKED, false if allowed
 */
export async function isRateLimitedAsync(
  key: string,
  uid: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): Promise<boolean> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!upstashUrl || !upstashToken) {
    return isRateLimited(key, uid, maxRequests, windowMs);
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
      console.warn('[rate-limit] Upstash Redis request failed, using in-memory limiter');
      return isRateLimited(key, uid, maxRequests, windowMs);
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
    console.warn('[rate-limit] Distributed limiter exception, using in-memory fallback:', err);
    return isRateLimited(key, uid, maxRequests, windowMs);
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
