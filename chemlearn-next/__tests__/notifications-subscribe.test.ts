/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

jest.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(),
  },
}));

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

import { POST } from '@/app/api/notifications/subscribe/route';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { adminDb } from '@/lib/firebase-admin';

describe('Notifications Subscribe API Route Security & Abuse Guards', () => {
  let mockSet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSet = jest.fn().mockResolvedValue({});
    (adminDb.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: mockSet,
      }),
    });
    (requireAuth as jest.Mock).mockResolvedValue({ uid: 'user_123', email: 'test@student.com' });
    (isRateLimitedAsync as jest.Mock).mockResolvedValue(false);
  });

  function createRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost:3000/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('DENIES unauthenticated request with 401', async () => {
    (requireAuth as jest.Mock).mockRejectedValueOnce(
      new AuthError('Missing or invalid Authorization header.', 401, 'AUTH_HEADER_MISSING')
    );

    const req = createRequest({ fcmToken: 'valid-token-123456789' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('DENIES rate-limited request with 429', async () => {
    (isRateLimitedAsync as jest.Mock).mockResolvedValueOnce(true);

    const req = createRequest({ fcmToken: 'valid-token-123456789' });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toMatch(/too many/i);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('DENIES invalid FCM token format with 400', async () => {
    const req = createRequest({ fcmToken: 'short' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/FCM token/i);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('DENIES oversized payloads with 413 Payload Too Large', async () => {
    // Payload exceeding JSON_DEFAULT limit (64KB)
    const giantPayload = {
      fcmToken: 'valid-fcm-token-123456789',
      extraPadding: 'x'.repeat(70000),
    };

    const req = createRequest(giantPayload);
    const res = await POST(req);
    expect(res.status).toBe(413);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('ALLOWS valid authenticated FCM token registration', async () => {
    const req = createRequest({ fcmToken: 'valid-fcm-token-abcdef123456' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        fcmToken: 'valid-fcm-token-abcdef123456',
        notificationsEnabled: true,
      }),
      { merge: true }
    );
  });
});
