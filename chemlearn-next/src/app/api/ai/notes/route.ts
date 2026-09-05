import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse, generateGeminiText } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiNotesSchema } from '@/lib/validations';
import { enforceAIQuota, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (isRateLimited('ai-notes', user.uid, 5, 60_000)) {
      return errorResponse('Too many notes generation requests. Please wait a moment.', 429);
    }
    
    const body = await req.json();
    const validation = aiNotesSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Topic is required', 400);
    }

    const { topic } = validation.data;

    // Check daily quota
    await enforceAIQuota(user.uid, 'ai-notes', 30);

    const safeTopic = wrapUntrustedInput(topic, 'TOPIC');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate structured chemistry notes for SPM syllabus on the requested topic:
${safeTopic}

Return ONLY raw HTML content (e.g. <h2>, <p>, <ul>, <li>) without any markdown code blocks (\`\`\`). Focus on key definitions, concepts, and chemical equations where relevant.`;

    const notes = await generateGeminiText(prompt);

    return NextResponse.json({ notes });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof AIGatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Notes API Error:', error);
    return errorResponse(error, 500);
  }
}
