import { getModelCapability, MODEL_CAPABILITIES } from '@/lib/server/gemini';

describe('Gemini Model Capability Resolution', () => {
  it('resolves pro models to primary capability', () => {
    const capability = getModelCapability('gemini-1.5-pro');
    expect(capability).toEqual(MODEL_CAPABILITIES.primary);
  });

  it('resolves flash models to light capability', () => {
    const capability = getModelCapability('gemini-1.5-flash');
    expect(capability).toEqual(MODEL_CAPABILITIES.light);
  });

  it('resolves unknown models to fallback capability', () => {
    const capability = getModelCapability('unknown-model');
    expect(capability).toEqual(MODEL_CAPABILITIES.fallback);
  });
});
