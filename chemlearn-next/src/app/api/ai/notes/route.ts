import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, generateGeminiText } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiNotesSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);
    
    if (isRateLimited('ai-notes', uid, 5, 60_000)) {
      return errorResponse('Too many notes generation requests. Please wait a moment.', 429);
    }
    
    const body = await req.json();
    const validation = aiNotesSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Topic is required', 400);
    }

    const { topic } = validation.data;

    const prompt = `Generate structured chemistry notes for SPM syllabus topic: ${topic}. Return ONLY raw HTML without any markdown code blocks (\`\`\`). Focus on key definitions, concepts, and chemical equations where relevant.`;

    const notes = await generateGeminiText(prompt);

    return NextResponse.json({ notes });
  } catch (error: unknown) {
    console.error('Notes API Error:', error);
    return errorResponse(error, 500);
  }
}
