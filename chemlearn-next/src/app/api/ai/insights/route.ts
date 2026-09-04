import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, generateGeminiText } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiInsightsSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);
    
    if (isRateLimited('ai-insights', uid, 3, 60_000)) {
      return errorResponse('Too many insight generation requests. Please wait a moment.', 429);
    }
    
    const body = await req.json();
    const validation = aiInsightsSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Class summary is required', 400);
    }

    const { classSummary } = validation.data;

    const prompt = `Act as an expert pedagogical advisor for SPM Chemistry teachers. Given this class data:
${classSummary}
Give me 3 actionable teaching strategies or interventions to help improve student understanding and performance.`;

    const insights = await generateGeminiText(prompt);

    return NextResponse.json({ insights });
  } catch (error: unknown) {
    console.error('Insights API Error:', error);
    return errorResponse(error, 500);
  }
}
