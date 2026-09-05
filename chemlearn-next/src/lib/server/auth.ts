import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export interface VerifiedUser {
  uid: string;
  email?: string;
  isTeacher: boolean;
  isAdmin: boolean;
  claims: Record<string, unknown>;
}

export class AuthError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 401, code = 'UNAUTHORIZED') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Server-authoritative token verification.
 * Extracts and verifies Firebase ID token from Authorization Bearer header.
 */
export async function requireAuth(req: NextRequest): Promise<VerifiedUser> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header. Please sign in.', 401, 'AUTH_HEADER_MISSING');
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    throw new AuthError('Bearer token is empty.', 401, 'AUTH_TOKEN_EMPTY');
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const claims = decodedToken as Record<string, unknown>;
    const isAdmin = Boolean(claims.admin);
    let isTeacher = Boolean(claims.teacher);

    // Fallback: Check teachers collection if custom claim not set
    if (!isTeacher) {
      const teacherSnap = await adminDb.collection('teachers').doc(decodedToken.uid).get();
      isTeacher = teacherSnap.exists;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isTeacher,
      isAdmin,
      claims,
    };
  } catch (err: unknown) {
    const firebaseErr = err as { code?: string; message?: string };
    if (firebaseErr.code === 'auth/id-token-expired') {
      throw new AuthError('Your session has expired. Please sign in again.', 401, 'TOKEN_EXPIRED');
    }
    if (firebaseErr.code === 'auth/argument-error' || firebaseErr.code === 'auth/invalid-id-token') {
      throw new AuthError('Invalid authentication token.', 401, 'TOKEN_INVALID');
    }
    throw new AuthError('Authentication failed.', 401, 'AUTH_FAILED');
  }
}

/**
 * Ensures authenticated user has Teacher privileges.
 */
export async function requireTeacher(req: NextRequest): Promise<VerifiedUser> {
  const user = await requireAuth(req);
  if (!user.isTeacher && !user.isAdmin) {
    throw new AuthError('Forbidden: Teacher access required.', 403, 'FORBIDDEN_NOT_TEACHER');
  }
  return user;
}

/**
 * Ensures authenticated user has Admin privileges.
 */
export async function requireAdmin(req: NextRequest): Promise<VerifiedUser> {
  const user = await requireAuth(req);
  if (!user.isAdmin) {
    throw new AuthError('Forbidden: Administrator access required.', 403, 'FORBIDDEN_NOT_ADMIN');
  }
  return user;
}
