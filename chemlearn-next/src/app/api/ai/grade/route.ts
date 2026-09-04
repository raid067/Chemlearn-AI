import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, generateGeminiText } from '../_helpers';
import { isRateLimited, validateImagePayload } from '@/lib/rate-limit';
import { aiGradeSchema } from '@/lib/validations';
import { Part } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);

    if (isRateLimited('ai-grade', uid, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json();
    const validation = aiGradeSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Image data is required', 400);
    }

    const { imageBase64, imageMimeType } = validation.data;

    const payloadError = validateImagePayload(imageBase64);
    if (payloadError) {
      return errorResponse(payloadError);
    }

    const prompt = `You are a strict but fair chemistry teacher marking a student's homework. Carefully read the handwritten or typed answers in the image provided. Provide constructive feedback, point out any chemical errors (e.g., unbalanced equations, wrong formulas), and suggest how they can improve their SPM Chemistry exam technique.`;

    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const promptParts: (string | Part)[] = [
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: imageMimeType
        }
      }
    ];

    const feedback = await generateGeminiText(promptParts);

    return NextResponse.json({ feedback });
  } catch (error: unknown) {
    console.error('Grade API Error:', error);
    return errorResponse(error, 500);
  }
}
