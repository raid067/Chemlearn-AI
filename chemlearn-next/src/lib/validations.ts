import { z } from 'zod';

// Gamification
export const syncGamificationSchema = z.object({
  action: z.enum(['COMPLETE_LESSON', 'WIN_DUEL', 'COMPLETE_QUIZ', 'DAILY_CHALLENGE'], {
    message: 'Invalid or unsupported action'
  }),
}).strict();

export type SyncGamificationPayload = z.infer<typeof syncGamificationSchema>;

// AI endpoints
export const aiChallengeSchema = z.object({
  topic: z.string().trim().max(100).optional(),
}).strict();

export const aiChatSchema = z.object({
  question: z.string().trim().max(2000).optional(),
  imageBase64: z.string().max(10_000_000).optional(),
  imageMimeType: z.string().trim().max(50).optional(),
}).strict().refine((data) => !!(data.question?.trim() || data.imageBase64), {
  message: 'Question or image is required',
});

export const aiDuelSchema = z.object({
  topic: z.string().trim().max(100).default('General Chemistry').optional(),
  matchId: z.string().trim().max(32).optional(),
}).strict();

export const aiFlashcardsSchema = z.object({
  topic: z.string().trim().min(1, 'Topic is required').max(100),
}).strict();

export const aiGradeSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required').max(10_000_000),
  imageMimeType: z.string().trim().min(1, 'Image MIME type is required').max(50),
}).strict();

export const aiInsightsSchema = z.object({
  classSummary: z.string().trim().min(1, 'Class summary is required').max(10_000),
}).strict();

export const aiMarkSchema = z.object({
  expectedAnswer: z.string().trim().min(1, 'Both expected and student answers are required').max(5000),
  studentAnswer: z.string().trim().min(1, 'Both expected and student answers are required').max(5000),
}).strict();

export const aiNotesSchema = z.object({
  topic: z.string().trim().min(1, 'Topic is required').max(100),
}).strict();

export const aiQuizSchema = z.object({
  topic: z.string().trim().min(1, 'Topic is required').max(100),
  difficulty: z.string().trim().min(1, 'Difficulty is required').max(50),
  type: z.string().trim().min(1, 'Type is required').max(50),
}).strict();

export const aiWorksheetSchema = z.object({
  weakTopics: z.string().trim().min(1, 'Weak topics are required').max(500),
}).strict();

// Duels
export const duelAnswerSchema = z.object({
  matchId: z.string().trim().min(1, 'Match ID is required').max(32),
  questionIndex: z.number().int().min(0).max(10),
  selectedOption: z.number().int().min(0).max(3),
}).strict();

export const duelFinishSchema = z.object({
  matchId: z.string().trim().min(1, 'Match ID is required').max(32),
}).strict();

// Classes
export const createClassSchema = z.object({
  className: z.string().trim().min(1, 'Class name is required').max(100),
}).strict();

export const joinClassSchema = z.object({
  inviteCode: z.string().trim().regex(/^[A-Z0-9]{6}$/, 'Invite code must be exactly 6 uppercase alphanumeric characters'),
}).strict();
