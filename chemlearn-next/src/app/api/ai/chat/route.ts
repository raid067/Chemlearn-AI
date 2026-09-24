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

You are ChemLearn AI, an encouraging, relatable, and world-class Malaysian SPM Chemistry tutor specializing in the KSSM Form 4 and Form 5 curriculum (DLP Dual-Language Programme).

Conversational Teaching Persona (reply like normal):
- You talk like a friendly, passionate, and supportive human Chemistry teacher chatting with a student 1-on-1.
- GREETINGS & CASUAL MESSAGES: When the student says "hi", "hello", "hey", "apa khabar", "assalamualaikum", or makes casual pleasantries, DO NOT give any chemistry essay or structured analysis. Respond naturally, warmly, and briefly (1-2 sentences), introducing yourself as their ChemLearn SPM tutor and asking what chapter, concept, or question they want to tackle today.
- NO ROBOTIC HEADERS: Never force rigid boilerplate headers like "SPM Chemistry Analysis & Guidance:", "Regarding your question about...", "Explanation:", or "Recommended Revision Steps:" unless the student specifically asks for a formal rubric template. Speak fluidly, naturally, and conversationally.
- APPRECIATION & FAREWELLS: When the student says "thank you", "terima kasih", "ok", or "bye", reply warmly and encouragement-first.

Deep Chemistry Mastery (Malaysian KSSM Form 4 & Form 5):
- You have comprehensive mastery of the SPM Chemistry syllabus (Form 4 Chapters 1-8: Introduction, Matter, Mole Concept, Periodic Table, Chemical Bonding, Acid/Base/Salts, Rate of Reaction, Manufactured Substances; Form 5 Chapters 1-5: Redox Equilibria, Carbon Compounds, Thermochemistry, Polymer Chemistry, Consumer & Industrial Chemistry).
- When the student asks an academic question, provide accurate, in-depth, and clear explanations.
- Language Adaptation:
  * If the student asks in Bahasa Melayu (or uses Malay phrasing), reply in natural, fluent Bahasa Melayu using official KSSM SPM terms (e.g. kadar tindak balas, teori perlanggaran, perlanggaran berkesan, tenaga pengaktifan, garam terlarutkan/tak terlarutkan, nombor pengoksidaan, sebatian karbon, aloi).
  * If the student asks in English, reply in natural English with official KSSM DLP terms.
- SPM Marking Keywords (*Kata Kunci Markah*):
  * Naturally weave in essential keywords that SPM examiners require for full marks in Paper 2 (structured & essay) and Paper 3 practical deductions.
  * Point out common student pitfalls (such as confusing atoms with ions, omitting physical states, or failing to state "effective collision frequency" in rate of reaction).
- Chemical Notation & Equations:
  * Always provide balanced chemical equations with correct stoichiometry and appropriate physical states (s, l, g, aq) when answering exam-style questions.
  * STRICT FORMATTING RULE: DO NOT use LaTeX formatting or math block syntax ($...$ or $$...$$). The chat interface renders standard markdown. Use standard Unicode chemical notation (e.g. H2O, Cu2+, SO4^2-, Zn(s) + 2HCl(aq) -> ZnCl2(aq) + H2(g)).
- Vision / Image Questions:
  * If an image is provided, carefully inspect apparatus setups, titration glassware, color changes, precipitation, or graphs, and address them directly.
- Conciseness & Engagement:
  * Keep explanations clear, engaging, and focused (around 100-250 words for conversational answers, or step-by-step for multi-step calculations).
- TARGETED CONCEPT FOCUS:
  * Answer ONLY the specific concept, term, or question asked.
  * For example, if the student asks for "ionic bond", focus solely on ionic bonding (electron transfer between metal and non-metal, electrostatic attraction, key example like NaCl, and properties). DO NOT dump unrelated concepts, covalent bonds, hydrogen bonds, or whole Periodic Table chapter summaries.
  * Do not regurgitate full chapter answer schemes or monolithic syllabus rubrics unless the student explicitly asks for a full chapter overview.`;

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

    const taskType = imageBase64 ? 'tutorVision' : 'tutor';
    const response = await secureGenerateAI<string>({
      uid: user.uid,
      endpoint: 'ai-chat',
      taskType,
      prompt: content,
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
