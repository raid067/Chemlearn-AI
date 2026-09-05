import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse, generateGeminiText } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiMarkSchema } from '@/lib/validations';
import { enforceAIQuota, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (isRateLimited('ai-mark', user.uid, 15, 60_000)) {
      return errorResponse('Too many grading requests. Please wait a moment.', 429);
    }
    
    const body = await req.json();
    const validation = aiMarkSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Both expected and student answers are required', 400);
    }

    const { expectedAnswer, studentAnswer } = validation.data;

    // Check daily quota
    await enforceAIQuota(user.uid, 'ai-mark', 50);

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

    const feedback = await generateGeminiText(prompt);

    return NextResponse.json({ feedback });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof AIGatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Mark API Error:', error);
    return errorResponse(error, 500);
  }
}
