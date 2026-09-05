import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { isRateLimited } from '@/lib/rate-limit';
import { calculateLevel } from '@/lib/server/gamification';
import { adminDb } from '@/lib/firebase-admin';

/**
 * GET /api/gamification/sync
 * Returns the verified, authoritative student gamification state from Firestore.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    if (isRateLimited('gamification-fetch', user.uid, 30, 60_000)) {
      return NextResponse.json(
        { error: 'Too many sync requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const studentDoc = await adminDb.collection('students').doc(user.uid).get();
    const studentData = studentDoc.data() || {};
    const xp = Number(studentData.xp) || 0;
    const level = calculateLevel(xp);
    const streak = Number(studentData.streak) || 0;
    const badges = Array.isArray(studentData.badges) ? studentData.badges : [];

    return NextResponse.json({
      success: true,
      data: {
        xp,
        level,
        streak,
        badges,
        lastActivityDate: studentData.lastActivityDate || null,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    console.error('Gamification Fetch API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch gamification profile' }, { status: 500 });
  }
}

/**
 * POST /api/gamification/sync
 * Deprecated client action claims are explicitly rejected to enforce server authority.
 * Clients must call verified operation endpoints (/api/lessons/complete, /api/quizzes/submit, etc.).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty if client is requesting a state refresh via POST
      body = {};
    }

    // Explicitly reject direct client-side action XP claims
    if (body.action) {
      return NextResponse.json(
        {
          error: 'Direct action-based XP claims are disabled. XP must be earned through verified operational endpoints (/api/lessons/complete, /api/quizzes/submit, /api/challenges/submit, /api/duel/finish).',
          code: 'ACTION_CLAIM_DEPRECATED',
        },
        { status: 400 }
      );
    }

    // If body is empty, serve the authoritative student state
    const studentDoc = await adminDb.collection('students').doc(user.uid).get();
    const studentData = studentDoc.data() || {};
    const xp = Number(studentData.xp) || 0;
    const level = calculateLevel(xp);
    const streak = Number(studentData.streak) || 0;
    const badges = Array.isArray(studentData.badges) ? studentData.badges : [];

    return NextResponse.json({
      success: true,
      data: {
        xp,
        level,
        streak,
        badges,
        lastActivityDate: studentData.lastActivityDate || null,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    console.error('Gamification Sync API Error:', error);
    return NextResponse.json({ error: 'Failed to process gamification sync' }, { status: 500 });
  }
}
