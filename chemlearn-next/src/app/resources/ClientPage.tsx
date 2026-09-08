'use client';

import { useState } from 'react';
import ResourceGrid from '@/components/resources/ResourceGrid';
import AINotesGenerator from '@/components/resources/AINotesGenerator';
import HomeworkChecker from '@/components/resources/HomeworkChecker';
import Calculators from '@/components/resources/Calculators';
import { Calculator, FileText, CheckSquare } from 'lucide-react';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<'downloads' | 'notes' | 'homework' | 'tools'>('downloads');

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
              Chemistry Resources
            </span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-base sm:text-lg">
            Download structured cheat sheets, comprehensive compound matrix files, and curated chapter worksheets.
          </p>
        </header>

        <div className="flex overflow-x-auto justify-center gap-2 pb-2 scrollbar-hide border-b border-slate-200">
          {([
            { id: 'downloads' as const, label: 'Downloads & Cheatsheets', icon: <FileText className="w-4 h-4" /> },
            { id: 'notes' as const, label: 'AI Notes', icon: <FileText className="w-4 h-4" /> },
            { id: 'homework' as const, label: 'Homework Checker', icon: <CheckSquare className="w-4 h-4" /> },
            { id: 'tools' as const, label: 'Calculators', icon: <Calculator className="w-4 h-4" /> },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'downloads' && <ResourceGrid />}
          {activeTab === 'notes' && <AINotesGenerator />}
          {activeTab === 'homework' && <HomeworkChecker />}
          {activeTab === 'tools' && <Calculators />}
        </div>
      </div>
    </div>
  );
}
