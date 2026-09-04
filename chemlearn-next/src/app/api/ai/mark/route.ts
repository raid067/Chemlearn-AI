import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, generateGeminiText } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiMarkSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);
    
    if (isRateLimited('ai-mark', uid, 10, 60_000)) {
      return errorResponse('Too many grading requests. Please wait a moment.', 429);
    }
    
    const body = await req.json();
    const validation = aiMarkSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Both expected and student answers are required', 400);
    }

    const { expectedAnswer, studentAnswer } = validation.data;

    const prompt = `Evaluate the student's answer against the expected answer for an SPM Chemistry structured question.
Score it out of 3 marks.
Expected Answer: ${expectedAnswer}
Student Answer: ${studentAnswer}
Provide a brief feedback and the score in the format "Score: X/3".`;

    const feedback = await generateGeminiText(prompt);

    return NextResponse.json({ feedback });
  } catch (error: unknown) {
    console.error('Mark API Error:', error);
    return errorResponse(error, 500);
  }
}
