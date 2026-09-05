import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse, generateGeminiText } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiGradeSchema } from '@/lib/validations';
import { validateImageBase64, ImageValidationError } from '@/lib/server/image-validator';
import { enforceAIQuota, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { Part } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    if (isRateLimited('ai-grade', user.uid, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json();
    const validation = aiGradeSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Image data is required', 400);
    }

    const { imageBase64, imageMimeType } = validation.data;

    // Check daily quota
    await enforceAIQuota(user.uid, 'ai-grade', 25);

    // Verify magic bytes
    const validatedImage = validateImageBase64(imageBase64, imageMimeType);

    const prompt = `${SYSTEM_SAFETY_GUARDRAIL}

You are a strict but fair chemistry teacher marking a student's homework. Carefully read the handwritten or typed answers in the image provided. Provide constructive feedback, point out any chemical errors (e.g., unbalanced equations, wrong formulas), and suggest how they can improve their SPM Chemistry exam technique.`;

    const promptParts: (string | Part)[] = [
      prompt,
      {
        inlineData: {
          data: validatedImage.cleanBase64,
          mimeType: validatedImage.detectedMimeType,
        },
      },
    ];

    const feedback = await generateGeminiText(promptParts);

    return NextResponse.json({ feedback });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof ImageValidationError || error instanceof AIGatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Grade API Error:', error);
    return errorResponse(error, 500);
  }
}
