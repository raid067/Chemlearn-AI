import { GoogleGenerativeAI, Part, GenerationConfig } from '@google/generative-ai';

// Initialize Gemini with a fallback key for build/test environments
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export interface GeminiCallOptions {
  modelName?: string;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
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

export async function generateGeminiText(
  prompt: string | (string | Part)[],
  options: string | GeminiCallOptions = 'gemini-1.5-flash'
): Promise<string> {
  assertGeminiConfigured();

  const opts: GeminiCallOptions = typeof options === 'string' ? { modelName: options } : options;
  const modelName = opts.modelName || 'gemini-1.5-flash';

  const generationConfig: GenerationConfig = {};
  if (opts.temperature !== undefined) generationConfig.temperature = opts.temperature;
  if (opts.topP !== undefined) generationConfig.topP = opts.topP;
  if (opts.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = opts.maxOutputTokens;

  const model = genAI.getGenerativeModel({
    model: modelName,
    ...(Object.keys(generationConfig).length > 0 ? { generationConfig } : {}),
    ...(opts.systemInstruction ? { systemInstruction: opts.systemInstruction } : {}),
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateGeminiJson<T = unknown>(
  prompt: string | (string | Part)[],
  options: string | GeminiCallOptions = 'gemini-1.5-flash'
): Promise<T> {
  const text = await generateGeminiText(prompt, options);
  const jsonText = text.trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(jsonText) as T;
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }
}
