import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { isRateLimited } from '@/lib/rate-limit';
import { duelAnswerSchema } from '@/lib/validations';
import { submitDuelAnswer } from '@/lib/server/duels';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    if (isRateLimited('duel-answer', user.uid, 60, 60_000)) {
      return NextResponse.json(
        { error: 'Too many answer submissions. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = duelAnswerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid duel answer payload' },
        { status: 400 }
      );
    }

    const { matchId, questionIndex, selectedOption } = validation.data;

    const result = await submitDuelAnswer(
      matchId,
      user.uid,
      questionIndex,
      selectedOption
    );

    return NextResponse.json({
      success: true,
      correct: result.correct,
      score: result.score,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('[Duel Answer API Error]:', error);
    const message = error instanceof Error ? error.message : 'Failed to evaluate duel answer';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
