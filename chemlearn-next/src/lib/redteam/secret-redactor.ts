/**
 * Secret and PII Redaction Engine
 * Automatically scrubs credentials, API keys, private keys, and authorization tokens
 * from red-team logs, test results, and generated reports.
 */

const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Google / Firebase API keys (AIzaSy...)
  {
    pattern: /AIzaSy[A-Za-z0-9_-]{33}/g,
    replacement: 'AIzaSy**************REDACTED',
  },
  // Firebase / RSA Private Keys
  {
    pattern: /-----BEGIN PRIVATE KEY-----[A-Za-z0-9+/=\s\r\n]+-----END PRIVATE KEY-----/g,
    replacement: '-----BEGIN PRIVATE KEY-----\n[REDACTED_RSA_PRIVATE_KEY]\n-----END PRIVATE KEY-----',
  },
  // JWT Tokens (Bearer or standalone)
  {
    pattern: /Bearer\s+ey[A-Za-z0-9_-]+\.ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/gi,
    replacement: 'Bearer eyJ***REDACTED_JWT***',
  },
  {
    pattern: /ey[A-Za-z0-9_-]{20,}\.ey[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
    replacement: 'eyJ***REDACTED_JWT***',
  },
  // Google OAuth client secrets or codes
  {
    pattern: /4\/0[A-Za-z0-9_-]{40,}/g,
    replacement: '4/0***REDACTED_OAUTH_CODE***',
  },
  // Generic password fields in JSON or strings
  {
    pattern: /("password"\s*:\s*")([^"]+)(")/gi,
    replacement: '$1********REDACTED********$3',
  },
  {
    pattern: /("privateKey"\s*:\s*")([^"]+)(")/gi,
    replacement: '$1[REDACTED_PRIVATE_KEY]$3',
  },
  {
    pattern: /("clientEmail"\s*:\s*")([^"]+)(")/gi,
    replacement: '$1[REDACTED_CLIENT_EMAIL]$3',
  },
];

/**
 * Redacts known secret patterns from string input.
 */
export function redactSecrets(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let sanitized = input;
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

/**
 * Deeply traverses an object or array and redacts all nested string values.
 */
export function redactObjectSecrets<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return redactSecrets(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObjectSecrets(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const copy: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('privatekey')
      ) {
        copy[key] = '***REDACTED***';
      } else {
        copy[key] = redactObjectSecrets(value);
      }
    }
    return copy as T;
  }

  return obj;
}
