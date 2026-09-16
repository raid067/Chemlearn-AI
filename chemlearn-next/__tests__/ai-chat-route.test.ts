/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
  },
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

jest.mock('@/lib/server/ai-gateway', () => {
  const actual = jest.requireActual('@/lib/server/ai-gateway');
  return {
    ...actual,
    secureGenerateAI: jest.fn(),
  };
});

jest.mock('@/lib/server/auth', () => {
  const actual = jest.requireActual('@/lib/server/auth');
  return {
    ...actual,
    requireAuth: jest.fn(),
  };
});

jest.mock('@/lib/rate-limit', () => {
  const actual = jest.requireActual('@/lib/rate-limit');
  return {
    ...actual,
    isRateLimitedAsync: jest.fn().mockResolvedValue(false),
  };
});

import { POST } from '@/app/api/ai/chat/route';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { secureGenerateAI } from '@/lib/server/ai-gateway';
import { isRateLimitedAsync } from '@/lib/rate-limit';

describe('AI Chat Route — KSSM Chemistry Tutor Persona & Resilience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated requests with 401 status', async () => {
    (requireAuth as jest.Mock).mockRejectedValueOnce(new AuthError('Missing or invalid Authorization token', 401));

    const req = new NextRequest('http://localhost/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ question: 'Hello teacher!' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Missing or invalid Authorization token');
  });

  it('rejects request when both question and image are missing', async () => {
    (requireAuth as jest.Mock).mockResolvedValueOnce({ uid: 'student-123', email: 'test@student.com' });

    const req = new NextRequest('http://localhost/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Question or image is required');
  });

  it('returns both response and answer properties for client backward compatibility', async () => {
    (requireAuth as jest.Mock).mockResolvedValueOnce({ uid: 'student-123', email: 'test@student.com' });
    const mockTutorReply = 'Hello! In Form 4 Chapter 6, acids ionise in water to produce hydrogen ions (H+). What salt or acid question are you working on?';
    (secureGenerateAI as jest.Mock).mockResolvedValueOnce(mockTutorReply);

    const req = new NextRequest('http://localhost/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ question: 'What is an acid?' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    // Verify dual property presence for ChatInput and ClientPage
    expect(data.response).toBe(mockTutorReply);
    expect(data.answer).toBe(mockTutorReply);

    // Verify AI gateway call
    expect(secureGenerateAI).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: 'student-123',
        endpoint: 'ai-chat',
        taskType: 'tutor',
      })
    );

    // Verify student question was wrapped with untrusted input boundary
    const callArgs = (secureGenerateAI as jest.Mock).mock.calls[0][0];
    const promptArray = callArgs.prompt;
    const studentQuestionPart = promptArray.find((p: unknown) => typeof p === 'string' && p.includes('<<<STUDENT_QUESTION>>>'));
    expect(studentQuestionPart).toBeDefined();
    expect(studentQuestionPart).toContain('What is an acid?');

    // Verify system prompt in the prompt parts does not contain rigid template headers
    const systemPromptPart = promptArray[0];
    expect(systemPromptPart).not.toContain('Answer format:');
    expect(systemPromptPart).not.toContain('Explanation / Penerangan:');
    expect(systemPromptPart).toContain('KSSM Form 4 and Form 5');
    expect(systemPromptPart).toContain('reply like normal');
  });

  it('handles rate limiting (429) cleanly', async () => {
    (requireAuth as jest.Mock).mockResolvedValueOnce({ uid: 'student-spammer', email: 'spam@student.com' });
    (isRateLimitedAsync as jest.Mock).mockResolvedValueOnce(true);

    const req = new NextRequest('http://localhost/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ question: 'Can you help me?' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain('Too many requests');
  });
});
