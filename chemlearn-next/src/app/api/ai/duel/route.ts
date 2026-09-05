import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse, generateGeminiJson } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiDuelSchema } from '@/lib/validations';
import { storeAuthoritativeDuel, ServerDuelQuestion } from '@/lib/server/duels';
import { generateMatchId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (isRateLimited('ai-duel', user.uid, 5, 60_000)) {
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
    const matchId = validation.data.matchId || generateMatchId();

    const prompt = `Generate 5 multiple-choice questions (MCQ) for a real-time multiplayer Duel on the SPM Chemistry topic: ${topic}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties: "q" (string, the question), "options" (array of 4 strings), and "ans" (number, 0-3 index of the correct option). No markdown blocks. Keep it engaging.`;

    const rawQuestions = await generateGeminiJson(prompt);
    
    const fullQuestions: ServerDuelQuestion[] = (Array.isArray(rawQuestions) ? rawQuestions : []).map((q: any) => ({
      q: String(q.q || ''),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      ans: typeof q.ans === 'number' ? q.ans : 0
    }));

    if (fullQuestions.length === 0) {
      return errorResponse('Failed to generate valid duel questions', 502);
    }

    // Persist correct answers authoritatively on the server
    await storeAuthoritativeDuel(matchId, user.uid, fullQuestions);

    // Sanitize: client NEVER receives the answer key
    const questions = fullQuestions.map((q) => ({
      q: q.q,
      options: q.options,
    }));

    return NextResponse.json({ matchId, questions });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    console.error('Duel API Error:', error);
    return errorResponse(error, 500);
  }
}
