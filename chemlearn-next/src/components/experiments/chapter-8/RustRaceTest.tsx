'use client';

import React, { useState } from 'react';
import { ShieldCheck, Calendar, Info } from 'lucide-react';

export function RustRaceTest() {
  const [days, setDays] = useState<number>(0);

  // Rust percentage based on days:
  // Iron: rapid rusting up to 100%
  // Steel: moderate rusting up to 45%
  // Stainless Steel: 0% always
  const ironRust = Math.min(Math.round((days / 7) * 100), 100);
  const steelRust = Math.min(Math.round((days / 7) * 45), 45);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            The Rust Race (Corrosion Test - Experiment 8.1B)
          </h3>
          <p className="text-sm text-slate-500">
            Compare corrosion rates of Iron vs Steel vs Stainless Steel in agar + potassium hexacyanoferrate(III)
          </p>
        </div>
      </div>

      {/* Virtual Rack with 3 Test Tubes (SVG) */}
      <div className="bg-slate-900 rounded-xl p-6 flex flex-col items-center justify-center relative min-h-[300px]">
        <svg width="420" height="220" viewBox="0 0 420 220" className="max-w-full">
          {/* Test Tube Rack base */}
          <rect x="20" y="190" width="380" height="14" rx="3" fill="#64748b" />
          <rect x="20" y="70" width="380" height="8" rx="2" fill="#475569" />

          {/* Tube 1: Iron Nail */}
          <g transform="translate(60, 30)">
            {/* Glass Tube */}
            <rect x="0" y="0" width="40" height="160" rx="20" fill="rgba(255,255,255,0.12)" stroke="#94a3b8" strokeWidth="2" />
            {/* Liquid / Agar with Prussian blue indicator spot */}
            <rect x="2" y="40" width="36" height="116" rx="18" fill={`rgba(30, 64, 175, ${0.15 + (ironRust / 100) * 0.7})`} />
            {/* Nail */}
            <rect x="17" y="55" width="6" height="80" fill={ironRust > 40 ? '#b45309' : '#94a3b8'} rx="1" />
            {/* Rust particles */}
            {ironRust > 20 && (
              <circle cx="20" cy="95" r={ironRust > 60 ? 8 : 4} fill="#ea580c" opacity="0.8" />
            )}
            <text x="20" y="180" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">
              Iron Nail
            </text>
          </g>

          {/* Tube 2: Steel Nail */}
          <g transform="translate(190, 30)">
            <rect x="0" y="0" width="40" height="160" rx="20" fill="rgba(255,255,255,0.12)" stroke="#94a3b8" strokeWidth="2" />
            <rect x="2" y="40" width="36" height="116" rx="18" fill={`rgba(30, 64, 175, ${0.1 + (steelRust / 100) * 0.4})`} />
            <rect x="17" y="55" width="6" height="80" fill={steelRust > 20 ? '#78350f' : '#64748b'} rx="1" />
            {steelRust > 20 && (
              <circle cx="20" cy="95" r="4" fill="#d97706" opacity="0.6" />
            )}
            <text x="20" y="180" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">
              Steel Nail
            </text>
          </g>

          {/* Tube 3: Stainless Steel Nail */}
          <g transform="translate(320, 30)">
            <rect x="0" y="0" width="40" height="160" rx="20" fill="rgba(255,255,255,0.12)" stroke="#94a3b8" strokeWidth="2" />
            <rect x="2" y="40" width="36" height="116" rx="18" fill="rgba(241, 245, 249, 0.2)" />
            {/* Clean, shiny stainless steel nail */}
            <rect x="17" y="55" width="6" height="80" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" rx="1" />
            <text x="20" y="180" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
              Stainless Steel Nail
            </text>
          </g>
        </svg>
      </div>

      {/* Time Elapsed Slider */}
      <div className="mt-6 flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 whitespace-nowrap">
          <Calendar className="w-4 h-4 text-brand-purple" />
          <span>Days Elapsed:</span>
        </div>
        <input
          aria-label="Days Elapsed"
          type="range"
          min="0"
          max="7"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-purple"
        />
        <span className="font-mono text-sm font-bold text-slate-900 w-16 text-right">
          Day {days} / 7
        </span>
      </div>

      {/* Observation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
          <p className="text-xs font-bold uppercase text-red-600">Iron (Pure Fe)</p>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {days >= 3 ? 'High Rust Formation' : 'Initial Rusting'}
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Rusts heavily. Dark blue precipitate forms with potassium hexacyanoferrate(III), indicating high concentration of Fe²⁺ ions.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
          <p className="text-xs font-bold uppercase text-amber-600">Steel (Fe + C)</p>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {days >= 4 ? 'Moderate Rusting' : 'Slow Corrosion'}
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Carbon increases strength, but steel still oxidises in moist air, producing noticeable rust spots.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/50">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-cyan-700">Stainless Steel</p>
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-lg font-bold text-emerald-800 mt-1">
            No Rust
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Chromium reacts with oxygen to form a tough, microscopic <strong>Chromium(III) oxide ($Cr_2O_3$)</strong> protective oxide layer.
          </p>
        </div>
      </div>
    </div>
  );
}
