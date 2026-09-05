import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { errorResponse, generateGeminiJson } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiQuizSchema } from '@/lib/validations';
import { storeAuthoritativeQuiz } from '@/lib/server/quizzes';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (isRateLimited('ai-quiz', user.uid, 5, 60_000)) {
      return errorResponse('Too many quiz generation requests. Please wait a moment.', 429);
    }

    const body = await req.json();
    const validation = aiQuizSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Topic, difficulty, and type are required', 400);
    }

    const { topic, difficulty, type } = validation.data;
    
    let prompt = '';
    if (type === 'MCQ') {
      prompt = `Generate 5 multiple-choice questions (MCQ) for SPM Chemistry topic: ${topic}, difficulty: ${difficulty}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties: "q" (string, the question), "options" (array of 4 strings), "answer" (number, 0-3 index of the correct option), and "explanation" (string, why the answer is correct). No markdown blocks.`;
    } else {
      prompt = `Generate 5 structured questions for SPM Chemistry topic: ${topic}, difficulty: ${difficulty}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties: "question" (string), "marks" (number), and "expectedAnswer" (string). No markdown blocks.`;
    }

    const rawQuestions = await generateGeminiJson(prompt);
    
    // Store authoritative questions with secret answers server-side
    const { quizId, sanitizedQuestions } = await storeAuthoritativeQuiz(
      user.uid,
      topic,
      difficulty,
      type as 'MCQ' | 'Structured',
      Array.isArray(rawQuestions) ? rawQuestions : []
    );

    // Return sanitized questions without answer keys to prevent client-side leaks
    return NextResponse.json({
      quizId,
      questions: sanitizedQuestions,
    });
  } catch (error: unknown) {
    console.error('Quiz API Error:', error);
    return errorResponse(error, 500);
  }
}
