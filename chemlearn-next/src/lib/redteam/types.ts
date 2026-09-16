export type TestResult = 'PASS' | 'FAIL' | 'PARTIAL' | 'ERROR' | 'SKIPPED';

export type TestSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type TestCategory =
  | 'prompt-injection'
  | 'system-prompt-extraction'
  | 'chemistry-accuracy'
  | 'ai-marking'
  | 'hallucination'
  | 'firestore-authz'
  | 'auth-bypass'
  | 'api-abuse'
  | 'input-security';

export interface TestCase {
  id: string;
  category: TestCategory;
  name: string;
  description: string;
  severity: TestSeverity;
  input: string | Record<string, unknown>;
  expectedBehavior: string;
  // Specific assertions or constraints
  assertions?: {
    type: 'regex_not_match' | 'regex_match' | 'contains_keywords' | 'status_code' | 'denied' | 'deterministic_marking' | 'sanitized_xss' | 'custom';
    target?: string | string[];
    forbiddenTerms?: string[];
    expectedStatus?: number;
    expectedScore?: number;
    maxMarks?: number;
    language?: 'English' | 'Bahasa Melayu';
  };
  metadata?: {
    form?: 4 | 5;
    chapter?: number;
    topic?: string;
    targetEndpoint?: string;
    trickAnswer?: boolean;
    fictionalCompound?: boolean;
    language?: 'English' | 'Bahasa Melayu' | string;
  };
}

export interface TestExecutionRecord {
  testId: string;
  category: TestCategory;
  name: string;
  severity: TestSeverity;
  input: string | Record<string, unknown>;
  response: string | Record<string, unknown>;
  expectedBehavior: string;
  result: TestResult;
  reason?: string;
  latencyMs: number;
  timestamp: string;
  model?: string;
}

export interface Finding {
  id: string;
  testId: string;
  category: TestCategory;
  severity: TestSeverity;
  title: string;
  description: string;
  actualResponse: string;
  recommendation: string;
  discoveredAt: string;
}

export interface CategoryScore {
  category: TestCategory;
  total: number;
  passed: number;
  failed: number;
  partial: number;
  error: number;
  skipped: number;
  scorePercentage: number;
}

export interface LatencyMetrics {
  averageMs: number;
  p95Ms: number;
  p99Ms: number;
  minMs: number;
  maxMs: number;
  errorRatePercentage: number;
}

export interface SecurityScorecard {
  overallSecurityScore: number;
  aiSafetyScore: number;
  firestoreSecurityScore: number;
  authenticationScore: number;
  aiAccuracyScore: number;
}

export interface CampaignSummary {
  id: string;
  campaignType: 'quick' | 'standard' | 'full' | 'category';
  timestamp: string;
  durationMs: number;
  totalTests: number;
  passed: number;
  failed: number;
  partial: number;
  error: number;
  skipped: number;
  scorecard: SecurityScorecard;
  categoryScores: Record<TestCategory, CategoryScore>;
  latencyMetrics: LatencyMetrics;
  findings: Finding[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  records: TestExecutionRecord[];
}

export interface HistoricalRun {
  id: string;
  timestamp: string;
  date: string;
  campaignType: string;
  totalTests: number;
  passed: number;
  failed: number;
  critical: number;
  overallScore: number;
  aiSafetyScore: number;
  chemistryScore: number;
}
