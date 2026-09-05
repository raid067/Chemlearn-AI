import {
  syncGamificationSchema,
  aiChallengeSchema,
  aiChatSchema,
  aiDuelSchema,
  aiFlashcardsSchema,
  aiGradeSchema,
  aiInsightsSchema,
  aiMarkSchema,
  aiNotesSchema,
  aiQuizSchema,
  aiWorksheetSchema,
  createClassSchema,
  joinClassSchema
} from '@/lib/validations';
import { validateImagePayload, MAX_IMAGE_PAYLOAD_BYTES } from '@/lib/rate-limit';

describe('Zod Validation Schemas & Edge Cases', () => {
  describe('syncGamificationSchema', () => {
    it('accepts valid gamification actions', () => {
      const validActions = ['COMPLETE_LESSON', 'WIN_DUEL', 'COMPLETE_QUIZ', 'DAILY_CHALLENGE'];
      validActions.forEach(action => {
        const result = syncGamificationSchema.safeParse({ action });
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid, unknown, or empty actions', () => {
      expect(syncGamificationSchema.safeParse({ action: 'INVALID_ACTION' }).success).toBe(false);
      expect(syncGamificationSchema.safeParse({ action: '' }).success).toBe(false);
      expect(syncGamificationSchema.safeParse({}).success).toBe(false);
      expect(syncGamificationSchema.safeParse({ action: 123 }).success).toBe(false);
      expect(syncGamificationSchema.safeParse({ action: null }).success).toBe(false);
    });
  });

  describe('aiChatSchema', () => {
    it('accepts question only', () => {
      const result = aiChatSchema.safeParse({ question: 'What is an exothermic reaction?' });
      expect(result.success).toBe(true);
    });

    it('accepts image only', () => {
      const result = aiChatSchema.safeParse({
        imageBase64: 'data:image/png;base64,iVBORw0KGgo...',
        imageMimeType: 'image/png'
      });
      expect(result.success).toBe(true);
    });

    it('accepts both question and image', () => {
      const result = aiChatSchema.safeParse({
        question: 'Solve this equation',
        imageBase64: 'base64data',
        imageMimeType: 'image/jpeg'
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty input (both question and image missing or empty)', () => {
      expect(aiChatSchema.safeParse({}).success).toBe(false);
      expect(aiChatSchema.safeParse({ question: '   ' }).success).toBe(false);
      expect(aiChatSchema.safeParse({ question: '', imageBase64: '' }).success).toBe(false);
    });
  });

  describe('aiQuizSchema', () => {
    it('accepts valid MCQ and Structured payloads', () => {
      const mcq = aiQuizSchema.safeParse({ topic: 'Electrochemistry', difficulty: 'Medium', type: 'MCQ' });
      expect(mcq.success).toBe(true);

      const structured = aiQuizSchema.safeParse({ topic: 'Acids and Bases', difficulty: 'Hard', type: 'Structured' });
      expect(structured.success).toBe(true);
    });

    it('rejects missing or empty required fields', () => {
      expect(aiQuizSchema.safeParse({ difficulty: 'Easy', type: 'MCQ' }).success).toBe(false);
      expect(aiQuizSchema.safeParse({ topic: '', difficulty: 'Easy', type: 'MCQ' }).success).toBe(false);
      expect(aiQuizSchema.safeParse({ topic: 'Acids', difficulty: '', type: 'MCQ' }).success).toBe(false);
      expect(aiQuizSchema.safeParse({ topic: 'Acids', difficulty: 'Easy', type: '' }).success).toBe(false);
    });
  });

  describe('aiMarkSchema', () => {
    it('accepts valid student and expected answers', () => {
      const result = aiMarkSchema.safeParse({
        expectedAnswer: 'Oxidation occurs at anode',
        studentAnswer: 'anode'
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing or empty answers', () => {
      expect(aiMarkSchema.safeParse({ expectedAnswer: 'test', studentAnswer: '' }).success).toBe(false);
      expect(aiMarkSchema.safeParse({ expectedAnswer: '', studentAnswer: 'test' }).success).toBe(false);
      expect(aiMarkSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('createClassSchema and joinClassSchema', () => {
    it('validates class creation', () => {
      expect(createClassSchema.safeParse({ className: 'Chemistry 5 Alpha' }).success).toBe(true);
      expect(createClassSchema.safeParse({ className: '' }).success).toBe(false);
      expect(createClassSchema.safeParse({}).success).toBe(false);
    });

    it('validates class joining invite codes', () => {
      expect(joinClassSchema.safeParse({ inviteCode: 'ABC123' }).success).toBe(true);
      expect(joinClassSchema.safeParse({ inviteCode: '' }).success).toBe(false);
      expect(joinClassSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('validateImagePayload', () => {
    it('returns null for valid payloads under 5MB', () => {
      expect(validateImagePayload(undefined)).toBeNull();
      expect(validateImagePayload('')).toBeNull();
      // 1000 characters is ~750 bytes
      expect(validateImagePayload('a'.repeat(1000))).toBeNull();
    });

    it('rejects image payload exceeding 5MB limit', () => {
      // 5MB is 5242880 bytes. In base64, 5242880 * 4 / 3 ≈ 6990507 chars.
      const largePayload = 'a'.repeat(7_000_000);
      const error = validateImagePayload(largePayload);
      expect(error).not.toBeNull();
      expect(error).toContain('Image payload too large');
      expect(error).toContain('Maximum is 5MB');
    });
  });
});
