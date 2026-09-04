'use client';
import { useDashboardStore } from '@/stores/useDashboardStore';

const BADGES = [
  { id: 'first_quiz', emoji: '🎯', label: 'First Quiz', desc: 'Completed a quiz' },
  { id: 'streak_3', emoji: '🔥', label: '3 Day Streak', desc: 'Studied 3 days in a row' },
  { id: 'master', emoji: '👑', label: 'Master', desc: 'Reached 80% average' },
  { id: 'lab', emoji: '🧪', label: 'Lab Rat', desc: 'Completed all experiments' }
];

export default function BadgeRow() {
  const { studentData } = useDashboardStore();
  
  // Mock unlocked state based on generic data for now
  const unlocked = {
    first_quiz: (studentData?.quizScore || 0) > 0,
    streak_3: (studentData?.streak || 0) >= 3,
    master: (studentData?.quizScore || 0) >= 80,
    lab: false
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-6">Achievements</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {BADGES.map((badge) => {
          const isUnlocked = unlocked[badge.id as keyof typeof unlocked];
          return (
            <div 
              key={badge.id} 
              className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                isUnlocked 
                  ? 'border-yellow-200 bg-yellow-50/50' 
                  : 'border-slate-100 bg-slate-50 grayscale opacity-60'
              }`}
            >
              <div className="text-4xl mb-3">{badge.emoji}</div>
              <div className="text-sm font-bold text-slate-800 text-center leading-tight mb-1">{badge.label}</div>
              <div className="text-xs text-slate-500 text-center">{badge.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
