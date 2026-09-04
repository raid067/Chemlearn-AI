import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { joinClassSchema } from '@/lib/validations';
import { errorResponse } from '../../ai/_helpers';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const body = await req.json();
    const validation = joinClassSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Invalid invite code', 400);
    }
    const { inviteCode } = validation.data;

    // Find the class by invite code
    const classesSnapshot = await adminDb
      .collection('classes')
      .where('inviteCode', '==', inviteCode.toUpperCase())
      .limit(1)
      .get();

    if (classesSnapshot.empty) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const classDoc = classesSnapshot.docs[0];
    const classData = classDoc.data();
    
    if (classData.studentIds?.includes(uid)) {
      return NextResponse.json({ error: 'Already joined this class' }, { status: 400 });
    }

    // Atomically add student to the class and stamp teacherId onto the student doc
    const studentRef = adminDb.collection('students').doc(uid);
    const batch = adminDb.batch();

    batch.update(classDoc.ref, {
      studentIds: FieldValue.arrayUnion(uid)
    });

    batch.set(studentRef, {
      teacherIds: FieldValue.arrayUnion(classData.teacherId)
    }, { merge: true });

    await batch.commit();

    return NextResponse.json({ success: true, className: classData.name });
  } catch (error: unknown) {
    console.error('Join class error:', error);
    return errorResponse(error, 500);
  }
}
