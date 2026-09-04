'use client';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { getLevelTitle } from '@/lib/utils';
import { Flame, Star, Trophy, Target } from 'lucide-react';

export default function StatGrid() {
  const studentData = useDashboardStore(s => s.studentData);
  
  const stats = [
    { 
      label: 'Total XP', 
      value: studentData?.xp || 0,
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      bg: 'bg-yellow-50'
    },
    { 
      label: 'Day Streak', 
      value: studentData?.streak || 0,
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      bg: 'bg-orange-50'
    },
    { 
      label: 'Quiz Avg', 
      value: `${studentData?.quizScore || 0}%`,
      icon: <Target className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50'
    },
    { 
      label: 'Current Rank', 
      value: getLevelTitle(studentData?.quizScore || 0),
      icon: <Trophy className="w-6 h-6 text-brand-purple" />,
      bg: 'bg-brand-purple/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 items-start">
          <div className={`p-3 rounded-xl ${stat.bg}`}>
            {stat.icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
            <div className="text-sm font-medium text-slate-500">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
