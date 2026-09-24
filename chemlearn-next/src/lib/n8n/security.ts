import crypto from 'crypto';

/**
 * Default timestamp tolerance: 5 minutes (300,000 ms)
 */
export const DEFAULT_MAX_TIMESTAMP_AGE_MS = 300000;

/**
 * Maximum clock skew allowed into the future: 1 minute (60,000 ms)
 */
export const MAX_FUTURE_CLOCK_SKEW_MS = 60000;

/**
 * Generates an HMAC-SHA256 signature string for an n8n webhook payload.
 * Format: `sha256=<hex_digest>`
 */
export function generateSignature(payload: string, secret: string): string {
  if (!secret) {
    throw new Error('Missing webhook secret for signature generation');
  }
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Verifies an incoming HMAC-SHA256 signature using constant-time comparison to prevent timing attacks.
 */
export function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret || typeof signature !== 'string') {
    return false;
  }

  const parts = signature.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256' || !parts[1] || parts[1].length !== 64) {
    return false;
  }

  try {
    const expectedSignature = generateSignature(payload, secret);
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch {
    return false;
  }
}

/**
 * Validates request timestamp to protect against replay attacks.
 * Rejects requests older than maxAgeMs or skewed into the future.
 */
export function verifyTimestamp(
  timestampHeader: string | null | undefined,
  maxAgeMs: number = DEFAULT_MAX_TIMESTAMP_AGE_MS
): boolean {
  if (!timestampHeader) {
    return false;
  }

  const timestamp = Number(timestampHeader);
  if (isNaN(timestamp) || !Number.isFinite(timestamp) || timestamp <= 0) {
    return false;
  }

  const now = Date.now();
  const diff = now - timestamp;

  // Too old (replay)
  if (diff > maxAgeMs) {
    return false;
  }

  // Too far in future (clock skew anomaly)
  if (timestamp - now > MAX_FUTURE_CLOCK_SKEW_MS) {
    return false;
  }

  return true;
}
