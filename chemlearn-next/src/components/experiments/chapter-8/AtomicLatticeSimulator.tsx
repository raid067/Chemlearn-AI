'use client';

import React, { useState } from 'react';
import { ArrowRight, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';

interface AtomicLatticeSimulatorProps {
  initialMode?: 'pure' | 'alloy';
  onShearChange?: (shearPercentage: number) => void;
}

export function AtomicLatticeSimulator({
  initialMode = 'pure',
  onShearChange,
}: AtomicLatticeSimulatorProps) {
  const [mode, setMode] = useState<'pure' | 'alloy'>(initialMode);
  const [force, setForce] = useState<number>(0);

  const handleForceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setForce(val);
    if (onShearChange) {
      onShearChange(val);
    }
  };

  const handleReset = () => {
    setForce(0);
    if (onShearChange) {
      onShearChange(0);
    }
  };

  // Pure metal: top rows shift freely up to 48px
  // Alloy: foreign atoms pin the slip plane; shift is capped at 10px
  const topLayerShift = mode === 'pure' ? (force / 100) * 48 : Math.min((force / 100) * 10, 10);
  const midLayerShift = mode === 'pure' ? (force / 100) * 24 : Math.min((force / 100) * 5, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Atomic Lattice Slip Plane Simulator
          </h3>
          <p className="text-sm text-slate-500">
            Form 4 Chapter 8.1: Why Alloys Are Harder Than Pure Metals
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200" role="group">
          <button
            type="button"
            onClick={() => {
              setMode('pure');
              setForce(0);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'pure'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pure Metal (Copper)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('alloy');
              setForce(0);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'alloy'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bronze Alloy (Cu + Sn)
          </button>
        </div>
      </div>

      {/* SVG Canvas Simulator */}
      <div className="bg-slate-900 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[260px]">
        {/* Applied Force Arrow Indicator */}
        <div
          className="absolute top-4 left-6 flex items-center gap-2 text-white font-mono text-xs transition-opacity duration-300"
          style={{ opacity: force > 0 ? 1 : 0.4 }}
        >
          <span className="font-bold text-amber-400">Shear Force: {force}%</span>
          <ArrowRight
            className="w-5 h-5 text-amber-400 transition-transform"
            style={{ transform: `scaleX(${1 + force / 50})` }}
          />
        </div>

        <svg width="440" height="180" viewBox="0 0 440 180" className="max-w-full">
          {/* Row 1 (Top layer - shifts most) */}
          <g transform={`translate(${topLayerShift}, 0)`} className="transition-transform duration-100 ease-out">
            {[40, 90, 140, 190, 240, 290, 340, 390].map((cx, i) => (
              <circle
                key={`r1-${i}`}
                cx={cx}
                cy="40"
                r="20"
                fill="#f97316"
                stroke="#c2410c"
                strokeWidth="2"
              />
            ))}
          </g>

          {/* Row 2 (Middle layer - with foreign atom in alloy mode) */}
          <g transform={`translate(${midLayerShift}, 0)`} className="transition-transform duration-100 ease-out">
            {[40, 90, 140, 190, 240, 290, 340, 390].map((cx, i) => {
              const isTin = mode === 'alloy' && (i === 3 || i === 5);
              return (
                <circle
                  key={`r2-${i}`}
                  cx={cx}
                  cy="90"
                  r={isTin ? 26 : 20}
                  fill={isTin ? '#94a3b8' : '#f97316'}
                  stroke={isTin ? '#475569' : '#c2410c'}
                  strokeWidth={isTin ? 3 : 2}
                />
              );
            })}
          </g>

          {/* Row 3 (Base layer - stationary) */}
          <g>
            {[40, 90, 140, 190, 240, 290, 340, 390].map((cx, i) => (
              <circle
                key={`r3-${i}`}
                cx={cx}
                cy="140"
                r="20"
                fill="#f97316"
                stroke="#c2410c"
                strokeWidth="2"
              />
            ))}
          </g>
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-orange-700 inline-block" />
            <span>Copper ($Cu$) Atom</span>
          </div>
          {mode === 'alloy' && (
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <span className="w-4 h-4 rounded-full bg-slate-400 border border-slate-600 inline-block" />
              <span>Tin (Sn) foreign atoms (larger size)</span>
            </div>
          )}
        </div>
      </div>

      {/* Force Control Bar */}
      <div className="mt-6 flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label htmlFor="force-slider" className="text-sm font-semibold text-slate-700 whitespace-nowrap">
          Applied Force:
        </label>
        <input
          id="force-slider"
          aria-label="Applied Force"
          type="range"
          min="0"
          max="100"
          value={force}
          onChange={handleForceChange}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
        />
        <span className="font-mono text-sm font-bold text-slate-800 w-12 text-right">{force}%</span>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Force
        </button>
      </div>

      {/* SPM Key Insight Explanation */}
      <div className="mt-4 p-4 rounded-xl border transition-all duration-200">
        {mode === 'pure' ? (
          <div className="bg-orange-50/80 border-orange-200 text-orange-950 p-4 rounded-xl">
            <h4 className="font-bold flex items-center gap-2 text-orange-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              SPM Explanation: Pure Copper
            </h4>
            <p className="text-sm leading-relaxed">
              In pure copper, atoms are of the same size and arranged in an orderly manner. When force is applied,
              <strong> layers of atoms slide easily over one another</strong>, causing pure copper to be ductile, malleable, but soft.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50/80 border-amber-200 text-amber-950 p-4 rounded-xl">
            <h4 className="font-bold flex items-center gap-2 text-amber-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              SPM Explanation: Bronze Alloy
            </h4>
            <p className="text-sm leading-relaxed">
              In bronze, the presence of foreign tin ($Sn$) atoms of different size <strong>disrupts the orderly arrangement</strong> of copper atoms.
              Layers of atoms are <strong>prevented from sliding easily</strong> over one another, making bronze substantially harder and stronger!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
