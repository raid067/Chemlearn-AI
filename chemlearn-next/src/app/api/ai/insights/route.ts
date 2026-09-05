import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher, AuthError } from '@/lib/server/auth';
import { errorResponse, generateGeminiText } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiInsightsSchema } from '@/lib/validations';
import { enforceAIQuota, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';

export async function POST(req: NextRequest) {
  try {
    const user = await requireTeacher(req);
    
    if (isRateLimited('ai-insights', user.uid, 5, 60_000)) {
      return errorResponse('Too many insight generation requests. Please wait a moment.', 429);
    }
    
    const body = await req.json();
    const validation = aiInsightsSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Class summary is required', 400);
    }

    const { classSummary } = validation.data;

    // Check daily quota
    await enforceAIQuota(user.uid, 'ai-insights', 30);

    const safeSummary = wrapUntrustedInput(classSummary, 'CLASS_SUMMARY');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Act as an expert pedagogical advisor for SPM Chemistry teachers. Given this class data:
${safeSummary}

Give me 3 actionable teaching strategies or interventions to help improve student understanding and performance.`;

    const insights = await generateGeminiText(prompt);

    return NextResponse.json({ insights });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof AIGatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Insights API Error:', error);
    return errorResponse(error, 500);
  }
}
