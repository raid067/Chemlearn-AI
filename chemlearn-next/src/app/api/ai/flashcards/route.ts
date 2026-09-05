import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse } from '../_helpers';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { aiFlashcardsSchema } from '@/lib/validations';
import {
  secureGenerateAI,
  wrapUntrustedInput,
  SYSTEM_SAFETY_GUARDRAIL,
  AIGatewayError,
  generatedFlashcardListSchema,
} from '@/lib/server/ai-gateway';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (await isRateLimitedAsync('ai-flashcards', user.uid, 5, 60_000, { failClosedInProduction: true })) {
      return errorResponse('Too many flashcard generation requests. Please wait a moment.', 429);
    }
    
    const body = await parseSecureJson(req, MAX_BODY_LIMITS.PROMPT);
    const validation = aiFlashcardsSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Topic is required', 400);
    }

    const { topic } = validation.data;
    const safeTopic = wrapUntrustedInput(topic, 'TOPIC');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 10 flashcards for SPM Chemistry on the requested topic:
${safeTopic}

Return the output ONLY as a valid JSON array of 10 objects. Each object should have properties:
- "question": string (the front concept prompt)
- "answer": string (the concise accurate chemical explanation)
No markdown blocks.`;

    const flashcards = await secureGenerateAI({
      uid: user.uid,
      endpoint: 'ai-flashcards',
      prompt,
      schema: generatedFlashcardListSchema,
      maxDailyQuota: 30,
    });

    return NextResponse.json({ flashcards });
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
    console.error('Flashcards API Error:', error);
    return errorResponse(error, 500);
  }
}

