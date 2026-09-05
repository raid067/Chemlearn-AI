import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { duelFinishSchema } from '@/lib/validations';
import { finishDuelPlayer } from '@/lib/server/duels';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const body = await req.json();
    const validation = duelFinishSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid duel finish payload' },
        { status: 400 }
      );
    }

    const { matchId } = validation.data;

    const result = await finishDuelPlayer(matchId, user.uid);

    return NextResponse.json({
      success: true,
      status: result.status,
      winnerUid: result.winnerUid,
      xpAwarded: result.xpAwarded,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('[Duel Finish API Error]:', error);
    const message = error instanceof Error ? error.message : 'Failed to finalize duel match';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
