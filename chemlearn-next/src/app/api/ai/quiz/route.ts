import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse } from '../_helpers';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { aiQuizSchema } from '@/lib/validations';
import { storeAuthoritativeQuiz, AuthoritativeMCQQuestion, AuthoritativeStructuredQuestion } from '@/lib/server/quizzes';
import {
  secureGenerateAI,
  wrapUntrustedInput,
  SYSTEM_SAFETY_GUARDRAIL,
  AIGatewayError,
  generatedMCQListSchema,
  generatedStructuredListSchema,
} from '@/lib/server/ai-gateway';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (await isRateLimitedAsync('ai-quiz', user.uid, 5, 60_000, { failClosedInProduction: true })) {
      return errorResponse('Too many quiz generation requests. Please wait a moment.', 429);
    }

    const body = await parseSecureJson(req, MAX_BODY_LIMITS.PROMPT);
    const validation = aiQuizSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Topic, difficulty, and type are required', 400);
    }

    const { topic, difficulty, type } = validation.data;
    const safeTopic = wrapUntrustedInput(topic, 'QUIZ_TOPIC');
    
    let prompt = '';
    if (type === 'MCQ') {
      prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 5 multiple-choice questions (MCQ) for SPM Chemistry topic:
${safeTopic}
Difficulty: ${difficulty}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties:
- "q": string (the question text)
- "options": array of exactly 4 distinct strings
- "answer": number (0-3 index of the correct option)
- "explanation": string (why the answer is correct)
No markdown blocks.`;
    } else {
      prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 5 structured questions for SPM Chemistry topic:
${safeTopic}
Difficulty: ${difficulty}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties:
- "question": string (the question text)
- "marks": number (e.g. 1, 2, or 3)
- "expectedAnswer": string (marking scheme / rubric)
No markdown blocks.`;
    }

    let validatedQuestions: (AuthoritativeMCQQuestion | AuthoritativeStructuredQuestion)[];

    if (type === 'MCQ') {
      validatedQuestions = await secureGenerateAI({
        uid: user.uid,
        endpoint: 'ai-quiz',
        prompt,
        schema: generatedMCQListSchema,
        maxDailyQuota: 30,
      });
    } else {
      validatedQuestions = await secureGenerateAI({
        uid: user.uid,
        endpoint: 'ai-quiz',
        prompt,
        schema: generatedStructuredListSchema,
        maxDailyQuota: 30,
      });
    }
    
    // Store authoritative questions with secret answers server-side
    const { quizId, sanitizedQuestions } = await storeAuthoritativeQuiz(
      user.uid,
      topic,
      difficulty,
      type as 'MCQ' | 'Structured',
      validatedQuestions
    );

    // Return sanitized questions without answer keys to prevent client-side leaks
    return NextResponse.json({
      quizId,
      questions: sanitizedQuestions,
    });
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
    console.error('Quiz API Error:', error);
    return errorResponse(error, 500);
  }
}

