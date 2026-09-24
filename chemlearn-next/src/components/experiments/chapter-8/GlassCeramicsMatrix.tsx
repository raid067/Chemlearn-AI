'use client';

import React, { useState } from 'react';
import { Flame, ShieldCheck, AlertCircle, Thermometer, Sparkles } from 'lucide-react';

interface GlassType {
  name: string;
  formula: string;
  meltingPoint: string;
  thermalExpansion: string;
  properties: string;
  uses: string;
}

const GLASS_DATA: GlassType[] = [
  {
    name: 'Fused Silica Glass',
    formula: 'SiO₂ (> 99%)',
    meltingPoint: '~1700°C',
    thermalExpansion: 'Extremely Low',
    properties: 'High heat resistance, transparent to UV light, highly inert.',
    uses: 'Telescope mirrors, optical lenses, laboratory silica crucibles.',
  },
  {
    name: 'Soda-Lime Glass',
    formula: 'SiO₂ + Na₂CO₃ + CaCO₃',
    meltingPoint: '~1000°C',
    thermalExpansion: 'High',
    properties: 'Low melting point, easy to mold/blow, low resistance to thermal shock.',
    uses: 'Window panes, beverage glass bottles, food jars.',
  },
  {
    name: 'Borosilicate Glass',
    formula: 'SiO₂ + B₂O₃ + Na₂O + Al₂O₃',
    meltingPoint: '~1400°C',
    thermalExpansion: 'Low',
    properties: 'Very high resistance to thermal shock (Pyrex) and chemical corrosion.',
    uses: 'Laboratory boiling tubes, beakers, baking oven dishes.',
  },
  {
    name: 'Lead Crystal Glass',
    formula: 'SiO₂ + PbO + Na₂O',
    meltingPoint: '~1100°C',
    thermalExpansion: 'Moderate',
    properties: 'High refractive index (sparkles brilliantly), high density, softer to engrave.',
    uses: 'Prisms, decorative chandeliers, luxury glassware.',
  },
];

export function GlassCeramicsMatrix() {
  const [activeTab, setActiveTab] = useState<'glass' | 'ceramics'>('glass');
  const [testedThermalShock, setTestedThermalShock] = useState<boolean>(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Glass & Ceramics Property Matrix
          </h3>
          <p className="text-sm text-slate-500">
            Form 4 Chapters 8.2 & 8.3: Composition, Properties, and Industrial Applications
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200" role="group">
          <button
            type="button"
            onClick={() => setActiveTab('glass')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'glass'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Glass Varieties (8.2)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ceramics')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'ceramics'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ceramics (8.3)
          </button>
        </div>
      </div>

      {activeTab === 'glass' ? (
        <div>
          {/* Glass Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GLASS_DATA.map((glass) => (
              <div
                key={glass.name}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-base">{glass.name}</h4>
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                    {glass.meltingPoint}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-600 mb-3 bg-white p-2 rounded-lg border border-slate-200/60">
                  <strong>Components:</strong> {glass.formula}
                </p>
                <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                  <strong>Properties:</strong> {glass.properties}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>SPM Uses:</strong> {glass.uses}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Thermal Shock Test */}
          <div className="mt-6 p-5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  Virtual Thermal Shock Challenge (Plunge 300°C glass into 0°C Ice Water)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  SPM Paper 2 Question: Why must laboratory test tubes be borosilicate glass instead of soda-lime?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTestedThermalShock(true)}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-all shrink-0 active:scale-95"
              >
                Test Thermal Shock
              </button>
            </div>

            {testedThermalShock && (
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Soda-Lime Glass: Cracks
                  </div>
                  <p className="text-xs text-red-200/80 mt-1">
                    High coefficient of thermal expansion causes rapid uneven contraction when cooled, shattering the glass structure.
                  </p>
                </div>
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Borosilicate Glass: Intact
                  </div>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Boron oxide ($B_2O_3$) dramatically reduces thermal expansion, enabling it to withstand abrupt temperature shifts without fracturing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Ceramics Content */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Ceramics */}
            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50">
              <h4 className="font-bold text-amber-900 text-lg mb-2">1. Traditional Ceramics</h4>
              <p className="text-xs text-amber-950 mb-3 leading-relaxed">
                Made from natural clay containing <strong>Kaolin</strong> (hydrated aluminium silicate, $Al_2O_3 \cdot 2SiO_2 \cdot 2H_2O$).
              </p>
              <ul className="text-xs text-amber-900 space-y-1.5 list-disc pl-4">
                <li>Mixed with water, shaped, and fired in a high-temperature kiln.</li>
                <li><strong>Properties:</strong> Hard, high melting point, brittle, electrical insulator.</li>
                <li><strong>Applications:</strong> Roof tiles, terracotta pots, toilet bowls, brick building structures.</li>
              </ul>
            </div>

            {/* Advanced Ceramics */}
            <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/50">
              <h4 className="font-bold text-indigo-900 text-lg mb-2">2. Advanced Ceramics</h4>
              <p className="text-xs text-indigo-950 mb-3 leading-relaxed">
                Engineered from pure inorganic synthetic compounds such as <strong>Zirconia</strong> ($ZrO_2$), Silicon Carbide ($SiC$), and Alumina ($Al_2O_3$).
              </p>
              <ul className="text-xs text-indigo-900 space-y-1.5 list-disc pl-4">
                <li>Withstand extreme friction, aerospace thermal loads, and biological fluids.</li>
                <li><strong>Properties:</strong> Extreme thermal tolerance, chemical inertness, biocompatible.</li>
                <li><strong>Applications:</strong> Ceramic brake discs, aerospace heat shields, hip replacement implants.</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-emerald-600" />
              General Properties of All Ceramics:
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              High melting point • Chemical inertness (does not corrode) • Electrical and thermal insulator • High compressive strength but brittle under tension.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
