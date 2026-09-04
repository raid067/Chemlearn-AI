import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomInt } from 'crypto';
import { createClassSchema } from '@/lib/validations';
import { errorResponse } from '../../ai/_helpers';

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Verify user is in teachers collection
    const teacherDoc = await adminDb.collection('teachers').doc(uid).get();
    if (!teacherDoc.exists) {
      return NextResponse.json({ error: 'Forbidden: Not a teacher' }, { status: 403 });
    }

    const body = await req.json();
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
    console.error('Create class error:', error);
    return errorResponse(error, 500);
  }
}
