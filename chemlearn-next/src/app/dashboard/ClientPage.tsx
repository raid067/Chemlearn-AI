'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import dynamic from 'next/dynamic';
import StatGrid from '@/components/dashboard/StatGrid';
import DailyChallenge from '@/components/dashboard/DailyChallenge';
import BadgeRow from '@/components/dashboard/BadgeRow';
import JoinClassButton from '@/components/dashboard/JoinClassButton';

const HomeworkChecker = dynamic(() => import('@/components/resources/HomeworkChecker'), { 
  ssr: false,
  loading: () => <div className="h-40 bg-slate-100 animate-pulse rounded-xl" />
});

export default function DashboardPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { studentData } = useDashboardStore();

  useEffect(() => {
    if (initialized && !user) {
      router.push('/');
    }
  }, [user, initialized, router]);

  if (!initialized || !user) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="w-12 h-12 rounded-full border-4 border-brand-purple/10 border-t-brand-purple animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8 max-w-6xl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, <span className="text-brand-purple">{studentData?.displayName || user.displayName || 'Student'}</span>!
          </h1>
          <p className="text-slate-500 mt-1">Ready to master some chemistry today?</p>
        </div>
        <JoinClassButton />
      </header>
      
      <StatGrid />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BadgeRow />
          <HomeworkChecker />
        </div>
        <div className="space-y-6">
          <DailyChallenge />
        </div>
      </div>
    </div>
  );
}
