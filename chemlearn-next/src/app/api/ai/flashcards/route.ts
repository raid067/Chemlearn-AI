import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse, generateGeminiJson } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiFlashcardsSchema } from '@/lib/validations';
import { enforceAIQuota, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { z } from 'zod';

const flashcardsOutputSchema = z.array(
  z.object({
    question: z.string().trim().min(1),
    answer: z.string().trim().min(1),
  })
);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (isRateLimited('ai-flashcards', user.uid, 5, 60_000)) {
      return errorResponse('Too many flashcard generation requests. Please wait a moment.', 429);
    }
    
    const body = await req.json();
    const validation = aiFlashcardsSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Topic is required', 400);
    }

    const { topic } = validation.data;

    // Check daily quota
    await enforceAIQuota(user.uid, 'ai-flashcards', 30);

    const safeTopic = wrapUntrustedInput(topic, 'TOPIC');
    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 10 flashcards for SPM Chemistry on the requested topic:
${safeTopic}

Return the output ONLY as a valid JSON array of objects. Each object should have properties: "question" (string) and "answer" (string). No markdown blocks.`;

    const rawOutput = await generateGeminiJson(prompt);
    const parsed = flashcardsOutputSchema.safeParse(rawOutput);

    const flashcards = parsed.success && parsed.data.length > 0
      ? parsed.data
      : Array.isArray(rawOutput)
        ? rawOutput
            .filter((card: any) => card && (card.question || card.q) && (card.answer || card.a))
            .map((card: any) => ({
              question: String(card.question || card.q),
              answer: String(card.answer || card.a),
            }))
        : [];

    return NextResponse.json({ flashcards });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof AIGatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Flashcards API Error:', error);
    return errorResponse(error, 500);
  }
}

