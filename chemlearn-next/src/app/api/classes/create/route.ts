import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher, AuthError } from '@/lib/server/auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomInt } from 'crypto';
import { createClassSchema } from '@/lib/validations';
import { errorResponse } from '../../ai/_helpers';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';

function generateInviteCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomInt(chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireTeacher(req);
    const uid = user.uid;

    const body = await parseSecureJson(req, MAX_BODY_LIMITS.JSON_DEFAULT);
    const validation = createClassSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Class name is required', 400);
    }

    const { className } = validation.data;
    const inviteCode = generateInviteCode();

    const classRef = await adminDb.collection('classes').add({
      teacherId: uid,
      name: className,
      inviteCode,
      studentIds: [],
      createdAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({ success: true, classId: classRef.id, inviteCode });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    if (error instanceof RequestPayloadError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    console.error('Create class error:', error);
    return errorResponse(error, 500);
  }
}
