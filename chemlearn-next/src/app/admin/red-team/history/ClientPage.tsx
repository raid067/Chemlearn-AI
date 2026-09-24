'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { HistoricalRun } from '@/lib/redteam/types';
import { auth } from '@/lib/firebase';
import {
  History,
  ArrowLeft,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

export default function RedTeamHistoryClientPage() {
  const router = useRouter();
  const { isAdmin, initialized } = useAuthStore();
  const [history, setHistory] = useState<HistoricalRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

  const isDevMode = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const hasAccess = isAdmin || isDevMode;

  useEffect(() => {
    if (hasAccess) {
      (async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          const headers: Record<string, string> = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          const res = await fetch('/api/admin/red-team/history', { headers });
          const data = await res.json();
          if (data.history) {
            setHistory(data.history);
          }
        } catch (err) {
          console.error('Failed to load history:', err);
        } finally {
          setLoading(false);
        }
      })();
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
        <p className="text-slate-500 mb-8">Administrator authorization is required to view vulnerability history.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const toggleSelectRun = (id: string) => {
    setSelectedRuns((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const runA = history.find((r) => r.id === selectedRuns[0]);
  const runB = history.find((r) => r.id === selectedRuns[1]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/red-team"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-brand-purple" />
              Vulnerability & Audit History
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Review past security audits, track vulnerability regressions, and compare releases.
            </p>
          </div>
        </div>

        <Link
          href="/admin/red-team"
          className="px-4 py-2 bg-brand-purple hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          Open Red Team Console
        </Link>
      </header>

      {/* Release Comparison Card (if 2 runs selected) */}
      {runA && runB && (
        <section className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-purple font-bold text-sm">
              <TrendingUp className="w-5 h-5" />
              Release Comparison Mode
            </div>
            <button
              onClick={() => setSelectedRuns([])}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Clear Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-purple-100">
              <span className="text-xs font-bold text-slate-500 uppercase">Baseline ({runA.date})</span>
              <div className="text-lg font-black text-slate-900 mt-1">
                Score: {runA.overallScore}% • Criticals: {runA.critical}
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Passed: {runA.passed} / {runA.totalTests} tests ({((runA.passed / runA.totalTests) * 100).toFixed(0)}%)
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-purple-100">
              <span className="text-xs font-bold text-slate-500 uppercase">Current ({runB.date})</span>
              <div className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                Score: {runB.overallScore}% • Criticals: {runB.critical}
                {runB.overallScore > runA.overallScore ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    +{runB.overallScore - runA.overallScore}%
                  </span>
                ) : runB.overallScore < runA.overallScore ? (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                    {runB.overallScore - runA.overallScore}%
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">±0%</span>
                )}
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Passed: {runB.passed} / {runB.totalTests} tests ({((runB.passed / runB.totalTests) * 100).toFixed(0)}%)
              </div>
            </div>
          </div>
        </section>
      )}

      {/* History Table */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Audit Releases Log</h2>
            <p className="text-xs text-slate-500">Select any two rows to compare vulnerability diffs between releases.</p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {selectedRuns.length} of 2 selected for comparison
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading audit history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-3 px-4 font-bold">Compare</th>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold text-right">Tests</th>
                  <th className="py-3 px-4 font-bold text-right">Passed</th>
                  <th className="py-3 px-4 font-bold text-right">Failed</th>
                  <th className="py-3 px-4 font-bold text-right">Critical</th>
                  <th className="py-3 px-4 font-bold text-right">Overall Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((run) => {
                  const isSelected = selectedRuns.includes(run.id);
                  return (
                    <tr
                      key={run.id}
                      onClick={() => toggleSelectRun(run.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-purple-50/70 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-brand-purple focus:ring-brand-purple cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{run.date}</div>
                        <div className="text-[11px] text-slate-400 uppercase">{run.campaignType} Scan • {run.id}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">{run.totalTests}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 font-bold">{run.passed}</td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600 font-bold">{run.failed}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {run.critical > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">{run.critical}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold font-mono ${
                            run.overallScore >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : run.overallScore >= 75
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {run.overallScore}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
