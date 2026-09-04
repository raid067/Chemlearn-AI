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
 * Check if a request should be rate-limited.
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
