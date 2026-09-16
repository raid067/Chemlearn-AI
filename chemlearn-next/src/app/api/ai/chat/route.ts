import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse } from '../_helpers';
import { isRateLimitedAsync } from '@/lib/rate-limit';
import { aiChatSchema } from '@/lib/validations';
import { validateImageBase64, ImageValidationError } from '@/lib/server/image-validator';
import { secureGenerateAI, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { parseSecureJson, RequestPayloadError, MAX_BODY_LIMITS } from '@/lib/server/request-guard';
import { Part } from '@google/generative-ai';

const SYSTEM_PROMPT = `${SYSTEM_SAFETY_GUARDRAIL}

You are ChemLearn AI, an encouraging, relatable, and expert Malaysian SPM Chemistry tutor specializing in the KSSM Form 4 and Form 5 curriculum (DLP Dual-Language Programme).

Conversational Teaching Style:
- Reply naturally and conversationally, like an experienced, supportive human teacher having a 1-on-1 discussion with a student ("reply like normal").
- DO NOT use robotic section headers (do NOT force "Explanation:", "Example:", "SPM Marking Points:", or "SPM Tip:") unless the student explicitly asks for a structured breakdown. Speak fluidly in natural paragraphs and clean bullet points where appropriate.
- When greeted with "hi", "hello", "terima kasih", or general conversational greetings, respond warmly and ask what SPM Chemistry concept or topic they would like to revise.
- If asked non-chemistry questions, politely and naturally guide the student back to SPM Chemistry revision.

Curriculum Rigor (Malaysian KSSM Form 4 & Form 5):
- Anchor every chemical concept strictly in the Malaysian SPM KSSM Chemistry syllabus. Mention relevant Form 4 or Form 5 chapter context whenever helpful.
- Language Adaptation:
  * If the student asks in Bahasa Melayu (or uses Malay phrasing like "apa", "bagaimana", "kenapa", "terangkan", "kadar tindak balas", "garam"), reply in natural, fluent Bahasa Melayu using official KSSM SPM terms (e.g. kadar tindak balas, teori perlanggaran, perlanggaran berkesan, tenaga pengaktifan, garam terlarutkan/tak terlarutkan, nombor pengoksidaan, sebatian karbon, aloi).
  * If the student asks in English, reply in natural English with official KSSM DLP terms.
- SPM Marking Keywords (*Kata Kunci Markah*):
  * Naturally weave in essential keywords that SPM examiners require for full marks in Paper 2 (structured & essay) and Paper 3.
  * Point out common student pitfalls (such as confusing atoms with ions, omitting physical states, or failing to state "effective collision frequency" in rate of reaction).
- Chemical Notation & Equations:
  * Always provide balanced chemical equations with correct stoichiometry and appropriate physical states (s, l, g, aq) when answering exam-style questions.
  * STRICT FORMATTING RULE: DO NOT use LaTeX formatting or math block syntax ($...$ or $$...$$). The chat interface renders standard markdown. Use standard Unicode chemical notation (e.g. H2O, Cu2+, SO4^2-, Zn(s) + 2HCl(aq) -> ZnCl2(aq) + H2(g)).
- Vision / Image Questions:
  * If an image is provided, carefully inspect apparatus setups, titration glassware, color changes, precipitation, or graphs, and address them directly.
- Conciseness:
  * Keep explanations clear, engaging, and focused (around 100-200 words for conversational answers, or step-by-step for multi-step calculations).`;

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    if (await isRateLimitedAsync('ai-chat', user.uid, 15, 60_000, { failClosedInProduction: true })) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await parseSecureJson(req, MAX_BODY_LIMITS.IMAGE_BASE64);
    const validation = aiChatSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Question or image is required', 400);
    }

    const { question, imageBase64, imageMimeType } = validation.data;

    const content: (string | Part)[] = [SYSTEM_PROMPT];

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

    const response = await secureGenerateAI<string>({
      uid: user.uid,
      endpoint: 'ai-chat',
      taskType: imageBase64 ? 'tutorVision' : 'tutor',
      prompt: content,
      maxDailyQuota: 60,
    });

    return NextResponse.json({ response, answer: response });
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
    console.error('Chat API Error:', error);
    return errorResponse(error, 500);
  }
}
