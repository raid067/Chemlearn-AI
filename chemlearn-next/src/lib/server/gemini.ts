import { GoogleGenerativeAI, Part, GenerationConfig } from '@google/generative-ai';

// Initialize Gemini with a fallback key for build/test environments
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

/**
 * Authoritative Centralized Gemini Model Catalog
 * Primary: Modern Gemini 3.8/3.5 models with automatic fallback.
 */
export const GEMINI_MODELS = {
  DEFAULT: process.env.GEMINI_MODEL_DEFAULT || 'gemini-3.8-flash',
  LIGHT: process.env.GEMINI_MODEL_LIGHT || 'gemini-3.5-flash-lite',
  VISION: process.env.GEMINI_MODEL_VISION || 'gemini-3.8-flash',
  FALLBACK: process.env.GEMINI_MODEL_FALLBACK || 'gemini-2.5-flash',
} as const;

export interface GeminiCallOptions {
  modelName?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
  responseMimeType?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

/**
 * Validates Gemini configuration. Fails safely if unconfigured in production.
 */
export function assertGeminiConfigured(): void {
  const apiKey = process.env.GEMINI_API_KEY;
  if (process.env.NODE_ENV === 'production' && (!apiKey || apiKey === 'dummy_key' || apiKey.trim() === '')) {
    throw new Error('GEMINI_NOT_CONFIGURED: Missing valid GEMINI_API_KEY on production server.');
  }
}

/**
 * Distinguishes transient, retryable failures from permanent client/auth errors.
 */
export function isTransientGeminiError(error: unknown): boolean {
  if (!error) return false;
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  const status = (error as { status?: number }).status;

  if (status === 429 || status === 503 || status === 500 || status === 504) return true;
  if (msg.includes('resource_exhausted') || msg.includes('quota') || msg.includes('rate limit')) return true;
  if (msg.includes('unavailable') || msg.includes('overloaded') || msg.includes('server error') || msg.includes('internal error')) return true;
  if (msg.includes('timeout') || msg.includes('econnreset') || msg.includes('socket hang up') || msg.includes('fetch failed')) return true;

  return false;
}

/**
 * Generates text from Gemini with built-in timeout, model fallback, and exponential retry backoff.
 */
export async function generateGeminiText(
  prompt: string | (string | Part)[],
  options: string | GeminiCallOptions = GEMINI_MODELS.DEFAULT
): Promise<string> {
  assertGeminiConfigured();

  const opts: GeminiCallOptions = typeof options === 'string' ? { modelName: options } : options;
  let currentModel = opts.modelName || GEMINI_MODELS.DEFAULT;
  const timeoutMs = opts.timeoutMs ?? 15000;
  const maxRetries = opts.maxRetries ?? 2;

  const generationConfig: GenerationConfig = {};
  if (opts.temperature !== undefined) generationConfig.temperature = opts.temperature;
  if (opts.topP !== undefined) generationConfig.topP = opts.topP;
  if (opts.topK !== undefined) generationConfig.topK = opts.topK;
  if (opts.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = opts.maxOutputTokens;
  if (opts.responseMimeType) generationConfig.responseMimeType = opts.responseMimeType;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: currentModel,
        ...(Object.keys(generationConfig).length > 0 ? { generationConfig } : {}),
        ...(opts.systemInstruction ? { systemInstruction: opts.systemInstruction } : {}),
      });

      // Enforce timeout guard
      let timer: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${timeoutMs}ms`)), timeoutMs);
      });

      try {
        const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
        return result.response.text();
      } finally {
        if (timer) clearTimeout(timer);
      }
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);

      // If model not found or unavailable, automatically fall back to stable generation model
      if ((errMsg.includes('404') || errMsg.includes('not found')) && currentModel !== GEMINI_MODELS.FALLBACK) {
        console.warn(`[Gemini] Model ${currentModel} returned 404/not found. Retrying with fallback model ${GEMINI_MODELS.FALLBACK}`);
        currentModel = GEMINI_MODELS.FALLBACK;
      }

      if (attempt < maxRetries && isTransientGeminiError(err)) {
        const backoffMs = Math.min(3000, 400 * Math.pow(2, attempt) + Math.random() * 200);
        console.warn(`[Gemini] Transient failure on attempt ${attempt + 1}: ${errMsg}. Retrying in ${Math.round(backoffMs)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      break;
    }
  }

  throw lastError;
}

/**
 * Generates and parses typed JSON from Gemini with native application/json mimetype enforcement.
 */
export async function generateGeminiJson<T = unknown>(
  prompt: string | (string | Part)[],
  options: string | GeminiCallOptions = GEMINI_MODELS.DEFAULT
): Promise<T> {
  const opts: GeminiCallOptions = typeof options === 'string' ? { modelName: options } : { ...options };
  opts.responseMimeType = 'application/json';

  const text = await generateGeminiText(prompt, opts);
  const jsonText = text.trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(jsonText) as T;
  } catch {
    // Attempt relaxed regex extraction if markdown or preamble wrapper was included
    const match = jsonText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // Fall through to error
      }
    }
    throw new Error('Failed to parse AI response as JSON');
  }
}
