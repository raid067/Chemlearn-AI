import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/server/auth';
import { adminDb } from '@/lib/firebase-admin';

export interface AdminStats {
  totalStudents: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  lastUpdated?: string | null;
}

export interface FeedbackItem {
  id: string;
  userName: string;
  userEmail?: string;
  rating: number;
  text: string;
  timestamp: string | null;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Enforce Server-Authoritative Admin Authorization
    await requireAdmin(req);

    // 2. Fetch System Stats Overview from Firestore
    let stats: AdminStats = {
      totalStudents: 0,
      totalQuizzesCompleted: 0,
      averageScore: 0,
      lastUpdated: null,
    };

    try {
      const statsDoc = await adminDb.collection('system_stats').doc('overview').get();
      if (statsDoc.exists) {
        const data = statsDoc.data() || {};
        stats = {
          totalStudents: Number(data.totalStudents) || 0,
          totalQuizzesCompleted: Number(data.totalQuizzesCompleted) || 0,
          averageScore: Number(data.averageScore) || 0,
          lastUpdated: data.lastUpdated ? String(data.lastUpdated) : null,
        };
      }
    } catch (statsErr) {
      console.warn('[Admin API] Error fetching system_stats overview:', statsErr);
    }

    // 3. Fetch Recent Feedbacks (Descending, limit 25)
    const feedbacks: FeedbackItem[] = [];
    try {
      const feedbackSnap = await adminDb
        .collection('feedbacks')
        .orderBy('timestamp', 'desc')
        .limit(25)
        .get();

      feedbackSnap.forEach((docSnap) => {
        const d = docSnap.data();
        let formattedDate: string | null = null;
        if (d.timestamp) {
          if (typeof d.timestamp.toDate === 'function') {
            formattedDate = d.timestamp.toDate().toISOString();
          } else if (d.timestamp instanceof Date) {
            formattedDate = d.timestamp.toISOString();
          } else {
            formattedDate = String(d.timestamp);
          }
        }

        feedbacks.push({
          id: docSnap.id,
          userName: typeof d.userName === 'string' && d.userName.trim() ? d.userName.trim() : 'Anonymous Student',
          userEmail: typeof d.userEmail === 'string' ? d.userEmail : undefined,
          rating: typeof d.rating === 'number' ? d.rating : 5,
          text: typeof d.text === 'string' ? d.text : '',
          timestamp: formattedDate,
        });
      });
    } catch (feedbackErr) {
      console.warn('[Admin API] Error fetching feedbacks:', feedbackErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        feedbacks,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('[Admin Overview API Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching admin overview data' },
      { status: 500 }
    );
  }
}
