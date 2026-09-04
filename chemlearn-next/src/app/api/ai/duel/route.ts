import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, generateGeminiJson } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiDuelSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);
    
    if (isRateLimited('ai-duel', uid, 3, 60_000)) {
      return errorResponse('Too many duel generation requests. Please wait a moment.', 429);
    }
    
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is allowed, defaults to 'General Chemistry'
    }

    const validation = aiDuelSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Invalid request body', 400);
    }

    const topic = validation.data.topic || 'General Chemistry';

    const prompt = `Generate 5 multiple-choice questions (MCQ) for a real-time multiplayer Duel on the SPM Chemistry topic: ${topic}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties: "q" (string, the question), "options" (array of 4 strings), and "ans" (number, 0-3 index of the correct option). No markdown blocks. Keep it engaging.`;

    const rawQuestions = await generateGeminiJson(prompt);
    
    const questions = (Array.isArray(rawQuestions) ? rawQuestions : []).map((q: any) => ({
      q: q.q,
      options: q.options,
      ans: q.ans
    }));

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error('Duel API Error:', error);
    return errorResponse(error, 500);
  }
}
