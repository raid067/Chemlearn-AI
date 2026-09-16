import { TestCase, TestCategory } from './types';

import promptInjectionTests from './benchmarks/prompt-injection.json';
import systemExtractionTests from './benchmarks/system-prompt-extraction.json';
import chemistryAccuracyTests from './benchmarks/chemistry-accuracy.json';
import markingTests from './benchmarks/marking.json';
import hallucinationTests from './benchmarks/hallucination.json';
import firestoreAuthzTests from './benchmarks/firestore-authz.json';
import authBypassTests from './benchmarks/auth-bypass.json';
import apiAbuseTests from './benchmarks/api-abuse.json';
import inputSecurityTests from './benchmarks/input-security.json';

export const ALL_BENCHMARK_TESTS: TestCase[] = [
  ...(promptInjectionTests as TestCase[]),
  ...(systemExtractionTests as TestCase[]),
  ...(chemistryAccuracyTests as TestCase[]),
  ...(markingTests as TestCase[]),
  ...(hallucinationTests as TestCase[]),
  ...(firestoreAuthzTests as TestCase[]),
  ...(authBypassTests as TestCase[]),
  ...(apiAbuseTests as TestCase[]),
  ...(inputSecurityTests as TestCase[]),
];

/**
 * Gets test cases for a specific campaign type.
 */
export function getCampaignTests(
  campaignType: 'quick' | 'standard' | 'full' | 'category',
  targetCategory?: TestCategory
): TestCase[] {
  if (campaignType === 'category' && targetCategory) {
    return ALL_BENCHMARK_TESTS.filter((t) => t.category === targetCategory);
  }

  if (campaignType === 'quick') {
    // ~20 critical/high-priority tests spanning all domains
    return ALL_BENCHMARK_TESTS.filter((t) => {
      // Pick top critical/high from each category
      const criticalOrHigh = t.severity === 'CRITICAL' || t.severity === 'HIGH';
      return criticalOrHigh;
    }).slice(0, 22);
  }

  if (campaignType === 'standard') {
    // All security + AI safety tests
    const securityAndSafetyCats: TestCategory[] = [
      'prompt-injection',
      'system-prompt-extraction',
      'firestore-authz',
      'auth-bypass',
      'api-abuse',
      'input-security',
      'hallucination',
    ];
    return ALL_BENCHMARK_TESTS.filter((t) => securityAndSafetyCats.includes(t.category));
  }

  // Full Red Team: All benchmark tests
  return ALL_BENCHMARK_TESTS;
}
