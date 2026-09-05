import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse } from '../_helpers';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { aiMarkSchema } from '@/lib/validations';
import { secureGenerateAI, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (await isRateLimitedAsync('ai-mark', user.uid, 15, 60_000, { failClosedInProduction: true })) {
      return errorResponse('Too many grading requests. Please wait a moment.', 429);
    }
    
    const body = await parseSecureJson(req, MAX_BODY_LIMITS.PROMPT);
    const validation = aiMarkSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Both expected and student answers are required', 400);
    }

    const { expectedAnswer, studentAnswer } = validation.data;
    const safeExpected = wrapUntrustedInput(expectedAnswer, 'EXPECTED_ANSWER');
    const safeStudent = wrapUntrustedInput(studentAnswer, 'STUDENT_ANSWER');

    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Evaluate the student's answer against the expected answer for an SPM Chemistry structured question.
Score it out of 3 marks.

Expected Answer:
${safeExpected}

Student Answer:
${safeStudent}

Provide a brief feedback and the score in the format "Score: X/3".`;

    const feedback = await secureGenerateAI<string>({
      uid: user.uid,
      endpoint: 'ai-mark',
      prompt,
      maxDailyQuota: 50,
    });

    return NextResponse.json({ feedback });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof AIGatewayError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof RequestPayloadError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Mark API Error:', error);
    return errorResponse(error, 500);
  }
}
