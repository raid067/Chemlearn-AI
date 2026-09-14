import { isTransientGeminiError } from '@/lib/server/gemini';

describe('isTransientGeminiError', () => {
  it('returns false for falsy inputs', () => {
    expect(isTransientGeminiError(null)).toBe(false);
    expect(isTransientGeminiError(undefined)).toBe(false);
    expect(isTransientGeminiError('')).toBe(false);
    expect(isTransientGeminiError(0)).toBe(false);
    expect(isTransientGeminiError(false)).toBe(false);
  });

  it('returns true for known transient status codes', () => {
    expect(isTransientGeminiError({ status: 429 })).toBe(true);
    expect(isTransientGeminiError({ status: 500 })).toBe(true);
    expect(isTransientGeminiError({ status: 503 })).toBe(true);
    expect(isTransientGeminiError({ status: 504 })).toBe(true);
  });

  it('returns false for non-transient status codes', () => {
    expect(isTransientGeminiError({ status: 400 })).toBe(false);
    expect(isTransientGeminiError({ status: 401 })).toBe(false);
    expect(isTransientGeminiError({ status: 403 })).toBe(false);
    expect(isTransientGeminiError({ status: 404 })).toBe(false);
  });

  it('returns true for known transient error messages (Error objects)', () => {
    expect(isTransientGeminiError(new Error('resource_exhausted'))).toBe(true);
    expect(isTransientGeminiError(new Error('Exceeded quota for project'))).toBe(true);
    expect(isTransientGeminiError(new Error('Rate limit exceeded'))).toBe(true);
    expect(isTransientGeminiError(new Error('Service is unavailable'))).toBe(true);
    expect(isTransientGeminiError(new Error('Server overloaded'))).toBe(true);
    expect(isTransientGeminiError(new Error('Internal server error occurred'))).toBe(true);
    expect(isTransientGeminiError(new Error('Request timeout'))).toBe(true);
    expect(isTransientGeminiError(new Error('Operation timed out'))).toBe(true);
    expect(isTransientGeminiError(new Error('ECONNRESET'))).toBe(true);
    expect(isTransientGeminiError(new Error('socket hang up'))).toBe(true);
    expect(isTransientGeminiError(new Error('fetch failed'))).toBe(true);
  });

  it('returns true for known transient error messages (strings)', () => {
    expect(isTransientGeminiError('resource_exhausted')).toBe(true);
    expect(isTransientGeminiError('Exceeded quota for project')).toBe(true);
    expect(isTransientGeminiError('Rate limit exceeded')).toBe(true);
    expect(isTransientGeminiError('Service is unavailable')).toBe(true);
    expect(isTransientGeminiError('Server overloaded')).toBe(true);
    expect(isTransientGeminiError('Internal server error occurred')).toBe(true);
    expect(isTransientGeminiError('Request timeout')).toBe(true);
    expect(isTransientGeminiError('Operation timed out')).toBe(true);
    expect(isTransientGeminiError('ECONNRESET')).toBe(true);
    expect(isTransientGeminiError('socket hang up')).toBe(true);
    expect(isTransientGeminiError('fetch failed')).toBe(true);
  });

  it('returns false for non-transient error messages', () => {
    expect(isTransientGeminiError(new Error('Invalid input'))).toBe(false);
    expect(isTransientGeminiError(new Error('Authentication failed'))).toBe(false);
    expect(isTransientGeminiError('Some random string error')).toBe(false);
    expect(isTransientGeminiError(new Error('Model not found'))).toBe(false);
  });
});
