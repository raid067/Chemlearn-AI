import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/server/auth';
import { errorResponse, generateGeminiJson } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiQuizSchema } from '@/lib/validations';
import { storeAuthoritativeQuiz } from '@/lib/server/quizzes';
import { enforceAIQuota, wrapUntrustedInput, SYSTEM_SAFETY_GUARDRAIL, AIGatewayError } from '@/lib/server/ai-gateway';
import { z } from 'zod';

const mcqListSchema = z.array(
  z.object({
    q: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).length(4),
    answer: z.number().int().min(0).max(3),
    explanation: z.string().default(''),
  })
);

const structuredListSchema = z.array(
  z.object({
    question: z.string().trim().min(1),
    marks: z.number().int().min(1).max(10).default(2),
    expectedAnswer: z.string().trim().min(1),
  })
);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (isRateLimited('ai-quiz', user.uid, 5, 60_000)) {
      return errorResponse('Too many quiz generation requests. Please wait a moment.', 429);
    }

    // Check daily quota (30 quizzes per day)
    await enforceAIQuota(user.uid, 'ai-quiz', 30);

    const body = await req.json();
    const validation = aiQuizSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Topic, difficulty, and type are required', 400);
    }

    const { topic, difficulty, type } = validation.data;
    const safeTopic = wrapUntrustedInput(topic, 'QUIZ_TOPIC');
    
    let prompt = '';
    if (type === 'MCQ') {
      prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 5 multiple-choice questions (MCQ) for SPM Chemistry topic:
${safeTopic}
Difficulty: ${difficulty}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties:
- "q": string (the question)
- "options": array of 4 distinct strings
- "answer": number (0-3 index of the correct option)
- "explanation": string (why the answer is correct)
No markdown blocks.`;
    } else {
      prompt = `${SYSTEM_SAFETY_GUARDRAIL}

Generate 5 structured questions for SPM Chemistry topic:
${safeTopic}
Difficulty: ${difficulty}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties:
- "question": string
- "marks": number (e.g. 1, 2, or 3)
- "expectedAnswer": string (marking scheme / rubric)
No markdown blocks.`;
    }

    const rawQuestions = await generateGeminiJson(prompt);
    let validatedQuestions: any[] = [];

    if (type === 'MCQ') {
      const parsed = mcqListSchema.safeParse(rawQuestions);
      if (parsed.success && parsed.data.length > 0) {
        validatedQuestions = parsed.data;
      } else if (Array.isArray(rawQuestions)) {
        validatedQuestions = rawQuestions.map((q: any) => ({
          q: String(q.q || 'SPM Chemistry Question'),
          options: Array.isArray(q.options) && q.options.length === 4
            ? q.options.map(String)
            : ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: typeof q.answer === 'number' && q.answer >= 0 && q.answer <= 3 ? q.answer : 0,
          explanation: String(q.explanation || ''),
        }));
      }
    } else {
      const parsed = structuredListSchema.safeParse(rawQuestions);
      if (parsed.success && parsed.data.length > 0) {
        validatedQuestions = parsed.data;
      } else if (Array.isArray(rawQuestions)) {
        validatedQuestions = rawQuestions.map((q: any) => ({
          question: String(q.question || 'SPM Chemistry Question'),
          marks: typeof q.marks === 'number' ? Math.max(1, Math.min(10, q.marks)) : 2,
          expectedAnswer: String(q.expectedAnswer || 'Expected answer'),
        }));
      }
    }
    
    // Store authoritative questions with secret answers server-side
    const { quizId, sanitizedQuestions } = await storeAuthoritativeQuiz(
      user.uid,
      topic,
      difficulty,
      type as 'MCQ' | 'Structured',
      validatedQuestions
    );

    // Return sanitized questions without answer keys to prevent client-side leaks
    return NextResponse.json({
      quizId,
      questions: sanitizedQuestions,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError || error instanceof AIGatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Quiz API Error:', error);
    return errorResponse(error, 500);
  }
}

