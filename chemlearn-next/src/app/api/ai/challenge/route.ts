import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse, generateGeminiJson } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiChallengeSchema } from '@/lib/validations';
import { storeAuthoritativeChallenge } from '@/lib/server/quizzes';
import { enforceAIQuota, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { z } from 'zod';

const challengeQuestionListSchema = z.array(
  z.object({
    q: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).length(4),
    answer: z.number().int().min(0).max(3),
  })
);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (isRateLimited('ai-challenge', user.uid, 5, 60_000)) {
      return errorResponse('Too many challenge generation requests. Please wait a moment.', 429);
    }

    // Enforce daily AI usage quota (20 challenges/day)
    await enforceAIQuota(user.uid, 'ai-challenge', 20);

    let topic = 'General SPM Chemistry';
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
    
    const safeTopic = wrapUntrustedInput(topic, 'CHALLENGE_TOPIC');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 5 high-yield multiple-choice questions (MCQ) for a daily challenge covering:
${safeTopic}

Return the output ONLY as a valid JSON array of objects. Each object should have properties:
- "q": string (the chemistry question)
- "options": array of 4 distinct strings
- "answer": number (0-3 index of the correct option)
No markdown code fences.`;

    const rawQuestions = await generateGeminiJson(prompt);
    const parsed = challengeQuestionListSchema.safeParse(rawQuestions);

    const validQuestions = parsed.success && parsed.data.length > 0
      ? parsed.data
      : [
          {
            q: 'Which gas turns damp red litmus paper blue?',
            options: ['Ammonia (NH3)', 'Carbon dioxide (CO2)', 'Chlorine (Cl2)', 'Oxygen (O2)'],
            answer: 0,
          },
          {
            q: 'What is the color of copper(II) hydroxide precipitate?',
            options: ['Blue', 'Green', 'Brown', 'White'],
            answer: 0,
          },
          {
            q: 'Which alloy is formed from copper and zinc?',
            options: ['Brass', 'Bronze', 'Steel', 'Duralumin'],
            answer: 0,
          },
        ];

    // Store as authoritative daily challenge tagged with active date
    const { challengeId, sanitizedQuestions } = await storeAuthoritativeChallenge(
      user.uid,
      topic,
      validQuestions
    );

    const clientQuestions = sanitizedQuestions.map((q) => ({
      q: q.question,
      options: q.options || [],
    }));

    return NextResponse.json({
      challengeId,
      questions: clientQuestions,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof AIGatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Challenge API Error:', error);
    return errorResponse(error, 500);
  }
}
