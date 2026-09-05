import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { gradeQuizSubmission } from '@/lib/server/quizzes';
import { errorResponse } from '../../ai/_helpers';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';
import { z } from 'zod';

const quizSubmitSchema = z.object({
  quizId: z.string().trim().min(1, 'Quiz ID is required'),
  answers: z.record(z.string(), z.union([z.number(), z.string()])).or(
    z.record(z.number(), z.union([z.number(), z.string()]))
  ),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const body = await parseSecureJson(req, MAX_BODY_LIMITS.JSON_DEFAULT);
    const validation = quizSubmitSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Invalid submission payload', 400);
    }

    const { quizId, answers } = validation.data;
    const result = await gradeQuizSubmission(quizId, user.uid, answers);

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    if (error instanceof RequestPayloadError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.statusCode });
    }
    console.error('Quiz Submit API Error:', error);
    return errorResponse(error, 500);
  }
}
