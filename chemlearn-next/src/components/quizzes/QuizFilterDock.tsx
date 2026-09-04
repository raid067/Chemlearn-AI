'use client';
import { TOPICS } from '@/lib/constants';

interface QuizFilterDockProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function QuizFilterDock({ activeFilter, onFilterChange }: QuizFilterDockProps) {
  const dynamicFilters = [
    { label: 'All Topics', emoji: '🎵', id: 'All' },
    ...TOPICS.map(t => ({ label: t.label, emoji: t.emoji || '🔬', id: t.label }))
  ];

  return (
    <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      {dynamicFilters.map(f => {
        const isActive = activeFilter === f.id || (activeFilter === 'All' && f.id === 'All');
        return (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all shadow-sm ${
              isActive
                ? 'bg-brand-purple text-white shadow-brand-purple/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{f.emoji}</span>
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
