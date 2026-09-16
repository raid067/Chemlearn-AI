import {
  TestCategory,
  TestExecutionRecord,
  CategoryScore,
  LatencyMetrics,
  SecurityScorecard,
  Finding,
} from './types';

/**
 * Computes individual category statistics from test execution records.
 */
export function calculateCategoryScores(
  records: TestExecutionRecord[]
): Record<TestCategory, CategoryScore> {
  const allCategories: TestCategory[] = [
    'prompt-injection',
    'system-prompt-extraction',
    'chemistry-accuracy',
    'ai-marking',
    'hallucination',
    'firestore-authz',
    'auth-bypass',
    'api-abuse',
    'input-security',
  ];

  const map: Partial<Record<TestCategory, CategoryScore>> = {};

  for (const cat of allCategories) {
    map[cat] = {
      category: cat,
      total: 0,
      passed: 0,
      failed: 0,
      partial: 0,
      error: 0,
      skipped: 0,
      scorePercentage: 100, // default if no tests
    };
  }

  for (const rec of records) {
    const entry = map[rec.category]!;
    entry.total++;
    if (rec.result === 'PASS') entry.passed++;
    else if (rec.result === 'FAIL') entry.failed++;
    else if (rec.result === 'PARTIAL') entry.partial++;
    else if (rec.result === 'ERROR') entry.error++;
    else if (rec.result === 'SKIPPED') entry.skipped++;
  }

  for (const cat of allCategories) {
    const entry = map[cat]!;
    const evaluated = entry.passed + entry.failed + entry.partial + entry.error;
    if (evaluated > 0) {
      // Partial credit awards 50%
      const effectivePass = entry.passed + entry.partial * 0.5;
      entry.scorePercentage = Math.round((effectivePass / evaluated) * 100);
    }
  }

  return map as Record<TestCategory, CategoryScore>;
}

/**
 * Computes the 5 dynamic security scorecard metrics.
 * Note: These percentages are NEVER hard-coded; they derive strictly from test outcomes.
 */
export function calculateScorecard(
  categoryScores: Record<TestCategory, CategoryScore>
): SecurityScorecard {
  // 1. AI Safety: prompt-injection + system-prompt-extraction
  const aiSafetyTests =
    categoryScores['prompt-injection'].total +
    categoryScores['system-prompt-extraction'].total;
  const aiSafetyPass =
    categoryScores['prompt-injection'].passed +
    categoryScores['prompt-injection'].partial * 0.5 +
    categoryScores['system-prompt-extraction'].passed +
    categoryScores['system-prompt-extraction'].partial * 0.5;
  const aiSafetyScore =
    aiSafetyTests > 0 ? Math.round((aiSafetyPass / aiSafetyTests) * 100) : 100;

  // 2. Firestore Security: firestore-authz
  const firestoreScore = categoryScores['firestore-authz'].scorePercentage;

  // 3. Authentication: auth-bypass
  const authScore = categoryScores['auth-bypass'].scorePercentage;

  // 4. AI Accuracy: chemistry-accuracy + ai-marking + hallucination
  const aiAccTests =
    categoryScores['chemistry-accuracy'].total +
    categoryScores['ai-marking'].total +
    categoryScores['hallucination'].total;
  const aiAccPass =
    categoryScores['chemistry-accuracy'].passed +
    categoryScores['chemistry-accuracy'].partial * 0.5 +
    categoryScores['ai-marking'].passed +
    categoryScores['ai-marking'].partial * 0.5 +
    categoryScores['hallucination'].passed +
    categoryScores['hallucination'].partial * 0.5;
  const aiAccuracyScore =
    aiAccTests > 0 ? Math.round((aiAccPass / aiAccTests) * 100) : 100;

  // 5. Overall Security: Weighted composite of Auth (25%), Firestore (25%), Input Security (20%), API Abuse (15%), AI Safety (15%)
  const overallSecurityScore = Math.round(
    authScore * 0.25 +
      firestoreScore * 0.25 +
      categoryScores['input-security'].scorePercentage * 0.2 +
      categoryScores['api-abuse'].scorePercentage * 0.15 +
      aiSafetyScore * 0.15
  );

  return {
    overallSecurityScore,
    aiSafetyScore,
    firestoreSecurityScore: firestoreScore,
    authenticationScore: authScore,
    aiAccuracyScore,
  };
}

/**
 * Calculates response latency metrics and percentiles.
 */
export function calculateLatencyMetrics(records: TestExecutionRecord[]): LatencyMetrics {
  const latencies = records
    .map((r) => r.latencyMs)
    .filter((ms) => typeof ms === 'number' && ms >= 0)
    .sort((a, b) => a - b);

  if (latencies.length === 0) {
    return {
      averageMs: 0,
      p95Ms: 0,
      p99Ms: 0,
      minMs: 0,
      maxMs: 0,
      errorRatePercentage: 0,
    };
  }

  const sum = latencies.reduce((acc, curr) => acc + curr, 0);
  const averageMs = Math.round(sum / latencies.length);
  const minMs = latencies[0];
  const maxMs = latencies[latencies.length - 1];

  const p95Index = Math.floor(latencies.length * 0.95);
  const p95Ms = latencies[Math.min(p95Index, latencies.length - 1)];

  const p99Index = Math.floor(latencies.length * 0.99);
  const p99Ms = latencies[Math.min(p99Index, latencies.length - 1)];

  const errorCount = records.filter(
    (r) => r.result === 'ERROR' || r.result === 'FAIL'
  ).length;
  const errorRatePercentage = parseFloat(
    ((errorCount / records.length) * 100).toFixed(1)
  );

  return {
    averageMs,
    p95Ms,
    p99Ms,
    minMs,
    maxMs,
    errorRatePercentage,
  };
}

/**
 * Generates structured findings from test failures.
 */
export function generateFindings(records: TestExecutionRecord[]): Finding[] {
  const findings: Finding[] = [];

  for (const rec of records) {
    if (rec.result === 'FAIL' || rec.result === 'ERROR') {
      let recommendation = 'Review system guardrails and input handling.';
      if (rec.category === 'prompt-injection') {
        recommendation = 'Strengthen input delimiter containment in wrapUntrustedInput() and verify prompt precedence.';
      } else if (rec.category === 'system-prompt-extraction') {
        recommendation = 'Ensure server secrets and environment variables are never exposed in prompt templates.';
      } else if (rec.category === 'firestore-authz') {
        recommendation = 'Update firestore.rules to enforce field whitelist and deny unauthorized writes.';
      } else if (rec.category === 'auth-bypass') {
        recommendation = 'Ensure requireAuth() and requireAdmin() reject unauthenticated and malformed tokens with 401/403.';
      } else if (rec.category === 'api-abuse') {
        recommendation = 'Add Zod input validation schemas and strict rate limiting to the affected endpoint.';
      } else if (rec.category === 'input-security') {
        recommendation = 'Ensure all user-controlled text is sanitized via DOMPurify / sanitizeHtml prior to DOM insertion.';
      } else if (rec.category === 'hallucination') {
        recommendation = 'Update AI tutor instructions to verify chemical existence and warn on unverified compounds.';
      } else if (rec.category === 'chemistry-accuracy' || rec.category === 'ai-marking') {
        recommendation = 'Align deterministic grading rubrics with official KSSM SPM syllabus mark schemes.';
      }

      findings.push({
        id: `finding-${rec.testId}`,
        testId: rec.testId,
        category: rec.category,
        severity: rec.severity,
        title: `${rec.name} Failed`,
        description: rec.reason || `Test case ${rec.testId} did not meet expected behavior.`,
        actualResponse: typeof rec.response === 'string' ? rec.response : JSON.stringify(rec.response),
        recommendation,
        discoveredAt: rec.timestamp,
      });
    }
  }

  // Sort findings by severity: CRITICAL first, then HIGH, MEDIUM, LOW, INFO
  const severityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    INFO: 4,
  };

  return findings.sort(
    (a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5)
  );
}
