import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, generateGeminiText } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiWorksheetSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);
    
    if (isRateLimited('ai-worksheet', uid, 3, 60_000)) {
      return errorResponse('Too many worksheet generation requests. Please wait a moment.', 429);
    }
    
    const body = await req.json();
    const validation = aiWorksheetSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Weak topics are required', 400);
    }

    const { weakTopics } = validation.data;

    const prompt = `Generate 3 exam-style remediation structured questions for SPM Chemistry focusing on these weak topics: ${weakTopics}. Provide the questions followed by the expected marking scheme.`;

    const worksheet = await generateGeminiText(prompt);

    return NextResponse.json({ worksheet });
  } catch (error: unknown) {
    console.error('Worksheet API Error:', error);
    return errorResponse(error, 500);
  }
}
