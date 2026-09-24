import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';
import { z } from 'zod';

const subscribeSchema = z.object({
  fcmToken: z.string().trim().min(10, 'FCM token too short').max(500, 'FCM token too long'),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Rate limit: 10 token registrations per minute per user
    if (await isRateLimitedAsync('notifications-subscribe', user.uid, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await parseSecureJson(req, MAX_BODY_LIMITS.JSON_DEFAULT);
    const parseResult = subscribeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid FCM token format' },
        { status: 400 }
      );
    }

    const { fcmToken } = parseResult.data;

    // Persist FCM token on the authoritative user document
    await adminDb.collection('users').doc(user.uid).set(
      {
        fcmToken,
        notificationsEnabled: true,
        fcmUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, message: 'FCM push notification token registered.' });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    if (err instanceof RequestPayloadError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    console.error('[FCM Subscribe Error]:', err);
    return NextResponse.json({ error: 'Failed to register notification subscription.' }, { status: 500 });
  }
}
