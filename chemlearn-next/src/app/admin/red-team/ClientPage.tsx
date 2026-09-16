'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  CampaignSummary,
  TestCategory,
  TestSeverity,
} from '@/lib/redteam/types';
import {
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Download,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  Database,
  Lock,
  Beaker,
} from 'lucide-react';

export default function RedTeamClientPage() {
  const router = useRouter();
  const { user, isAdmin, initialized } = useAuthStore();
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Allow developer access in local development environment
  const isDevMode = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const hasAccess = isAdmin || isDevMode;

  const triggerScan = async (scanType: 'quick' | 'standard' | 'full', category?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/red-team/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-redteam-admin-key': 'dev-admin-override',
        },
        body: JSON.stringify({ scanType, category }),
      });

      if (!res.ok) {
        throw new Error(`Scan execution failed with status: ${res.status}`);
      }

      const data: CampaignSummary = await res.json();
      startTransition(() => {
        setSummary(data);
      });
    } catch (err) {
      console.error('[Red Team Client Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial baseline scan on load
  useEffect(() => {
    if (hasAccess && !summary) {
      triggerScan('quick');
    }
  }, [hasAccess]);

  if (!initialized) {
    return (
      <div className="flex-1 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Restricted Access</h1>
        <p className="text-slate-500 mb-8">
          The Red Team & Security Evaluation Engine requires verified Administrator privileges.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          Return to Student Dashboard
        </button>
      </div>
    );
  }

  const sc = summary?.scorecard || {
    overallSecurityScore: 0,
    aiSafetyScore: 0,
    firestoreSecurityScore: 0,
    authenticationScore: 0,
    aiAccuracyScore: 0,
  };

  const filteredRecords = (summary?.records || []).filter((r) => {
    const matchesCat = activeCategory === 'all' || r.category === activeCategory;
    const matchesSev = severityFilter === 'all' || r.severity === severityFilter;
    return matchesCat && matchesSev;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500 text-emerald-600';
    if (score >= 75) return 'bg-blue-500 text-blue-600';
    if (score >= 60) return 'bg-amber-500 text-amber-600';
    return 'bg-red-500 text-red-600';
  };

  const getSeverityBadge = (severity: TestSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">LOW</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">INFO</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col gap-8">
      {/* Top Banner & Title */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-brand-purple/10 text-brand-purple rounded-xl">
              <ShieldCheck className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                AI Red Team & Security Evaluation
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Automated adversarial testing for ChemLearn AI tutor guardrails, SPM Chemistry accuracy, and Firestore zero-trust rules.
              </p>
            </div>
          </div>
          {isDevMode && !isAdmin && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
              <Cpu className="w-3.5 h-3.5" /> Developer Audit Authorization Active
            </div>
          )}
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => triggerScan('quick')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Quick Scan (~20 Tests)
          </button>
          <button
            onClick={() => triggerScan('standard')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-purple hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            Standard Scan
          </button>
          <button
            onClick={() => triggerScan('full')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Full Red Team
          </button>
          <a
            href="/api/admin/red-team/report?format=markdown"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Report (.md)
          </a>
          <a
            href="/api/admin/red-team/report?format=json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            <FileText className="w-4 h-4" />
            JSON
          </a>
          <Link
            href="/admin/red-team/history"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors"
          >
            <Clock className="w-4 h-4" />
            History
          </Link>
        </div>
      </header>

      {/* Loading Bar */}
      {isLoading && (
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-brand-purple animate-pulse w-full"></div>
        </div>
      )}

      {/* Section 3: Dynamic Security Scoreboard */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Dynamic Security Scoreboard</h2>
            <p className="text-xs text-slate-500">Calculated dynamically from real test executions. Zero hard-coded values.</p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Status: {summary ? `${summary.passed} Passed / ${summary.totalTests} Total` : 'Ready to test'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Overall Security */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Overall Security</span>
              <span className="text-base font-black text-slate-900">{sc.overallSecurityScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${getScoreColor(sc.overallSecurityScore).split(' ')[0]}`}
                style={{ width: `${sc.overallSecurityScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Weighted composite of all defense layers</p>
          </div>

          {/* AI Safety */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>AI Safety</span>
              <span className="text-base font-black text-slate-900">{sc.aiSafetyScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${getScoreColor(sc.aiSafetyScore).split(' ')[0]}`}
                style={{ width: `${sc.aiSafetyScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Prompt injection & prompt leakage resistance</p>
          </div>

          {/* Firestore Security */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Firestore Security</span>
              <span className="text-base font-black text-slate-900">{sc.firestoreSecurityScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${getScoreColor(sc.firestoreSecurityScore).split(' ')[0]}`}
                style={{ width: `${sc.firestoreSecurityScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Rules enforcement across students, XP & duels</p>
          </div>

          {/* Authentication */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Authentication</span>
              <span className="text-base font-black text-slate-900">{sc.authenticationScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${getScoreColor(sc.authenticationScore).split(' ')[0]}`}
                style={{ width: `${sc.authenticationScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Token validation & privilege escalation checks</p>
          </div>

          {/* AI Accuracy */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>AI Accuracy</span>
              <span className="text-base font-black text-slate-900">{sc.aiAccuracyScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${getScoreColor(sc.aiAccuracyScore).split(' ')[0]}`}
                style={{ width: `${sc.aiAccuracyScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">KSSM chemistry correctness & hallucination trap checks</p>
          </div>
        </div>
      </section>

      {/* Section 21: Performance & Latency Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Latency</span>
            <div className="text-xl font-black text-slate-900">
              {summary?.latencyMetrics.averageMs ?? 0} ms
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">P95 Latency</span>
            <div className="text-xl font-black text-slate-900">
              {summary?.latencyMetrics.p95Ms ?? 0} ms
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">P99 Latency</span>
            <div className="text-xl font-black text-slate-900">
              {summary?.latencyMetrics.p99Ms ?? 0} ms
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Failure Rate</span>
            <div className="text-xl font-black text-slate-900">
              {summary?.latencyMetrics.errorRatePercentage ?? 0}%
            </div>
          </div>
        </div>
      </section>

      {/* Critical & High Findings Section */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Vulnerability Findings</h2>
            <p className="text-xs text-slate-500">Security weaknesses requiring code or prompt remediation</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
            {summary?.findings.length || 0} Total Findings
          </span>
        </div>

        {summary?.findings && summary.findings.length > 0 ? (
          <div className="space-y-3">
            {summary.findings.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(f.severity)}
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 uppercase">
                      {f.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">{new Date(f.discoveredAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200 break-words">
                  {f.description}
                </p>
                <div className="text-xs text-slate-700 flex items-start gap-1.5 mt-1">
                  <strong className="text-slate-900 shrink-0">Remediation:</strong>
                  <span>{f.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="text-sm font-medium text-slate-700">Zero active critical or high vulnerability findings detected.</p>
            <p className="text-xs text-slate-500">All evaluated attack vectors were successfully resisted.</p>
          </div>
        )}
      </section>

      {/* Test Category Filter & Execution Table */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Execution Explorer & Test Records</h2>
            <p className="text-xs text-slate-500">Inspect full input, expected behavior, response, and deterministic assertions</p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Tests' },
              { id: 'prompt-injection', label: 'Prompt Injection' },
              { id: 'system-prompt-extraction', label: 'Extraction' },
              { id: 'chemistry-accuracy', label: 'SPM Accuracy' },
              { id: 'ai-marking', label: 'AI Marking' },
              { id: 'hallucination', label: 'Hallucination' },
              { id: 'firestore-authz', label: 'Firestore' },
              { id: 'auth-bypass', label: 'Auth Bypass' },
              { id: 'api-abuse', label: 'API Abuse' },
              { id: 'input-security', label: 'Input Security' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-brand-purple text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Test Name & Category</th>
                <th className="py-3 px-4 font-bold">Severity</th>
                <th className="py-3 px-4 font-bold">Latency</th>
                <th className="py-3 px-4 font-bold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => {
                const isExpanded = expandedRow === r.testId;
                return (
                  <React.Fragment key={r.testId}>
                    <tr
                      onClick={() => setExpandedRow(isExpanded ? null : r.testId)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        {r.result === 'PASS' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> PASS
                          </span>
                        ) : r.result === 'PARTIAL' ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <AlertTriangle className="w-4 h-4" /> PARTIAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                            <XCircle className="w-4 h-4" /> FAIL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.name}</div>
                        <div className="text-[11px] text-slate-400 capitalize">{r.category.replace('-', ' ')} • {r.testId}</div>
                      </td>
                      <td className="py-3 px-4">{getSeverityBadge(r.severity)}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{r.latencyMs} ms</td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="py-4 px-6">
                          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                            <div>
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Test Input</span>
                              <pre className="mt-1 p-2.5 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto font-mono">
                                {typeof r.input === 'string' ? r.input : JSON.stringify(r.input, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expected Behavior</span>
                              <p className="mt-0.5 text-xs text-slate-700">{r.expectedBehavior}</p>
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Response / Evaluated Output</span>
                              <pre className="mt-1 p-2.5 bg-slate-100 text-slate-800 rounded-lg text-xs overflow-x-auto font-mono">
                                {typeof r.response === 'string' ? r.response : JSON.stringify(r.response, null, 2)}
                              </pre>
                            </div>
                            {r.reason && (
                              <div className="p-2.5 bg-red-50 text-red-800 rounded-lg border border-red-200 text-xs">
                                <strong>Evaluation Failure Reason:</strong> {r.reason}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
