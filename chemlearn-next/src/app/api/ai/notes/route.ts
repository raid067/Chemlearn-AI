import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse } from '../_helpers';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { aiNotesSchema } from '@/lib/validations';
import { secureGenerateAI, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (await isRateLimitedAsync('ai-notes', user.uid, 5, 60_000, { failClosedInProduction: true })) {
      return errorResponse('Too many notes generation requests. Please wait a moment.', 429);
    }
    
    const body = await parseSecureJson(req, MAX_BODY_LIMITS.PROMPT);
    const validation = aiNotesSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Topic is required', 400);
    }

    const { topic } = validation.data;
    const safeTopic = wrapUntrustedInput(topic, 'TOPIC');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate structured chemistry notes for SPM syllabus on the requested topic:
${safeTopic}

Return ONLY raw HTML content (e.g. <h2>, <p>, <ul>, <li>) without any markdown code blocks (\`\`\`). Focus on key definitions, concepts, and chemical equations where relevant.`;

    const notes = await secureGenerateAI<string>({
      uid: user.uid,
      endpoint: 'ai-notes',
      prompt,
      maxDailyQuota: 30,
    });

    return NextResponse.json({ notes });
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
    console.error('Notes API Error:', error);
    return errorResponse(error, 500);
  }
}
