'use client';
import { useState } from 'react';
import QuizGrid from '@/components/quizzes/QuizGrid';
import QuizFilterDock from '@/components/quizzes/QuizFilterDock';
import AIQuizModal from '@/components/quizzes/AIQuizModal';
import DuelModal from '@/components/quizzes/DuelModal';
import DirectQuizModal from '@/components/quizzes/DirectQuizModal';
export default function QuizzesPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8 max-w-6xl">
      <header className="flex flex-col items-center text-center gap-4 mb-4 mt-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Chemistry Quizzes</h1>
          <p className="text-slate-500 text-lg">Challenge yourself with concept verification checks covering properties, mixtures, and industrial manufacturing compounds.</p>
        </div>
      </header>

      <QuizFilterDock activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      <QuizGrid activeFilter={activeFilter} />

      <AIQuizModal />
      <DuelModal />
      <DirectQuizModal />
    </div>
  );
}
