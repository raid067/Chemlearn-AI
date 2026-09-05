import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { gradeQuizSubmission } from '@/lib/server/quizzes';
import { awardXPEvent, getMalaysianDateString, updateAuthoritativeStreak } from '@/lib/server/gamification';
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

    // Grade answers authoritatively against server_quizzes
    const grading = await gradeQuizSubmission(challengeId, user.uid, answers);

    // Award daily challenge bonus XP with deterministic daily event ID (10 XP per day)
    const myDateStr = getMalaysianDateString();
    const challengeXP = await awardXPEvent(user.uid, 'CHALLENGE', myDateStr, 10, {
      challengeId,
      score: grading.score,
      total: grading.total,
      date: myDateStr,
    });

    await updateAuthoritativeStreak(user.uid);

    return NextResponse.json({
      success: true,
      data: {
        score: grading.score,
        total: grading.total,
        percentage: grading.percentage,
        breakdown: grading.breakdown,
        xpAwarded: challengeXP.xpAwarded,
        currentXp: challengeXP.currentXp,
        currentLevel: challengeXP.currentLevel,
        alreadyAwarded: challengeXP.alreadyAwarded,
      },
    });
  } catch (error: unknown) {
    console.error('Challenge Submit API Error:', error);
    return errorResponse(error, 500);
  }
}
