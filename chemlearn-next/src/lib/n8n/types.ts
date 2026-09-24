import { z } from 'zod';

/**
 * Standard SPM KSSM Chapters supported in prioritized automation
 */
export const SupportedChapters = z.enum([
  'chapter-1',
  'chapter-2',
  'chapter-3',
  'chapter-4',
  'chapter-5',
  'chapter-6', // Form 4 Ch 6: Acid, Base and Salt
  'chapter-7',
  'chapter-8', // Form 4 Ch 8: Manufactured Substances in Industry
]);

export type SupportedChapterType = z.infer<typeof SupportedChapters>;

/**
 * Outbound Event Types (ChemLearn -> n8n)
 */
export const N8nEventTypeEnum = z.enum([
  'quiz.completed',
  'worksheet.generate_requested',
  'redteam.scheduled_run',
  'student.streak_risk',
  'health.ping',
]);

export type N8nEventType = z.infer<typeof N8nEventTypeEnum>;

/**
 * Outbound Event Schemas
 */
export const QuizCompletedEventDataSchema = z.object({
  studentId: z.string(),
  chapter: z.string(),
  chapterNumber: z.number().optional(),
  chapterTitle: z.string().optional(),
  score: z.number().min(0).max(100),
  totalQuestions: z.number().int().positive().optional(),
  incorrectSubtopics: z.array(z.string()).default([]),
  language: z.enum(['en', 'ms']).default('en'),
});

export type QuizCompletedEventData = z.infer<typeof QuizCompletedEventDataSchema>;

export const WorksheetGenerateRequestedDataSchema = z.object({
  teacherId: z.string(),
  classId: z.string().optional(),
  chapter: z.string(),
  chapterNumber: z.number(),
  targetFocus: z.enum(['chapter-6-salts', 'chapter-8-alloys', 'general']).default('general'),
  questionCount: z.number().min(1).max(20).default(5),
  difficulty: z.enum(['easy', 'medium', 'hard', 'exam_spm']).default('exam_spm'),
  language: z.enum(['en', 'ms']).default('en'),
});

export type WorksheetGenerateRequestedData = z.infer<typeof WorksheetGenerateRequestedDataSchema>;

export const N8nOutboundEventSchema = z.object({
  eventId: z.string(),
  event: N8nEventTypeEnum,
  timestamp: z.number(),
  data: z.record(z.string(), z.unknown()),
});

export type N8nOutboundEvent = z.infer<typeof N8nOutboundEventSchema>;

/**
 * Inbound Callback Actions (n8n -> ChemLearn)
 */
export const N8nInboundActionEnum = z.enum([
  'worksheet.publish',
  'remedial.assign',
  'redteam.report',
  'health.ping',
]);

export type N8nInboundAction = z.infer<typeof N8nInboundActionEnum>;

export const QuestionItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(['mcq', 'structured', 'essay']).default('structured'),
  marks: z.number().positive(),
  markingScheme: z.array(z.string()).min(1),
  subtopic: z.string().optional(),
});

export const WorksheetPublishDataSchema = z.object({
  title: z.string().min(3),
  chapter: z.string(),
  chapterNumber: z.number(),
  questions: z.array(QuestionItemSchema).min(1),
  classId: z.string().optional(),
});

export type WorksheetPublishData = z.infer<typeof WorksheetPublishDataSchema>;

export const RemedialAssignDataSchema = z.object({
  studentId: z.string(),
  chapter: z.string(),
  chapterNumber: z.number(),
  diagnosticSummary: z.string(),
  actionPlan: z.array(z.string()).min(1),
  recommendedPracticeIds: z.array(z.string()).default([]),
});

export type RemedialAssignData = z.infer<typeof RemedialAssignDataSchema>;

export const N8nInboundPayloadSchema = z.object({
  action: N8nInboundActionEnum,
  timestamp: z.number(),
  data: z.record(z.string(), z.unknown()),
});

export type N8nInboundPayload = z.infer<typeof N8nInboundPayloadSchema>;
