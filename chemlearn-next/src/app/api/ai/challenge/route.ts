import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse } from '../_helpers';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { aiChallengeSchema } from '@/lib/validations';
import { storeAuthoritativeChallenge } from '@/lib/server/quizzes';
import {
  secureGenerateAI,
  wrapUntrustedInput,
  SYSTEM_SAFETY_GUARDRAIL,
  AIGatewayError,
  generatedMCQListSchema,
} from '@/lib/server/ai-gateway';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (await isRateLimitedAsync('ai-challenge', user.uid, 5, 60_000, { failClosedInProduction: true })) {
      return errorResponse('Too many challenge generation requests. Please wait a moment.', 429);
    }

    let topic = 'General SPM Chemistry';
    try {
      const body = await parseSecureJson(req, MAX_BODY_LIMITS.PROMPT);
      const validation = aiChallengeSchema.safeParse(body);
      if (!validation.success) {
        return errorResponse(validation.error.issues[0]?.message || 'Validation failed', 400);
      }
      if (validation.data.topic) {
        topic = validation.data.topic;
      }
    } catch (e) {
      if (e instanceof RequestPayloadError && e.statusCode === 413) {
        throw e;
      }
      // Empty body is acceptable for default challenge
    }
    
    const safeTopic = wrapUntrustedInput(topic, 'CHALLENGE_TOPIC');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 5 high-yield multiple-choice questions (MCQ) for a daily challenge covering:
${safeTopic}

Return the output ONLY as a valid JSON array of 5 objects. Each object should have properties:
- "q": string (the chemistry question text)
- "options": array of exactly 4 distinct strings
- "answer": number (0-3 index of the correct option)
- "explanation": string (brief explanation of the answer)
No markdown code fences.`;

    const validQuestions = await secureGenerateAI({
      uid: user.uid,
      endpoint: 'ai-challenge',
      prompt,
      schema: generatedMCQListSchema,
      maxDailyQuota: 20,
    });

    // Store as authoritative daily challenge tagged with active date
    const { challengeId, sanitizedQuestions } = await storeAuthoritativeChallenge(
      user.uid,
      topic,
      validQuestions
    );

    const clientQuestions = sanitizedQuestions.map((q) => ({
      q: q.question,
      options: q.options || [],
    }));

    return NextResponse.json({
      challengeId,
      questions: clientQuestions,
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
    console.error('Challenge API Error:', error);
    return errorResponse(error, 500);
  }
}
