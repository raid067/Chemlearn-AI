import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { awardXPEvent, updateAuthoritativeStreak } from '@/lib/server/gamification';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { CHAPTERS } from '@/lib/constants';
import { errorResponse } from '../../ai/_helpers';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';
import { z } from 'zod';

const lessonCompleteSchema = z.object({
  chapterId: z.string().trim().min(1, 'Chapter ID is required').max(100),
  topicId: z.string().trim().min(1, 'Topic ID is required').max(100),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Rate limit: 10 completions per minute per student
    if (await isRateLimitedAsync('lesson-complete', user.uid, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many lesson completion requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await parseSecureJson(req, MAX_BODY_LIMITS.JSON_DEFAULT);
    const validation = lessonCompleteSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Invalid lesson completion payload', 400);
    }

    const { chapterId, topicId } = validation.data;

    // Verify against authoritative syllabus constants
    const chapter = CHAPTERS.find((c) => c.id === chapterId);
    if (!chapter) {
      return errorResponse('Invalid chapter ID', 404);
    }

    const topic = chapter.topics.find((t) => t.id === topicId);
    if (!topic) {
      return errorResponse('Invalid topic ID for this chapter', 404);
    }

    // Award 25 XP idempotently (once per topic per student)
    const entityId = `${chapterId}_${topicId}`;
    const result = await awardXPEvent(user.uid, 'LESSON', entityId, 25, {
      chapterId,
      topicId,
      topicTitle: topic.title,
    });

    // Update streak authoritatively
    await updateAuthoritativeStreak(user.uid);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof RequestPayloadError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    console.error('Lesson Complete API Error:', error);
    return errorResponse(error, 500);
  }
}

