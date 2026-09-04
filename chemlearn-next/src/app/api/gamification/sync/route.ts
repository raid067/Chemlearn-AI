import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse } from '../../ai/_helpers';
import { adminDb } from '@/lib/firebase-admin';
import { syncGamificationSchema } from '@/lib/validations';

const ACTION_XP_MAP: Record<string, number> = {
  'COMPLETE_LESSON': 25,
  'WIN_DUEL': 20,
  'COMPLETE_QUIZ': 15,
  'DAILY_CHALLENGE': 10,
};

const calculateLevel = (xp: number) => {
  if (xp >= 10000) return 10;
  if (xp >= 5000) return 5;
  if (xp >= 2500) return 4;
  if (xp >= 1200) return 3;
  if (xp >= 500) return 2;
  return 1;
};

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);
    const body = await req.json();

    const validation = syncGamificationSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Invalid or unsupported action', 400);
    }

    const { action } = validation.data;
    const xpToAdd = ACTION_XP_MAP[action];
    if (typeof xpToAdd !== 'number') {
      return errorResponse('Invalid or unsupported action', 400);
    }

    const userRef = adminDb.collection('students').doc(uid);
    
    const result = await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(userRef);
      let currentXp = 0;
      
      if (doc.exists) {
        currentXp = doc.data()?.xp || 0;
      }
      
      const newXp = currentXp + xpToAdd;
      const newLevel = calculateLevel(newXp);
      
      transaction.set(userRef, {
        xp: newXp,
        level: newLevel,
        lastSyncedAt: new Date().toISOString()
      }, { merge: true });
      
      return { xp: newXp, level: newLevel };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('Gamification Action API Error:', error);
    return errorResponse(error, 500);
  }
}
