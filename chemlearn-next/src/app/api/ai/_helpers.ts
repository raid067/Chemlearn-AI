import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export { genAI, generateGeminiText, generateGeminiJson } from '@/lib/server/gemini';

export async function verifyAuth(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const token = authHeader.split('Bearer ')[1];
  const decoded = await adminAuth.verifyIdToken(token);
  return decoded.uid;
}

export function errorResponse(error: unknown, defaultStatus = 400) {
  const rawMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
  let status = defaultStatus;
  
  // Only reveal auth errors to the client; sanitize everything else
  if (rawMessage.includes('Authorization') || rawMessage.includes('token') || rawMessage.includes('auth/')) {
    status = 401;
    return NextResponse.json({ error: 'Authentication required. Please sign in again.' }, { status });
  }
  
  // Don't leak internal error details to clients
  const safeMessage = defaultStatus >= 500 ? 'An internal error occurred. Please try again.' : rawMessage;
  
  return NextResponse.json({ error: safeMessage }, { status });
}
