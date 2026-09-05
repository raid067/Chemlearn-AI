/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

jest.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import { errorResponse, verifyAuth } from '@/app/api/ai/_helpers';
import { adminAuth } from '@/lib/firebase-admin';

describe('API Helpers (Security, Sanitization & Auth)', () => {
  describe('errorResponse', () => {
    it('preserves client error messages for 400 Bad Request', async () => {
      const response = errorResponse('Topic is required', 400);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Topic is required');
    });

    it('sanitizes internal server errors (500) and conceals stack/database traces', async () => {
      const sensitiveInternalError = new Error('FATAL: Database connection timeout at 10.0.1.5:5432 with password=secret');
      const response = errorResponse(sensitiveInternalError, 500);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('An internal error occurred. Please try again.');
      expect(data.error).not.toContain('Database');
      expect(data.error).not.toContain('password');
    });

    it('maps token and authorization errors to 401 Unauthorized', async () => {
      const tokenError = new Error('Firebase ID token has expired');
      const response = errorResponse(tokenError, 500);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Authentication required. Please sign in again.');
    });

    it('handles non-Error unknown types safely', async () => {
      const response = errorResponse({unknown: true}, 400);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Unknown error');
    });
  });

  describe('verifyAuth', () => {
    it('throws error when Authorization header is missing', async () => {
      const req = new NextRequest('http://localhost/api/test');
      await expect(verifyAuth(req)).rejects.toThrow('Missing or invalid Authorization header');
    });

    it('throws error when Authorization header is not a Bearer token', async () => {
      const req = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Basic dXNlcnpwYXNzAoB' },
      });
      await expect(verifyAuth(req)).rejects.toThrow('Missing or invalid Authorization header');
    });

    it('verifies valid Bearer token and returns UID', async () => {
      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValueOnce({ uid: 'verified-user-123' });

      const req = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer valid-jwt-token' },
      });
      const uid = await verifyAuth(req);
      expect(uid).toBe('verified-user-123');
      expect(adminAuth.verifyIdToken).toHaveBeenCalledWith('valid-jwt-token');
    });
  });
});
