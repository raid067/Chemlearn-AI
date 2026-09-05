const mockRunTransaction = jest.fn();
const mockGenerateGeminiJson = jest.fn();
const mockGenerateGeminiText = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({})),
    })),
    runTransaction: (...args: any[]) => mockRunTransaction(...args),
  },
}));

jest.mock('@/lib/server/gemini', () => ({
  generateGeminiJson: (...args: any[]) => mockGenerateGeminiJson(...args),
  generateGeminiText: (...args: any[]) => mockGenerateGeminiText(...args),
  GEMINI_MODELS: {
    DEFAULT: 'gemini-3.8-flash',
    LIGHT: 'gemini-3.5-flash-lite',
    FALLBACK: 'gemini-2.5-flash',
  },
}));

import {
  secureGenerateAI,
  AIGatewayError,
  generatedMCQSchema,
  generatedMCQListSchema,
} from '@/lib/server/ai-gateway';

describe('AI Gateway Fail-Closed Schema Validation & Quota Governance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default quota allows request
    mockRunTransaction.mockImplementation(async (callback) => {
      const mockTx = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ totalRequests: 5 }),
        }),
        set: jest.fn(),
      };
      return callback(mockTx);
    });
  });

  describe('Strict MCQ Domain Schemas', () => {
    it('validates authentic MCQ question with 4 distinct options and answer in 0..3', () => {
      const valid = {
        q: 'What is the color of copper(II) sulfate in aqueous solution?',
        options: ['Blue', 'Green', 'Colorless', 'Yellow'],
        answer: 0,
        explanation: 'Cu2+ ions in aqueous solution appear blue.',
      };
      const result = generatedMCQSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects MCQ questions with duplicate options', () => {
      const duplicateOpts = {
        q: 'What is the pH of pure water at 25 degrees Celsius?',
        options: ['7.0', '7.0', '1.0', '14.0'],
        answer: 0,
        explanation: 'Pure water has neutral pH of 7.',
      };
      const result = generatedMCQSchema.safeParse(duplicateOpts);
      expect(result.success).toBe(false);
    });

    it('rejects MCQ quiz if question count is not exactly 5', () => {
      const fourQuestions = Array.from({ length: 4 }).map((_, i) => ({
        q: `Valid question number ${i + 1}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 0,
        explanation: 'Valid explanation.',
      }));

      const result = generatedMCQListSchema.safeParse(fourQuestions);
      expect(result.success).toBe(false);
    });
  });

  describe('Fail-Closed Gateway Execution', () => {
    it('throws 502 AI_INVALID_OUTPUT when AI output fails schema validation', async () => {
      // AI outputs an invalid structure (missing explanation, only 2 options)
      mockGenerateGeminiJson.mockResolvedValueOnce([
        { q: 'Incomplete question', options: ['A', 'B'], answer: 0 },
      ]);

      await expect(
        secureGenerateAI({
          uid: 'student-123',
          endpoint: 'ai-quiz',
          prompt: 'Generate questions',
          schema: generatedMCQListSchema,
        })
      ).rejects.toThrow(AIGatewayError);

      try {
        await secureGenerateAI({
          uid: 'student-123',
          endpoint: 'ai-quiz',
          prompt: 'Generate questions',
          schema: generatedMCQListSchema,
        });
      } catch (e: any) {
        expect(e.statusCode).toBe(502);
        expect(e.code).toBe('AI_INVALID_OUTPUT');
        expect(e.message).toBe('The AI generated an invalid response. Please try again.');
      }
    });

    it('throws 502 AI_INVALID_OUTPUT when text AI generation returns empty or whitespace', async () => {
      mockGenerateGeminiText.mockResolvedValueOnce('   ');

      await expect(
        secureGenerateAI({
          uid: 'student-123',
          endpoint: 'ai-notes',
          prompt: 'Generate notes',
        })
      ).rejects.toThrow(AIGatewayError);

      try {
        await secureGenerateAI({
          uid: 'student-123',
          endpoint: 'ai-notes',
          prompt: 'Generate notes',
        });
      } catch (e: any) {
        expect(e.statusCode).toBe(502);
        expect(e.code).toBe('AI_INVALID_OUTPUT');
      }
    });

    it('enforces daily quota and throws 429 QUOTA_EXCEEDED when limit is reached', async () => {
      // Mock transaction indicating quota exceeded
      mockRunTransaction.mockImplementationOnce(async (callback) => {
        const mockTx = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ totalRequests: 50 }),
          }),
          set: jest.fn(),
        };
        return callback(mockTx);
      });

      await expect(
        secureGenerateAI({
          uid: 'student-maxed-out',
          endpoint: 'ai-quiz',
          prompt: 'Generate quiz',
          schema: generatedMCQListSchema,
          maxDailyQuota: 50,
        })
      ).rejects.toThrow(AIGatewayError);

      try {
        mockRunTransaction.mockImplementationOnce(async (callback) => {
          const mockTx = {
            get: jest.fn().mockResolvedValue({
              exists: true,
              data: () => ({ totalRequests: 50 }),
            }),
            set: jest.fn(),
          };
          return callback(mockTx);
        });

        await secureGenerateAI({
          uid: 'student-maxed-out',
          endpoint: 'ai-quiz',
          prompt: 'Generate quiz',
          schema: generatedMCQListSchema,
          maxDailyQuota: 50,
        });
      } catch (e: any) {
        expect(e.statusCode).toBe(429);
        expect(e.code).toBe('QUOTA_EXCEEDED');
        expect(e.message).toContain('Daily AI quota');
      }
    });
  });
});
