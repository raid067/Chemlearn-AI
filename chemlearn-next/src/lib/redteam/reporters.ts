import { CampaignSummary } from './types';
import { redactSecrets } from './secret-redactor';

/**
 * Creates ASCII progress bar string (e.g. ████████████████░░░░ 82%)
 */
export function formatAsciiProgressBar(percentage: number, length = 20): string {
  const safePercent = Math.max(0, Math.min(100, percentage));
  const filledCount = Math.round((safePercent / 100) * length);
  const emptyCount = length - filledCount;
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount) + ` ${safePercent}%`;
}

/**
 * Generates the official formatted RED_TEAM_REPORT.md string.
 */
export function generateMarkdownReport(summary: CampaignSummary): string {
  const sc = summary.scorecard;
  const criticals = summary.findings.filter((f) => f.severity === 'CRITICAL');
  const highs = summary.findings.filter((f) => f.severity === 'HIGH');

  // Collect unique recommendations
  const recommendationSet = new Set<string>();
  for (const finding of summary.findings) {
    if (finding.recommendation) {
      recommendationSet.add(finding.recommendation);
    }
  }

  if (recommendationSet.size === 0) {
    recommendationSet.add('Maintain current strict KSSM curriculum prompt guardrails and zero-trust Firestore rules.');
    recommendationSet.add('Continuously execute automated red-team regression tests prior to each production release.');
    recommendationSet.add('Keep DOMPurify and input size limits actively enforced on all client-facing routes.');
  }

  const recommendationsList = Array.from(recommendationSet);

  const report = `# ChemLearn AI Red Team Report

**Date:** ${new Date(summary.timestamp).toLocaleString()}
**Version:** 0.1.0-redteam
**Campaign Type:** ${summary.campaignType.toUpperCase()}
**Execution Duration:** ${(summary.durationMs / 1000).toFixed(2)}s

---

## Executive Summary

| Metric | Value |
| :--- | :--- |
| **Total Tests** | ${summary.totalTests} |
| **Passed** | ${summary.passed} |
| **Failed** | ${summary.failed} |
| **Partial** | ${summary.partial} |
| **Error / Skipped** | ${summary.error + summary.skipped} |

---

## Dynamic Security & AI Reliability Scorecard

\`\`\`text
Overall Security
${formatAsciiProgressBar(sc.overallSecurityScore)}

AI Safety
${formatAsciiProgressBar(sc.aiSafetyScore)}

Firestore Security
${formatAsciiProgressBar(sc.firestoreSecurityScore)}

Authentication
${formatAsciiProgressBar(sc.authenticationScore)}

AI Accuracy
${formatAsciiProgressBar(sc.aiAccuracyScore)}
\`\`\`

---

## AI Latency & Performance Metrics

| Metric | Result |
| :--- | :--- |
| **Average Latency** | ${summary.latencyMetrics.averageMs} ms |
| **P95 Latency** | ${summary.latencyMetrics.p95Ms} ms |
| **P99 Latency** | ${summary.latencyMetrics.p99Ms} ms |
| **Failure / Error Rate** | ${summary.latencyMetrics.errorRatePercentage}% |

---

## Critical Findings
${
  criticals.length === 0
    ? '✅ None. Zero critical vulnerabilities detected.'
    : criticals
        .map(
          (c, idx) =>
            `${idx + 1}. **[${c.category.toUpperCase()}] ${c.title}**\n   - *Description:* ${c.description}\n   - *Recommendation:* ${c.recommendation}`
        )
        .join('\n\n')
}

## High Findings
${
  highs.length === 0
    ? '✅ None. Zero high severity vulnerabilities detected.'
    : highs
        .map(
          (h, idx) =>
            `${idx + 1}. **[${h.category.toUpperCase()}] ${h.title}**\n   - *Description:* ${h.description}\n   - *Recommendation:* ${h.recommendation}`
        )
        .join('\n\n')
}

---

## Recommendations
${recommendationsList.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n')}

---

*Report automatically compiled by ChemLearn AI Automated Red Team Engine.*
`;

  return redactSecrets(report);
}

/**
 * Generates the red-team-results.json string with all secrets redacted.
 */
export function generateJsonReport(summary: CampaignSummary): string {
  const jsonStr = JSON.stringify(summary, null, 2);
  return redactSecrets(jsonStr);
}
