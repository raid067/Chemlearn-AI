import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, generateGeminiJson } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiFlashcardsSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);
    
    if (isRateLimited('ai-flashcards', uid, 5, 60_000)) {
      return errorResponse('Too many flashcard generation requests. Please wait a moment.', 429);
    }
    
    const body = await req.json();
    const validation = aiFlashcardsSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Topic is required', 400);
    }

    const { topic } = validation.data;

    const prompt = `Generate 10 flashcards for SPM Chemistry topic: ${topic}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties: "question" (string) and "answer" (string). No markdown blocks.`;

    const flashcards = await generateGeminiJson(prompt);

    return NextResponse.json({ flashcards });
  } catch (error: unknown) {
    console.error('Flashcards API Error:', error);
    return errorResponse(error, 500);
  }
}
