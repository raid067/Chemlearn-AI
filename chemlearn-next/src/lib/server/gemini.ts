import { GoogleGenerativeAI, Part } from '@google/generative-ai';

// Initialize Gemini with a fallback key for build/test environments
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export async function generateGeminiText(
  prompt: string | (string | Part)[],
  modelName: string = 'gemini-1.5-flash'
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateGeminiJson<T = unknown>(
  prompt: string | (string | Part)[],
  modelName: string = 'gemini-1.5-flash'
): Promise<T> {
  const text = await generateGeminiText(prompt, modelName);
  const jsonText = text.trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(jsonText) as T;
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }
}
