import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';

function createMockRequest(body: string, headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (header: string) => {
        const key = Object.keys(headers).find((k) => k.toLowerCase() === header.toLowerCase());
        return key ? headers[key] : null;
      },
    },
    text: async () => body,
  } as unknown as Request;
}

function createMockStreamRequest(body: string, headers: Record<string, string> = {}) {
  const encoded = typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(body)
    : Buffer.from(body, 'utf8');
  return {
    headers: {
      get: (header: string) => {
        const key = Object.keys(headers).find((k) => k.toLowerCase() === header.toLowerCase());
        return key ? headers[key] : null;
      },
    },
    body: {
      getReader: () => {
        let read = false;
        return {
          read: async () => {
            if (read) return { done: true, value: undefined };
            read = true;
            return { done: false, value: encoded };
          },
          releaseLock: () => {},
        };
      },
    },
    text: async () => body,
  } as unknown as Request;
}

describe('Request Guard & Payload Protection', () => {
  it('parses valid JSON payloads within limits', async () => {
    const payload = { topic: 'Acids and Bases', difficulty: 'Medium' };
    const req = createMockRequest(JSON.stringify(payload), { 'content-type': 'application/json' });

    const result = await parseSecureJson(req);
    expect(result).toEqual(payload);
  });

  it('rejects requests exceeding Content-Length header with 413 PAYLOAD_TOO_LARGE', async () => {
    const req = createMockRequest(JSON.stringify({ a: 'small payload' }), {
      'content-type': 'application/json',
      'content-length': '10000',
    });

    await expect(parseSecureJson(req, 5000)).rejects.toThrow(RequestPayloadError);
    try {
      await parseSecureJson(req, 5000);
    } catch (e: any) {
      expect(e.statusCode).toBe(413);
      expect(e.code).toBe('PAYLOAD_TOO_LARGE');
    }
  });

  it('rejects oversized streamed bodies with 413 PAYLOAD_TOO_LARGE', async () => {
    const largeString = 'a'.repeat(2000);
    const req = createMockStreamRequest(JSON.stringify({ large: largeString }), {
      'content-type': 'application/json',
    });

    await expect(parseSecureJson(req, 1000)).rejects.toThrow(RequestPayloadError);
    try {
      await parseSecureJson(req, 1000);
    } catch (e: any) {
      expect(e.statusCode).toBe(413);
      expect(e.code).toBe('PAYLOAD_TOO_LARGE');
    }
  });

  it('rejects empty request body with 400 INVALID_INPUT', async () => {
    const req = createMockRequest('', { 'content-type': 'application/json' });

    await expect(parseSecureJson(req)).rejects.toThrow(RequestPayloadError);
    try {
      await parseSecureJson(req);
    } catch (e: any) {
      expect(e.statusCode).toBe(400);
      expect(e.code).toBe('INVALID_INPUT');
    }
  });

  it('rejects malformed JSON syntax with 400 INVALID_INPUT', async () => {
    const req = createMockRequest('{ malformed: json, missing quotes }', {
      'content-type': 'application/json',
    });

    await expect(parseSecureJson(req)).rejects.toThrow(RequestPayloadError);
    try {
      await parseSecureJson(req);
    } catch (e: any) {
      expect(e.statusCode).toBe(400);
      expect(e.code).toBe('INVALID_INPUT');
    }
  });

  it('provides safe constants for route body boundaries', () => {
    expect(MAX_BODY_LIMITS.JSON_DEFAULT).toBe(32 * 1024);
    expect(MAX_BODY_LIMITS.PROMPT).toBe(128 * 1024);
    expect(MAX_BODY_LIMITS.CHAT_TEXT).toBe(256 * 1024);
    expect(MAX_BODY_LIMITS.IMAGE_BASE64).toBe(7 * 1024 * 1024);
  });
});
