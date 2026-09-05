import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse } from '../_helpers';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { aiWorksheetSchema } from '@/lib/validations';
import { secureGenerateAI, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (await isRateLimitedAsync('ai-worksheet', user.uid, 5, 60_000)) {
      return errorResponse('Too many worksheet generation requests. Please wait a moment.', 429);
    }
    
    const body = await parseSecureJson(req, MAX_BODY_LIMITS.PROMPT);
    const validation = aiWorksheetSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Weak topics are required', 400);
    }

    const { weakTopics } = validation.data;
    const safeTopics = wrapUntrustedInput(weakTopics, 'WEAK_TOPICS');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 3 exam-style remediation structured questions for SPM Chemistry focusing on these weak topics:
${safeTopics}

Provide the questions followed by the expected marking scheme.`;

    const worksheet = await secureGenerateAI<string>({
      uid: user.uid,
      endpoint: 'ai-worksheet',
      prompt,
      maxDailyQuota: 25,
    });

    return NextResponse.json({ worksheet });
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
    console.error('Worksheet API Error:', error);
    return errorResponse(error, 500);
  }
}
