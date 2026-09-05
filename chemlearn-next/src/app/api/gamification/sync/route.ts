import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { isRateLimited } from '@/lib/rate-limit';
import { syncGamificationSchema } from '@/lib/validations';
import { awardXPEvent } from '@/lib/server/gamification';
import { adminDb } from '@/lib/firebase-admin';

const ACTION_XP_MAP: Record<string, number> = {
  'COMPLETE_LESSON': 25,
  'WIN_DUEL': 20,
  'COMPLETE_QUIZ': 15,
  'DAILY_CHALLENGE': 10,
};

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    if (isRateLimited('gamification-sync', user.uid, 6, 60_000)) {
      return NextResponse.json(
        { error: 'Too many XP sync requests. Please wait.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = syncGamificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid or unsupported action' },
        { status: 400 }
      );
    }

    const { action } = validation.data;
    const xpToAdd = ACTION_XP_MAP[action];
    if (typeof xpToAdd !== 'number') {
      return NextResponse.json({ error: 'Invalid or unsupported action' }, { status: 400 });
    }

    const eventTypeMap: Record<string, 'QUIZ' | 'LESSON' | 'CHALLENGE' | 'DUEL'> = {
      'COMPLETE_LESSON': 'LESSON',
      'WIN_DUEL': 'DUEL',
      'COMPLETE_QUIZ': 'QUIZ',
      'DAILY_CHALLENGE': 'CHALLENGE',
    };
    const eventType = eventTypeMap[action] || 'LESSON';

    // Windowed entityId: prevents rapid-fire duplicate claims within the same minute
    const timeWindow = Math.floor(Date.now() / 60_000);
    const entityId = `sync_${action.toLowerCase()}_${timeWindow}`;

    const result = await awardXPEvent(user.uid, eventType, entityId, xpToAdd, {
      action,
      syncedVia: 'legacy_sync_api',
    });

    // Fetch updated student profile for client response
    const studentDoc = await adminDb.collection('students').doc(user.uid).get();
    const studentData = studentDoc.data() || {};

    return NextResponse.json({
      success: true,
      data: {
        xp: studentData.xp || 0,
        level: studentData.level || 1,
        xpAwarded: result.xpAwarded,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    console.error('Gamification Action API Error:', error);
    return NextResponse.json({ error: 'Failed to process gamification action' }, { status: 500 });
  }
}
