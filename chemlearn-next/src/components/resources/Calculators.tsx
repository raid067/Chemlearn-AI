'use client';
import { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function Calculators() {
  const [calcType, setCalcType] = useState<'molarity' | 'ph'>('molarity');
  
  // Molarity State
  const [moles, setMoles] = useState('');
  const [volume, setVolume] = useState('');
  
  // pH State
  const [hPlus, setHPlus] = useState('');
  
  const calculateMolarity = () => {
    const n = parseFloat(moles);
    const v = parseFloat(volume);
    if (!isNaN(n) && !isNaN(v) && v > 0) {
      return (n / (v / 1000)).toFixed(4); // assuming volume is in mL, converting to L
    }
    return '--';
  };

  const calculatePH = () => {
    const h = parseFloat(hPlus);
    if (!isNaN(h) && h > 0) {
      return (-Math.log10(h)).toFixed(2);
    }
    return '--';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-full">
      {/* Sidebar */}
      <div className="md:w-64 bg-slate-50 p-6 border-r border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-brand-purple" />
          Calculators
        </h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setCalcType('molarity')}
            className={`text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${
              calcType === 'molarity' 
                ? 'bg-brand-purple text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Molarity Calculator
          </button>
          <button
            onClick={() => setCalcType('ph')}
            className={`text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${
              calcType === 'ph' 
                ? 'bg-brand-purple text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            pH Calculator
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {calcType === 'molarity' ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Molarity Calculator</h2>
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
              <p className="text-blue-800 font-medium text-center font-mono">M = n / V</p>
              <p className="text-blue-600 text-sm text-center mt-1">Molarity (mol/dm³) = Moles / Volume (dm³)</p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Moles of Solute (n)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={moles}
                    onChange={(e) => setMoles(e.target.value)}
                    placeholder="e.g. 0.5"
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">mol</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Volume of Solution (V)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full pl-4 pr-16 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">cm³ (mL)</span>
                </div>
              </div>

              <div className="mt-4 p-6 bg-slate-900 rounded-xl text-center shadow-inner">
                <span className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Result</span>
                <div className="text-4xl font-black text-green-400 font-mono flex items-center justify-center gap-2">
                  {calculateMolarity()} <span className="text-lg text-slate-500 font-medium">mol dm⁻³ (M)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">pH Calculator</h2>
            
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl mb-6">
              <p className="text-rose-800 font-medium text-center font-mono">pH = -log₁₀[H⁺]</p>
              <p className="text-rose-600 text-sm text-center mt-1">Calculates pH from Hydrogen ion concentration</p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hydrogen Ion Concentration [H⁺]</label>
                <div className="relative">
                  <input
                    type="number"
                    value={hPlus}
                    onChange={(e) => setHPlus(e.target.value)}
                    placeholder="e.g. 0.001 or 1e-3"
                    className="w-full pl-4 pr-16 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">mol dm⁻³</span>
                </div>
              </div>

              <div className="mt-4 p-6 bg-slate-900 rounded-xl text-center shadow-inner">
                <span className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">pH Level</span>
                <div className="text-4xl font-black text-rose-400 font-mono flex items-center justify-center gap-2">
                  {calculatePH()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
