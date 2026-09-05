import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse } from '../_helpers';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { aiGradeSchema } from '@/lib/validations';
import { validateImageBase64, ImageValidationError } from '@/lib/server/image-validator';
import { secureGenerateAI, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';
import { Part } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    if (await isRateLimitedAsync('ai-grade', user.uid, 5, 60_000, { failClosedInProduction: true })) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await parseSecureJson(req, MAX_BODY_LIMITS.IMAGE_BASE64);
    const validation = aiGradeSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Image data is required', 400);
    }

    const { imageBase64, imageMimeType } = validation.data;

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

    const feedback = await secureGenerateAI<string>({
      uid: user.uid,
      endpoint: 'ai-grade',
      prompt: promptParts,
      modelName: 'gemini-1.5-flash',
      maxDailyQuota: 25,
    });

    return NextResponse.json({ feedback });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof ImageValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof AIGatewayError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof RequestPayloadError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Grade API Error:', error);
    return errorResponse(error, 500);
  }
}
