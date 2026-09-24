'use client';

import React, { useState } from 'react';
import { ArrowDown, RotateCcw, Play, CheckCircle2 } from 'lucide-react';

export function HardnessDropTest() {
  const [metal, setMetal] = useState<'copper' | 'bronze'>('copper');
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [hasDropped, setHasDropped] = useState<boolean>(false);

  const handleDrop = () => {
    setIsDropping(true);
    setHasDropped(false);
    setTimeout(() => {
      setIsDropping(false);
      setHasDropped(true);
    }, 1000);
  };

  const handleReset = () => {
    setIsDropping(false);
    setHasDropped(false);
  };

  // Experiment 8.1A KSSM Measurements:
  // Copper dent: ~5.2 mm (softer, larger dent)
  // Bronze dent: ~2.8 mm (harder, smaller dent)
  const dentDiameter = metal === 'copper' ? '5.2 mm' : '2.8 mm';
  const dentRadiusPixels = metal === 'copper' ? 24 : 14;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Hardness Drop Test Simulator (Experiment 8.1A)
          </h3>
          <p className="text-sm text-slate-500">
            Compare dent diameters on Copper vs Bronze when struck by a 1 kg weight
          </p>
        </div>

        {/* Metal Selection Toggle */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200" role="group">
          <button
            type="button"
            onClick={() => {
              setMetal('copper');
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              metal === 'copper'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Copper Block
          </button>
          <button
            type="button"
            onClick={() => {
              setMetal('bronze');
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              metal === 'bronze'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bronze Block
          </button>
        </div>
      </div>

      {/* Virtual Retort Stand & Drop Rig (SVG) */}
      <div className="bg-slate-900 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
        <svg width="360" height="260" viewBox="0 0 360 260" className="max-w-full">
          {/* Retort Stand Rod & Base */}
          <rect x="60" y="240" width="120" height="12" rx="3" fill="#64748b" />
          <rect x="80" y="30" width="10" height="210" fill="#94a3b8" />
          <rect x="80" y="40" width="100" height="8" fill="#94a3b8" />

          {/* Thread */}
          <line
            x1="170"
            y1="48"
            x2="170"
            y2={isDropping ? 190 : 70}
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray={hasDropped ? '4 4' : 'none'}
            className="transition-all duration-700 ease-in"
          />

          {/* 1 kg Weight */}
          <g
            transform={`translate(145, ${isDropping ? 185 : hasDropped ? 185 : 70})`}
            className="transition-transform duration-700 ease-in"
          >
            <rect x="0" y="0" width="50" height="35" rx="4" fill="#334155" stroke="#475569" strokeWidth="2" />
            <text x="25" y="22" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">
              1 kg
            </text>
          </g>

          {/* Steel Ball Bearing */}
          <circle cx="170" cy="216" r="6" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />

          {/* Test Block */}
          <g transform="translate(120, 222)">
            <rect
              x="0"
              y="0"
              width="100"
              height="24"
              rx="2"
              fill={metal === 'copper' ? '#ea580c' : '#b45309'}
              stroke={metal === 'copper' ? '#9a3412' : '#78350f'}
              strokeWidth="2"
            />
            <text x="50" y="16" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
              {metal === 'copper' ? 'Copper (Cu)' : 'Bronze (Cu + Sn)'}
            </text>

            {/* Dent Mark once dropped */}
            {hasDropped && (
              <ellipse
                cx="50"
                cy="1"
                rx={dentRadiusPixels / 2}
                ry="3"
                fill="#1e293b"
                stroke="#0f172a"
                strokeWidth="1"
              />
            )}
          </g>
        </svg>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={handleDrop}
            disabled={isDropping}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            Drop 1kg Weight
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Measurement Vernier Reading Box */}
      {hasDropped && (
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Digital Vernier Calliper Measurement
              </p>
              <div className="text-2xl font-black text-slate-900">
                Dent Diameter: <span className={metal === 'copper' ? 'text-orange-600' : 'text-amber-700'}>{dentDiameter}</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-600 max-w-sm text-right">
            {metal === 'copper' ? (
              <p>Large dent indicates copper is softer and deforms more under mechanical impact.</p>
            ) : (
              <p className="font-semibold text-emerald-800">
                Smaller dent diameter proves <strong>Bronze is harder than copper</strong>!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
