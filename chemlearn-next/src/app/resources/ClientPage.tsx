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
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8 max-w-6xl">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Study Resources</h1>
        <p className="text-slate-500 mt-1">Downloads, AI tools, and calculators for SPM Chemistry.</p>
      </header>

      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-slate-200">
        {[
          { id: 'downloads', label: 'Downloads', icon: <FileText className="w-4 h-4" /> },
          { id: 'notes', label: 'AI Notes', icon: <FileText className="w-4 h-4" /> },
          { id: 'homework', label: 'Homework Checker', icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'tools', label: 'Calculators', icon: <Calculator className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-brand-purple text-brand-purple'
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
  );
}
