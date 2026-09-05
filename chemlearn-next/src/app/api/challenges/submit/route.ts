import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { gradeChallengeSubmission } from '@/lib/server/quizzes';
import { errorResponse } from '../../ai/_helpers';
import { z } from 'zod';

const challengeSubmitSchema = z.object({
  challengeId: z.string().trim().min(1, 'Challenge ID is required'),
  answers: z.record(z.string(), z.union([z.number(), z.string()])).or(
    z.record(z.number(), z.union([z.number(), z.string()]))
  ),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const body = await req.json();
    const validation = challengeSubmitSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Invalid challenge submission payload', 400);
    }

    const { challengeId, answers } = validation.data;

    // Grade daily challenge authoritatively (validates isDailyChallenge, user ownership, and today's date)
    const grading = await gradeChallengeSubmission(challengeId, user.uid, answers);

    return NextResponse.json({
      success: true,
      data: {
        score: grading.score,
        total: grading.total,
        percentage: grading.percentage,
        breakdown: grading.breakdown,
        xpAwarded: grading.xpAwarded,
        currentXp: grading.currentXp,
        currentLevel: grading.currentLevel,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : 'Challenge submission failed';
    if (
      msg.includes('Invalid challenge') ||
      msg.includes('expired') ||
      msg.includes('Unauthorized') ||
      msg.includes('not found')
    ) {
      return errorResponse(msg, 400);
    }
    console.error('Challenge Submit API Error:', error);
    return errorResponse(error, 500);
  }
}

