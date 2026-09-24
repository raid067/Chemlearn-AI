'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import {
  Users,
  Award,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Star,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

interface AdminStats {
  totalStudents: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  lastUpdated?: string | null;
}

interface FeedbackItem {
  id: string;
  userName: string;
  userEmail?: string;
  rating: number;
  text: string;
  timestamp: string | null;
}

export default function AdminClientPage() {
  const router = useRouter();
  const { user, isAdmin, initialized } = useAuthStore();
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalQuizzesCompleted: 0,
    averageScore: 0,
  });
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Check developer environment fallback
  const isDevMode =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const hasAccess = isAdmin || isDevMode;

  const fetchOverviewData = useCallback(async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/overview', {
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.data) {
        setStats(json.data.stats || { totalStudents: 0, totalQuizzesCompleted: 0, averageScore: 0 });
        setFeedbacks(json.data.feedbacks || []);
      }
    } catch (err: unknown) {
      console.error('[Admin Overview Fetch Error]:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch admin overview metrics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    fetchOverviewData();
  };

  useEffect(() => {
    let active = true;
    if (initialized && hasAccess) {
      const timer = setTimeout(() => {
        if (active) {
          fetchOverviewData();
        }
      }, 0);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
  }, [initialized, hasAccess, fetchOverviewData]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
          5.0 Stars
        </span>
      );
    }
    if (rating === 4) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          <Star className="w-3 h-3 fill-blue-500 text-blue-500" />
          4.0 Stars
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
        {rating}.0 Stars
      </span>
    );
  };

  const formatTimestamp = (ts: string | null) => {
    if (!ts) return 'N/A';
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  // 1. Loading State
  if (!initialized || (isLoading && hasAccess)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-slate-600 font-medium text-sm">Verifying administrative security credentials...</p>
        </div>
      </div>
    );
  }

  // 2. Access Denied Guard
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Restricted Access</h1>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            You do not possess the required administrative claims (`request.auth.token.admin == true`) to enter the ChemLearn AI Command Center.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex justify-center items-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors"
            >
              Sign In as Administrator
            </Link>
            <Link
              href="/"
              className="inline-flex justify-center items-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin Dashboard UI
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-slate-900">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                CL
              </span>
              <span>ChemLearn <span className="text-purple-600 font-semibold text-sm ml-1 px-2 py-0.5 bg-purple-50 rounded-md border border-purple-200">Admin</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Refresh dashboard metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <Link
              href="/admin/red-team"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              AI Security Suite
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong className="font-semibold">Notice:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* Dashboard Title & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Admin Command Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Authoritative overview of SPM Chemistry learning metrics, platform health, and student submissions.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 self-start sm:self-auto">
            Logged in as: <strong className="text-slate-800">{user?.email || 'admin@chemlearn.my'}</strong>
          </div>
        </div>

        {/* Overview Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                {stats.totalStudents.toLocaleString()}
              </h2>
            </div>
          </div>

          {/* Quizzes Completed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quizzes Completed</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                {stats.totalQuizzesCompleted.toLocaleString()}
              </h2>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                {stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}%` : '0%'}
              </h2>
            </div>
          </div>

          {/* AI Security Posture */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security Auditing</p>
                <h2 className="text-sm font-bold text-indigo-700 mt-0.5">Zero-Trust Active</h2>
              </div>
            </div>
            <Link
              href="/admin/red-team"
              className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
              title="Open Red Team Security Evaluation Suite"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Security & Admin Modules Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-400/20">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Vulnerability Assessment
              </div>
              <h3 className="text-lg font-bold">Automated Red Team Adversary Suite</h3>
              <p className="text-xs text-purple-200/80 mt-1 leading-relaxed">
                Execute automated prompt injection attacks, jailbreak defenses, syllabus accuracy benchmarks, and zero-trust rate limit stress tests against production Gemini endpoints.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/admin/red-team"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-purple-950 hover:bg-purple-50 text-xs font-bold transition-all shadow-sm"
              >
                Launch Security Scan
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/red-team/history"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-800/40 hover:bg-purple-800/60 text-purple-200 text-xs font-semibold transition-all border border-purple-700/40"
              >
                Scan Audit History
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3 border border-slate-200">
                <Award className="w-3.5 h-3.5 text-slate-500" />
                Curriculum Governance
              </div>
              <h3 className="text-lg font-bold text-slate-900">Malaysian KSSM Form 4 & Form 5 Alignment</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                ChemLearn AI enforces the Dual-Language Programme (DLP) syllabus. Chemistry equations, experiment safety procedures, and essay rubrics are strictly verified against authorized textbook frameworks.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/lessons"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                Browse Syllabus Topics
              </Link>
              <Link
                href="/quizzes"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
              >
                Inspect Quizzes
              </Link>
            </div>
          </div>
        </div>

        {/* Student Feedback Triage Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Student Feedback</h3>
                <p className="text-xs text-slate-500">Live submissions from the in-app feedback dialog.</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {feedbacks.length} Submissions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Timestamp</th>
                  <th scope="col" className="px-6 py-3.5">Student</th>
                  <th scope="col" className="px-6 py-3.5">Rating</th>
                  <th scope="col" className="px-6 py-3.5">Feedback Content</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No feedback entries found in Firestore.
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {formatTimestamp(item.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                        {item.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRatingBadge(item.rating)}
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-md break-words">
                        {item.text || <span className="text-slate-400 italic">No textual comment provided</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
