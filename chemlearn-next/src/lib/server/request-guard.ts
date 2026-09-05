import { NextRequest } from 'next/server';

export class RequestPayloadError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = 'INVALID_INPUT') {
    super(message);
    this.name = 'RequestPayloadError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const MAX_BODY_LIMITS = {
  JSON_DEFAULT: 32 * 1024, // 32 KB
  PROMPT: 128 * 1024, // 128 KB
  CHAT_TEXT: 256 * 1024, // 256 KB
  IMAGE_BASE64: 7 * 1024 * 1024, // 7 MB
} as const;

/**
 * Safely reads and parses incoming JSON requests, enforcing strict maximum payload byte sizes
 * to prevent denial-of-service via memory exhaustion or oversized inputs.
 */
export async function parseSecureJson<T = unknown>(
  req: NextRequest | Request,
  maxBytes: number = MAX_BODY_LIMITS.JSON_DEFAULT
): Promise<T> {
  // 1. Check Content-Length header if present
  const contentLength = req.headers.get('content-length');
  if (contentLength) {
    const bytes = parseInt(contentLength, 10);
    if (!isNaN(bytes) && bytes > maxBytes) {
      throw new RequestPayloadError(
        `Payload size of ${bytes} bytes exceeds maximum limit of ${maxBytes} bytes.`,
        413,
        'PAYLOAD_TOO_LARGE'
      );
    }
  }

  // 2. Stream consumption with byte tracking
  let text = '';
  if (req.body && typeof (req.body as { getReader?: unknown }).getReader === 'function') {
    const reader = (req.body as { getReader: () => ReadableStreamDefaultReader<Uint8Array> }).getReader();
    const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;
    let totalBytes = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const byteLen = value ? value.byteLength : 0;
        totalBytes += byteLen;
        if (totalBytes > maxBytes) {
          throw new RequestPayloadError(
            `Payload size exceeded maximum limit of ${maxBytes} bytes.`,
            413,
            'PAYLOAD_TOO_LARGE'
          );
        }

        if (value) {
          if (decoder) {
            text += decoder.decode(value, { stream: true });
          } else if (typeof Buffer !== 'undefined') {
            text += Buffer.from(value).toString('utf8');
          }
        }
      }
      if (decoder) {
        text += decoder.decode();
      }
    } finally {
      reader.releaseLock();
    }
  } else {
    text = await req.text();
    const byteLength = typeof Buffer !== 'undefined'
      ? Buffer.byteLength(text, 'utf8')
      : (typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(text).length : text.length);

    if (byteLength > maxBytes) {
      throw new RequestPayloadError(
        `Payload size exceeded maximum limit of ${maxBytes} bytes.`,
        413,
        'PAYLOAD_TOO_LARGE'
      );
    }
  }

  if (!text || !text.trim()) {
    throw new RequestPayloadError('Request body cannot be empty', 400, 'INVALID_INPUT');
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new RequestPayloadError('Invalid JSON formatting in request body', 400, 'INVALID_INPUT');
  }
}
