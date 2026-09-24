'use client';

import React, { useState } from 'react';
import { Layers, Sun, Eye, ShieldCheck, Zap } from 'lucide-react';

type CompositeKey = 'concrete' | 'photochromic' | 'optical' | 'fiberglass' | 'superconductor';

interface CompositeData {
  title: string;
  matrix: string;
  matrixProperty: string;
  reinforcement: string;
  reinforcementProperty: string;
  combinedProperty: string;
  applications: string;
}

const COMPOSITES: Record<CompositeKey, CompositeData> = {
  concrete: {
    title: 'Reinforced Concrete',
    matrix: 'Concrete',
    matrixProperty: 'High compressive strength, brittle under tension.',
    reinforcement: 'Steel rods',
    reinforcementProperty: 'High tensile strength, prevents stretching and cracking.',
    combinedProperty: 'Withstands both immense compressive and tensile stresses.',
    applications: 'High-rise skyscrapers, highway flyovers, bridge foundations.',
  },
  photochromic: {
    title: 'Photochromic Glass',
    matrix: 'Glass (Silica)',
    matrixProperty: 'Transparent, hard, chemically inert.',
    reinforcement: 'Silver chloride (AgCl) and Copper(I) chloride (CuCl)',
    reinforcementProperty: 'Sensitive to UV photons; reversible photochemical redox reaction.',
    combinedProperty: 'Darkens automatically in intense sunlight and clears up indoors.',
    applications: 'Transition optical spectacles, automobile smart sunroofs.',
  },
  optical: {
    title: 'Optical Fibres',
    matrix: 'Outer glass cladding (low refractive index n₂)',
    matrixProperty: 'Protective casing with lower optical density.',
    reinforcement: 'Inner silica core (high refractive index n₁)',
    reinforcementProperty: 'High optical density; confines photons via total internal reflection.',
    combinedProperty: 'Transmits gigabit light signals over vast distances with minimal attenuation (n₁ > n₂).',
    applications: 'High-speed broadband internet cables, medical endoscopy diagnostic tools.',
  },
  fiberglass: {
    title: 'Fibre Glass',
    matrix: 'Plastic / Polymer Resin',
    matrixProperty: 'Lightweight, flexible, low tensile strength.',
    reinforcement: 'Glass Fibres',
    reinforcementProperty: 'High tensile strength, stiff and non-combustible.',
    combinedProperty: 'High specific strength-to-weight ratio, waterproof, corrosion-proof.',
    applications: 'Kayak boat hulls, badminton rackets, motorcycle safety helmets, water storage tanks.',
  },
  superconductor: {
    title: 'Superconductor Ceramic Alloy',
    matrix: 'Copper Oxide Matrix',
    matrixProperty: 'Structural ceramic framework.',
    reinforcement: 'Yttrium, Barium, and Oxygen atoms (YBCO)',
    reinforcementProperty: 'Electron Cooper-pair conduction below critical transition temperature.',
    combinedProperty: 'Zero electrical resistance ($R = 0$) and Meissner effect magnetic levitation.',
    applications: 'High-speed Maglev bullet trains, MRI magnetic resonance medical scanners.',
  },
};

export function CompositeInspector() {
  const [selected, setSelected] = useState<CompositeKey>('concrete');
  const [uvIntensity, setUvIntensity] = useState<number>(0);

  const current = COMPOSITES[selected];
  const isLensDarkened = uvIntensity > 50;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-purple" />
            Composite Materials Phase Inspector
          </h3>
          <p className="text-sm text-slate-500">
            Form 4 Chapter 8.4: Matrix Phase + Reinforcement Phase Synergy
          </p>
        </div>

        {/* Composite Selector Buttons */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200" role="group">
          {(Object.keys(COMPOSITES) as CompositeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selected === key
                  ? 'bg-white text-brand-purple shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {COMPOSITES[key].title}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Phase Interactive Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Matrix Phase Card */}
        <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              Phase 1: Matrix
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">
            Matrix Phase: {current.matrix}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {current.matrixProperty}
          </p>
        </div>

        {/* Reinforcement Phase Card */}
        <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              Phase 2: Reinforcement
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">
            Reinforcement Phase: {current.reinforcement}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {current.reinforcementProperty}
          </p>
        </div>
      </div>

      {/* Combined Superior Property Callout */}
      <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-sm text-white mb-1">Combined Superior Properties:</h5>
            <p className="text-xs text-slate-300 leading-relaxed">{current.combinedProperty}</p>
            <p className="text-xs text-amber-300 mt-2 font-mono">
              <strong>SPM Exam Real-World Uses:</strong> {current.applications}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Sub-modules */}
      {selected === 'photochromic' && (
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-sm text-slate-900">
                Interactive UV Exposure Simulation:
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              {isLensDarkened ? 'Lens State: Darkened (Sunlight)' : 'Lens State: Clear (Indoors)'}
            </span>
          </div>

          <input
            aria-label="UV Light Intensity"
            type="range"
            min="0"
            max="100"
            value={uvIntensity}
            onChange={(e) => setUvIntensity(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          {/* Visual Spectacle Lens */}
          <div className="mt-4 flex items-center justify-center">
            <div
              className="w-44 h-24 rounded-full border-4 border-slate-800 shadow-inner flex items-center justify-center transition-all duration-300"
              style={{
                backgroundColor: `rgba(30, 41, 59, ${0.1 + (uvIntensity / 100) * 0.85})`,
              }}
            >
              <Eye className="w-8 h-8 text-slate-400" />
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-3 text-center">
            {isLensDarkened ? (
              <span className="text-amber-800 font-semibold">
                Precipitation of silver atoms: UV light causes Ag⁺ + e⁻ → Ag, absorbing visible light and darkening the lens!
              </span>
            ) : (
              <span>In darkness/indoors, Cu²⁺ oxidises Ag back to colorless Ag⁺, restoring transparent optical clarity.</span>
            )}
          </p>
        </div>
      )}

      {selected === 'optical' && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950">
          <h5 className="font-bold mb-1 flex items-center gap-1.5 text-indigo-900">
            <Zap className="w-4 h-4 text-indigo-600" />
            Physics Principle: Total internal reflection
          </h5>
          <p className="leading-relaxed">
            Light enters the inner core and repeatedly undergoes total internal reflection along the fiber boundary because the core has a higher refractive index than the outer cladding (<strong>n₁ &gt; n₂</strong>).
          </p>
        </div>
      )}
    </div>
  );
}
