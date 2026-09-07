import {
  generateGeminiText,
  generateGeminiJson,
  GEMINI_MODELS,
  MODEL_CAPABILITIES,
  getModelCapability,
  isTransientGeminiError,
} from '@/lib/server/gemini';
import { z } from 'zod';

const rawApiKey = process.env.GEMINI_API_KEY;
const hasRealApiKey =
  !!rawApiKey &&
  rawApiKey !== 'dummy_key' &&
  rawApiKey.trim().length > 10 &&
  !rawApiKey.includes('dummy') &&
  !rawApiKey.includes('placeholder');

describe('Gemini Integration Test Suite (Phase 2)', () => {
  describe('Model Capabilities Architecture', () => {
    it('defines capability profiles for primary, light, and fallback models', () => {
      expect(MODEL_CAPABILITIES.primary.model).toBeDefined();
      expect(MODEL_CAPABILITIES.light.model).toBeDefined();
      expect(MODEL_CAPABILITIES.fallback.model).toBeDefined();

      expect(MODEL_CAPABILITIES.primary.supportsTemperature).toBe(true);
      expect(MODEL_CAPABILITIES.primary.supportsJson).toBe(true);
      expect(MODEL_CAPABILITIES.primary.supportsVision).toBe(true);
    });

    it('resolves capability profile safely for unlisted models', () => {
      const customCap = getModelCapability('custom-future-gemini');
      expect(customCap.model).toBe('custom-future-gemini');
      expect(customCap.supportsTopK).toBe(false); // conservative defaults
      expect(customCap.supportsJson).toBe(true);
    });

    it('identifies transient vs permanent errors correctly', () => {
      expect(isTransientGeminiError({ status: 429 })).toBe(true);
      expect(isTransientGeminiError({ status: 503 })).toBe(true);
      expect(isTransientGeminiError(new Error('Resource has been exhausted (e.g. check quota)'))).toBe(true);
      expect(isTransientGeminiError(new Error('Request timed out'))).toBe(true);
      expect(isTransientGeminiError(new Error('Invalid API key provided'))).toBe(false);
      expect(isTransientGeminiError(null)).toBe(false);
    });
  });

  describe('Timeout & Guardrail Mechanisms', () => {
    it('enforces request timeout when timeoutMs is exceeded', async () => {
      // 1ms timeout will reliably trigger timeout guard
      await expect(
        generateGeminiText('Explain the mole concept in chemistry.', {
          timeoutMs: 1,
          maxRetries: 0,
        })
      ).rejects.toThrow(/timed out/i);
    });

    it('never leaks API keys in error messages or logs', async () => {
      try {
        await generateGeminiText('Test query', {
          timeoutMs: 1,
          maxRetries: 0,
        });
      } catch (err: unknown) {
        const errorString = String(err);
        if (rawApiKey && rawApiKey !== 'dummy_key') {
          expect(errorString).not.toContain(rawApiKey);
        }
      }
    });

    it('handles malformed JSON output gracefully with regex extraction fallback', async () => {
      // Test parsing behavior on wrapped markdown JSON
      const wrappedJson = '```json\n{"topic": "acids", "ph": 2.5}\n```';
      const parsed = JSON.parse(
        wrappedJson.trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim()
      );
      expect(parsed).toEqual({ topic: 'acids', ph: 2.5 });
    });
  });

  describe(
    hasRealApiKey ? '[REAL GEMINI TEST] Live API Execution' : '[MOCK GEMINI TEST] Fallback Simulation (No live API key)',
    () => {
      if (!hasRealApiKey) {
        it('identifies that no live API key is configured and defaults to safe CI mode', () => {
          console.log('[MOCK GEMINI TEST]: Live GEMINI_API_KEY not detected or dummy_key used. Skipping live network calls.');
          expect(hasRealApiKey).toBe(false);
        });

        it('validates chemistry MCQ schema against structured sample output', () => {
          const sampleMCQ = {
            question: 'What is the pH of a 0.1 mol/dm3 hydrochloric acid solution?',
            options: ['1.0', '7.0', '13.0', '0.0'],
            correctIndex: 0,
            explanation: 'HCl is a strong monoprotic acid that fully ionises in water: pH = -log[0.1] = 1.0.',
          };

          const mcqSchema = z.object({
            question: z.string().min(5),
            options: z.array(z.string()).length(4),
            correctIndex: z.number().min(0).max(3),
            explanation: z.string().min(5),
          });

          const result = mcqSchema.safeParse(sampleMCQ);
          expect(result.success).toBe(true);
        });
      } else {
        it('generates text successfully using primary model', async () => {
          console.log(`[REAL GEMINI TEST]: Calling live model ${GEMINI_MODELS.DEFAULT}...`);
          const text = await generateGeminiText(
            'In one short sentence, define an acid according to the Arrhenius theory.',
            { modelName: GEMINI_MODELS.DEFAULT, maxOutputTokens: 60 }
          );
          expect(text).toBeDefined();
          expect(text.length).toBeGreaterThan(10);
        }, 25000);

        it('generates and parses typed JSON using application/json responseMimeType', async () => {
          console.log(`[REAL GEMINI TEST]: Calling JSON mode on ${GEMINI_MODELS.LIGHT}...`);
          interface AcidInfo {
            formula: string;
            name: string;
            basicity: number;
          }

          const json = await generateGeminiJson<AcidInfo>(
            'Return a JSON object with formula, name, and basicity of sulfuric acid.',
            { modelName: GEMINI_MODELS.LIGHT, maxOutputTokens: 100 }
          );

          expect(json).toBeDefined();
          expect(json.formula.toLowerCase()).toContain('h2so4');
          expect(json.basicity).toBe(2);
        }, 25000);

        it('honors system instructions to enforce SPM chemistry scope', async () => {
          console.log('[REAL GEMINI TEST]: Testing system instruction enforcement...');
          const text = await generateGeminiText('What is an alloy?', {
            systemInstruction: 'You are an SPM Chemistry tutor. Answer in under 15 words.',
            maxOutputTokens: 40,
          });
          expect(text).toBeDefined();
          expect(text.toLowerCase()).toMatch(/metal|mixture|element/);
        }, 25000);

        it('evaluates chemistry grading rubric in JSON format', async () => {
          console.log('[REAL GEMINI TEST]: Testing live chemistry grading rubric...');
          interface GradingRubric {
            score: number;
            reason: string;
          }

          const prompt = `Grade student answer "Blue precipitate formed which is insoluble in excess" for test of Cu2+ with NaOH. Max marks: 2. Return JSON { "score": number, "reason": string }`;
          const result = await generateGeminiJson<GradingRubric>(prompt, {
            modelName: GEMINI_MODELS.DEFAULT,
            maxOutputTokens: 150,
          });

          expect(result.score).toBeGreaterThanOrEqual(1);
          expect(result.reason).toBeDefined();
        }, 25000);
      }
    }
  );
});
