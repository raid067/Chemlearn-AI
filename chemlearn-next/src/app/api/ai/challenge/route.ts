import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { errorResponse, generateGeminiJson } from '../_helpers';
import { isRateLimited } from '@/lib/rate-limit';
import { aiChallengeSchema } from '@/lib/validations';
import { storeAuthoritativeQuiz } from '@/lib/server/quizzes';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    if (isRateLimited('ai-challenge', user.uid, 3, 60_000)) {
      return errorResponse('Too many challenge generation requests. Please wait a moment.', 429);
    }

    let topic = 'random SPM Chemistry topics';
    try {
      const body = await req.json();
      const validation = aiChallengeSchema.safeParse(body);
      if (!validation.success) {
        return errorResponse(validation.error.issues[0]?.message || 'Validation failed', 400);
      }
      if (validation.data.topic) {
        topic = validation.data.topic;
      }
    } catch {
      // Empty body is acceptable for default challenge
    }
    
    const prompt = `Generate 5 multiple-choice questions (MCQ) for a daily challenge covering ${topic}. 
Return the output ONLY as a valid JSON array of objects. Each object should have properties: "q" (string, the question), "options" (array of 4 strings), and "answer" (number, 0-3 index of the correct option). No markdown blocks.`;

    const rawQuestions = await generateGeminiJson(prompt);

    const { quizId: challengeId, sanitizedQuestions } = await storeAuthoritativeQuiz(
      user.uid,
      `Daily Challenge: ${topic}`,
      'Medium',
      'MCQ',
      Array.isArray(rawQuestions) ? rawQuestions : []
    );

    // Sanitize questions: strip answer property before sending to browser
    const clientQuestions = sanitizedQuestions.map((q) => ({
      q: q.question,
      options: q.options || [],
    }));

    return NextResponse.json({
      challengeId,
      questions: clientQuestions,
    });
  } catch (error: unknown) {
    console.error('Challenge API Error:', error);
    return errorResponse(error, 500);
  }
}
