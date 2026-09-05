'use client';
import { useLabStore } from '@/stores/useLabStore';
import VirtualLab from '@/components/experiments/VirtualLab';
import AILabAssistant from '@/components/experiments/AILabAssistant';
import { Beaker, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ExperimentsPage() {
  const { activeLab, setActiveLab } = useLabStore();

  if (activeLab) {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveLab(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {activeLab === 'thermal' ? 'Thermal Decomposition of Nitrates' : 
               activeLab === 'dilution' ? 'Acid Dilution Practical' : 
               activeLab === 'gas-test' ? 'Gas Identification Tests' : 'Qualitative Analysis of Salts'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium">
            <ShieldAlert className="w-4 h-4" /> Safety goggles required
          </div>
        </header>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative bg-slate-900">
            <VirtualLab />
          </div>
          <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
            <AILabAssistant />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8 max-w-6xl">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Virtual Chemistry Lab</h1>
        <p className="text-slate-500 mt-1">Safely conduct SPM experiments in interactive 3D.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {([
          { id: 'thermal' as const, title: 'Thermal Decomposition', desc: 'Heat nitrate salts and observe the gases evolved.', isLink: false as const },
          { id: 'dilution' as const, title: 'Acid Dilution', desc: 'Prepare standard solutions using the M1V1=M2V2 formula.', isLink: false as const },
          { id: 'gas-test' as const, title: 'Gas Tests', desc: 'Identify oxygen, hydrogen, and carbon dioxide.', isLink: false as const },
          { id: 'qualitative' as const, title: 'Salt Analysis', desc: 'Identify cations and anions in unknown salts.', isLink: false as const },
          { id: 'chapter-8' as const, title: 'Chapter 8: Alloys & Composites', desc: 'Read the official KSSM SPM target procedures and theories.', isLink: true as const, href: '/experiments/chapter-8' }
        ]).map((lab) => (
          <div key={lab.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
              <Beaker className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{lab.title}</h3>
            <p className="text-slate-500 mb-6">{lab.desc}</p>
            {lab.isLink ? (
              <a 
                href={lab.href}
                className="mt-auto py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors text-center block"
              >
                Read Guide
              </a>
            ) : (
              <button 
                onClick={() => setActiveLab(lab.id)}
                className="mt-auto py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Enter Lab
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
