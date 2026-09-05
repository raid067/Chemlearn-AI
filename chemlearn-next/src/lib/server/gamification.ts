import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type XPEventType = 'QUIZ' | 'LESSON' | 'CHALLENGE' | 'DUEL';

export interface XPAwardResult {
  success: boolean;
  alreadyAwarded: boolean;
  xpAwarded: number;
  currentXp: number;
  currentLevel: number;
  levelUp: boolean;
  reason?: string;
}

/**
 * Authoritative XP Level Thresholds (Levels 1 to 10)
 */
export const calculateLevel = (xp: number): number => {
  if (xp >= 10000) return 10;
  if (xp >= 5000) return 5;
  if (xp >= 2500) return 4;
  if (xp >= 1200) return 3;
  if (xp >= 500) return 2;
  return 1;
};

/**
 * Returns the current calendar date string in Malaysian timezone (Asia/Kuala_Lumpur, UTC+8)
 * Format: YYYY-MM-DD
 */
export function getMalaysianDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Calculates whether yesterday in Malaysian timezone matches the given date
 */
function isYesterdayMalaysianDate(dateStr: string, todayStr: string): boolean {
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const today = new Date(Date.UTC(ty, tm - 1, td));
  today.setUTCDate(today.getUTCDate() - 1);
  const yesterdayStr = today.toISOString().split('T')[0];
  return dateStr === yesterdayStr;
}

/**
 * Authoritatively awards XP for an educational action using idempotent event deduplication.
 * Prevents double-clicks, replay attacks, duplicate submissions, and arbitrary client claims.
 * 
 * @param uid - The verified user UID
 * @param type - Event category (QUIZ, LESSON, CHALLENGE, DUEL)
 * @param entityId - Target entity identifier (e.g. quizId, topicId, dateStr, matchId)
 * @param amount - Base XP to award
 * @param metadata - Additional audit metadata (e.g. score, percentage, opponent)
 */
export async function awardXPEvent(
  uid: string,
  type: XPEventType,
  entityId: string,
  amount: number,
  metadata: Record<string, unknown> = {}
): Promise<XPAwardResult> {
  // Deterministic event key prevents duplicate awards
  const sanitizedEntity = entityId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const eventId = `${uid}_${type.toLowerCase()}_${sanitizedEntity}`;
  const eventRef = adminDb.collection('xp_events').doc(eventId);
  const studentRef = adminDb.collection('students').doc(uid);

  return await adminDb.runTransaction(async (transaction) => {
    const [eventSnap, studentSnap] = await Promise.all([
      transaction.get(eventRef),
      transaction.get(studentRef),
    ]);

    const studentData = studentSnap.data() || {};
    const currentXp = Number(studentData.xp) || 0;
    const currentLevel = calculateLevel(currentXp);

    // If already awarded, return existing state without re-awarding
    if (eventSnap.exists) {
      return {
        success: true,
        alreadyAwarded: true,
        xpAwarded: 0,
        currentXp,
        currentLevel,
        levelUp: false,
        reason: 'Event has already been awarded.',
      };
    }

    const newXp = currentXp + amount;
    const newLevel = calculateLevel(newXp);
    const levelUp = newLevel > currentLevel;

    // Record the authoritative idempotent XP event
    transaction.set(eventRef, {
      uid,
      type,
      entityId,
      xpAwarded: amount,
      createdAt: FieldValue.serverTimestamp(),
      metadata,
    });

    // Update student progress atomically
    transaction.set(
      studentRef,
      {
        xp: newXp,
        level: newLevel,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      success: true,
      alreadyAwarded: false,
      xpAwarded: amount,
      currentXp: newXp,
      currentLevel: newLevel,
      levelUp,
    };
  });
}

/**
 * Server-authoritative streak tracking.
 * Calculates streak based on Malaysian calendar days (UTC+8) to eliminate client manipulation.
 */
export async function updateAuthoritativeStreak(uid: string): Promise<{ streak: number; streakUpdated: boolean }> {
  const todayStr = getMalaysianDateString();
  const studentRef = adminDb.collection('students').doc(uid);

  return await adminDb.runTransaction(async (transaction) => {
    const studentSnap = await transaction.get(studentRef);
    const data = studentSnap.data() || {};
    const currentStreak = Number(data.streak) || 0;
    const lastActivityDate = data.lastActivityDate as string | undefined;

    if (lastActivityDate === todayStr) {
      // Already recorded activity today
      return { streak: currentStreak, streakUpdated: false };
    }

    let newStreak = 1;
    if (lastActivityDate && isYesterdayMalaysianDate(lastActivityDate, todayStr)) {
      // Activity occurred yesterday: increment streak
      newStreak = currentStreak + 1;
    }

    transaction.set(
      studentRef,
      {
        streak: newStreak,
        lastActivityDate: todayStr,
      },
      { merge: true }
    );

    return { streak: newStreak, streakUpdated: true };
  });
}
