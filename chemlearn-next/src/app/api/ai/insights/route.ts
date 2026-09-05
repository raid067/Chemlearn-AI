import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher, AuthError } from '@/lib/server/auth';
import { errorResponse } from '../_helpers';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { aiInsightsSchema } from '@/lib/validations';
import { secureGenerateAI, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';

export async function POST(req: NextRequest) {
  try {
    const user = await requireTeacher(req);
    
    if (await isRateLimitedAsync('ai-insights', user.uid, 5, 60_000, { failClosedInProduction: true })) {
      return errorResponse('Too many insight generation requests. Please wait a moment.', 429);
    }
    
    const body = await parseSecureJson(req, MAX_BODY_LIMITS.PROMPT);
    const validation = aiInsightsSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Class summary is required', 400);
    }

    const { classSummary } = validation.data;
    const safeSummary = wrapUntrustedInput(classSummary, 'CLASS_SUMMARY');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Act as an expert pedagogical advisor for SPM Chemistry teachers. Given this class data:
${safeSummary}

Give me 3 actionable teaching strategies or interventions to help improve student understanding and performance.`;

    const insights = await secureGenerateAI<string>({
      uid: user.uid,
      endpoint: 'ai-insights',
      prompt,
      maxDailyQuota: 30,
    });

    return NextResponse.json({ insights });
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
    console.error('Insights API Error:', error);
    return errorResponse(error, 500);
  }
}
