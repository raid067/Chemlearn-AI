import { z } from 'zod';

// Gamification
export const syncGamificationSchema = z.object({
  action: z.enum(['COMPLETE_LESSON', 'WIN_DUEL', 'COMPLETE_QUIZ', 'DAILY_CHALLENGE'], {
    message: 'Invalid or unsupported action'
  }),
});

export type SyncGamificationPayload = z.infer<typeof syncGamificationSchema>;

// AI endpoints
export const aiChallengeSchema = z.object({
  topic: z.string().optional(),
});

export const aiChatSchema = z.object({
  question: z.string().optional(),
  imageBase64: z.string().optional(),
  imageMimeType: z.string().optional(),
}).refine((data) => !!(data.question?.trim() || data.imageBase64), {
  message: 'Question or image is required',
});

export const aiDuelSchema = z.object({
  topic: z.string().default('General Chemistry').optional(),
});

export const aiFlashcardsSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
});

export const aiGradeSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required'),
  imageMimeType: z.string().min(1, 'Image MIME type is required'),
});

export const aiInsightsSchema = z.object({
  classSummary: z.string().min(1, 'Class summary is required'),
});

export const aiMarkSchema = z.object({
  expectedAnswer: z.string().min(1, 'Both expected and student answers are required'),
  studentAnswer: z.string().min(1, 'Both expected and student answers are required'),
});

export const aiNotesSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
});

export const aiQuizSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  type: z.string().min(1, 'Type is required'),
});

export const aiWorksheetSchema = z.object({
  weakTopics: z.string().min(1, 'Weak topics are required'),
});

// Classes
export const createClassSchema = z.object({
  className: z.string().min(1, 'Class name is required'),
});

export const joinClassSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});
