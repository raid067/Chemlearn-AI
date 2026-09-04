import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, genAI } from '../_helpers';
import { isRateLimited, validateImagePayload } from '@/lib/rate-limit';
import { aiChatSchema } from '@/lib/validations';
import { Part } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are ChemLearn AI Tutor for Malaysian SPM Chemistry (Form 4 & Form 5 KSSM DLP Dual-Language Programme).

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
    const uid = await verifyAuth(req);

    if (isRateLimited('ai-chat', uid, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json();
    const validation = aiChatSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Question or image is required', 400);
    }

    const { question, imageBase64, imageMimeType } = validation.data;

    const payloadError = validateImagePayload(imageBase64);
    if (payloadError) {
      return errorResponse(payloadError);
    }

    const modelName = imageBase64 ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_PROMPT });

    const content: (string | Part)[] = [];
    if (question) content.push(question);
    
    if (imageBase64 && imageMimeType) {
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      content.push({
        inlineData: {
          data: base64Data,
          mimeType: imageMimeType
        }
      });
    }

    const result = await model.generateContent(content);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    return errorResponse(error, 500);
  }
}
