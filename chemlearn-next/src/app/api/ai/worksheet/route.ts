import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse, generateGeminiText } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiWorksheetSchema } from '@/lib/validations';
import { enforceAIQuota, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (isRateLimited('ai-worksheet', user.uid, 5, 60_000)) {
      return errorResponse('Too many worksheet generation requests. Please wait a moment.', 429);
    }
    
    const body = await req.json();
    const validation = aiWorksheetSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Weak topics are required', 400);
    }

    const { weakTopics } = validation.data;

    // Check daily quota
    await enforceAIQuota(user.uid, 'ai-worksheet', 25);

    const safeTopics = wrapUntrustedInput(weakTopics, 'WEAK_TOPICS');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 3 exam-style remediation structured questions for SPM Chemistry focusing on these weak topics:
${safeTopics}

Provide the questions followed by the expected marking scheme.`;

    const worksheet = await generateGeminiText(prompt);

    return NextResponse.json({ worksheet });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof AIGatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Worksheet API Error:', error);
    return errorResponse(error, 500);
  }
}
