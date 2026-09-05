import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse, genAI } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiChatSchema } from '@/lib/validations';
import { validateImageBase64, ImageValidationError } from '@/lib/server/image-validator';
import { enforceAIQuota, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { Part } from '@google/generative-ai';

const SYSTEM_PROMPT = `${SYSTEM_SAFETY_GUARDRAIL}

You are ChemLearn AI Tutor for Malaysian SPM Chemistry (Form 4 & Form 5 KSSM DLP Dual-Language Programme).

Rules:
- Adapt language automatically to the student's language (if question contains Malay words like "apa", "bagaimana", "terangkan", "asid", "garam", "aloi", "kenapa", reply in clear Bahasa Melayu using official KSSM SPM Chemistry terms. Otherwise reply in English).
- Keep total answer concise (under 180 words).
- Provide clear real-world examples and chemical equations.
- STRICT FORMATTING RULE: DO NOT use LaTeX formatting or math blocks. Use standard Unicode characters for chemical formulas and equations (e.g., H2O, OH-, Cu2+).
- If the user provides an image, carefully analyze the chemistry diagrams, graphs, or equations in the image to provide your answer.

Answer format:
Explanation / Penerangan:
(short explanation)

Example / Contoh:
(one real-world example)

SPM Marking Points / Markah SPM:
(bulleted key marking points)

SPM Tip / Petua SPM:
(quick exam advice)`;

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    if (isRateLimited('ai-chat', user.uid, 15, 60_000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json();
    const validation = aiChatSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Question or image is required', 400);
    }

    const { question, imageBase64, imageMimeType } = validation.data;

    // Check daily quota
    await enforceAIQuota(user.uid, 'ai-chat', 60);

    const content: (string | Part)[] = [];

    if (question) {
      // Delimit user input to stop prompt injection
      content.push(wrapUntrustedInput(question, 'STUDENT_QUESTION'));
    }

    if (imageBase64) {
      // Magic bytes and mime verification
      const validatedImage = validateImageBase64(imageBase64, imageMimeType);
      content.push({
        inlineData: {
          data: validatedImage.cleanBase64,
          mimeType: validatedImage.detectedMimeType,
        },
      });
    }

    const modelName = imageBase64 ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_PROMPT });

    const result = await model.generateContent(content);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof ImageValidationError || error instanceof AIGatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Chat API Error:', error);
    return errorResponse(error, 500);
  }
}
