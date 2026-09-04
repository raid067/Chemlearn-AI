import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, generateGeminiJson } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiChallengeSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);
    
    if (isRateLimited('ai-challenge', uid, 3, 60_000)) {
      return errorResponse('Too many challenge generation requests. Please wait a moment.', 429);
    }

    let topic = 'random SPM Chemistry topics';
    try {
      const body = await req.json();
      const validation = aiChallengeSchema.safeParse(body);
      if (!validation.success) {
        return errorResponse(validation.error.issues[0]?.message || 'Validation failed', 400);
      }
      if (validation.data.topic) {
        topic = validation.data.topic;
      }
    } catch {
      // Empty body is acceptable for default challenge
    }
    
    const prompt = `Generate 5 multiple-choice questions (MCQ) for a daily challenge covering ${topic}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties: "q" (string, the question), "options" (array of 4 strings), and "answer" (number, 0-3 index of the correct option). No markdown blocks.`;

    const questions = await generateGeminiJson(prompt);

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error('Challenge API Error:', error);
    return errorResponse(error, 500);
  }
}
