'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import ClassSelector from '@/components/teacher/ClassSelector';
import StudentRoster from '@/components/teacher/StudentRoster';
import AIInsightsCard from '@/components/teacher/AIInsightsCard';
import { ShieldAlert } from 'lucide-react';

export default function TeacherPortalPage() {
  const router = useRouter();
  const { user, isTeacher, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized) {
      if (!user) {
        router.push('/');
      } else if (!isTeacher) {
        // Not a teacher, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [user, isTeacher, initialized, router]);

  if (!initialized || !user) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
    </div>
  );

  if (!isTeacher) return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-500 mb-8">This portal requires an educator account with verified claims.</p>
      <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold">
        Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8 max-w-7xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Educator Portal</h1>
          <p className="text-slate-500 mt-1">Manage classes, view student analytics, and generate AI insights.</p>
        </div>
        <ClassSelector />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <StudentRoster />
        </div>
        <div className="space-y-6">
          <AIInsightsCard />
        </div>
      </div>
    </div>
  );
}
