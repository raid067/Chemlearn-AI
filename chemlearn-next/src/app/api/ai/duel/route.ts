import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse } from '../_helpers';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { aiDuelSchema } from '@/lib/validations';
import { storeAuthoritativeDuel, ServerDuelQuestion } from '@/lib/server/duels';
import { generateMatchId } from '@/lib/utils';
import {
  secureGenerateAI,
  wrapUntrustedInput,
  SYSTEM_SAFETY_GUARDRAIL,
  AIGatewayError,
  generatedDuelListSchema,
} from '@/lib/server/ai-gateway';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (await isRateLimitedAsync('ai-duel', user.uid, 5, 60_000)) {
      return errorResponse('Too many duel generation requests. Please wait a moment.', 429);
    }

    let body = {};
    try {
      body = await parseSecureJson(req, MAX_BODY_LIMITS.PROMPT);
    } catch (e) {
      if (e instanceof RequestPayloadError && e.statusCode === 413) {
        throw e;
      }
      // Empty body is allowed, defaults to 'General Chemistry'
    }

    const validation = aiDuelSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Invalid request body', 400);
    }

    const topic = validation.data.topic || 'General Chemistry';
    const matchId = validation.data.matchId || generateMatchId();

    const safeTopic = wrapUntrustedInput(topic, 'DUEL_TOPIC');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 5 multiple-choice questions (MCQ) for a real-time multiplayer Duel on the SPM Chemistry topic:
${safeTopic}

Return the output ONLY as a valid JSON array of 5 objects. Each object should have properties:
- "q": string (the question text)
- "options": array of exactly 4 distinct strings
- "ans": number (0-3 index of the correct option)
No markdown blocks. Keep it engaging.`;

    const fullQuestions: ServerDuelQuestion[] = await secureGenerateAI({
      uid: user.uid,
      endpoint: 'ai-duel',
      prompt,
      schema: generatedDuelListSchema,
      maxDailyQuota: 30,
    });

    // Persist correct answers authoritatively on the server
    await storeAuthoritativeDuel(matchId, user.uid, fullQuestions);

    // Sanitize: client NEVER receives the answer key
    const questions = fullQuestions.map((q) => ({
      q: q.q,
      options: q.options,
    }));

    return NextResponse.json({ matchId, questions });
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
    console.error('Duel API Error:', error);
    return errorResponse(error, 500);
  }
}

