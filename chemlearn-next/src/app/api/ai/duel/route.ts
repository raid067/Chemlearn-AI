import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse, generateGeminiJson } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiDuelSchema } from '@/lib/validations';
import { storeAuthoritativeDuel, ServerDuelQuestion } from '@/lib/server/duels';
import { generateMatchId } from '@/lib/utils';
import { enforceAIQuota, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { z } from 'zod';

const duelQuestionListSchema = z.array(
  z.object({
    q: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).length(4),
    ans: z.number().int().min(0).max(3),
  })
);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (isRateLimited('ai-duel', user.uid, 5, 60_000)) {
      return errorResponse('Too many duel generation requests. Please wait a moment.', 429);
    }

    // Check daily quota
    await enforceAIQuota(user.uid, 'ai-duel', 30);
    
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

    const safeTopic = wrapUntrustedInput(topic, 'DUEL_TOPIC');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 5 multiple-choice questions (MCQ) for a real-time multiplayer Duel on the SPM Chemistry topic:
${safeTopic}

Return the output ONLY as a valid JSON array of objects. Each object should have properties:
- "q": string (the question)
- "options": array of 4 strings
- "ans": number (0-3 index of the correct option)
No markdown blocks. Keep it engaging.`;

    const rawQuestions = await generateGeminiJson(prompt);
    const parsed = duelQuestionListSchema.safeParse(rawQuestions);
    
    const fullQuestions: ServerDuelQuestion[] = parsed.success && parsed.data.length > 0
      ? parsed.data
      : (Array.isArray(rawQuestions) ? rawQuestions : []).map((q: any) => ({
          q: String(q.q || 'SPM Chemistry Question'),
          options: Array.isArray(q.options) && q.options.length === 4
            ? q.options.map(String)
            : ['Option A', 'Option B', 'Option C', 'Option D'],
          ans: typeof q.ans === 'number' && q.ans >= 0 && q.ans <= 3 ? q.ans : 0,
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
    if (error instanceof AuthError || error instanceof AIGatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Duel API Error:', error);
    return errorResponse(error, 500);
  }
}

