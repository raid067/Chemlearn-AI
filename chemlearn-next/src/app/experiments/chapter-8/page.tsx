'use client';

import React from 'react';
import { AlertTriangle, Lightbulb, BookOpen, ChevronRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { AtomicLatticeSimulator } from '@/components/experiments/chapter-8/AtomicLatticeSimulator';
import { HardnessDropTest } from '@/components/experiments/chapter-8/HardnessDropTest';
import { RustRaceTest } from '@/components/experiments/chapter-8/RustRaceTest';
import { GlassCeramicsMatrix } from '@/components/experiments/chapter-8/GlassCeramicsMatrix';
import { CompositeInspector } from '@/components/experiments/chapter-8/CompositeInspector';

export default function Chapter8Experiments() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Navigation */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium">
          <Link href="/experiments" className="hover:text-brand-purple transition-colors">Experiments</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800">Chapter 8: Alloys & Composite Materials</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
            Form 4 Chemistry Chapter 8:<br/>
            <span className="text-brand-purple">The Official KSSM Experiments & Interactive Labs</span>
          </h1>
          
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              Why You Need to Master These
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Welcome, students! Chapter 8 (Manufactured Substances in Industry) might seem like a lot of reading, but the <strong>practical experiments are gold mines for marks</strong>. 
            </p>
            <p className="text-slate-600 leading-relaxed text-lg mt-4">
              Examiners love testing the <strong>Hardness Drop Test</strong> and the <strong>Rust Race</strong> in SPM <strong>Paper 3 (Practical)</strong> and as structured essay questions in <strong>Paper 2</strong>. If you can understand the atomic lattice slip planes and the &quot;why&quot; behind the results, you are guaranteed top marks.
            </p>
          </div>
        </header>

        {/* Interactive Atomic Lattice Simulation (Subtopic 8.1) */}
        <section className="mb-16">
          <div className="mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
              Microscopic Physics Simulation
            </span>
          </div>
          <AtomicLatticeSimulator />
        </section>

        {/* Experiment 8.1A */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">1</div>
            <h2 className="text-3xl font-bold text-slate-800">Experiment 8.1A: The Hardness Drop Test (Alloys)</h2>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">The Setup</h3>
            <ul className="space-y-4 text-slate-700">
              <li className="flex gap-2"><strong>Aim:</strong> To compare the hardness of an alloy (bronze) with its pure metal (copper).</li>
              
              <li className="flex flex-col gap-1 mt-4">
                <strong>Variables:</strong>
                <ul className="list-disc pl-6 space-y-1 mt-1 text-slate-600">
                  <li><span className="font-semibold text-slate-800">Manipulated:</span> Type of block (Copper block vs. Bronze block)</li>
                  <li><span className="font-semibold text-slate-800">Responding:</span> Diameter of the dent made on the block</li>
                  <li><span className="font-semibold text-slate-800">Constant:</span> Mass of the weight / Height of the weight dropped / Diameter of steel ball bearing</li>
                </ul>
              </li>
              
              <li className="flex gap-2 mt-4"><strong>Materials:</strong> Copper block, Bronze block, cellophane tape, thread.</li>
              <li className="flex gap-2"><strong>Apparatus:</strong> 1 kg weight, steel ball bearing, retort stand with clamp, metre rule.</li>
            </ul>
          </div>

          {/* Warning Tip 1 */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex gap-4">
            <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-800 text-lg mb-1">⚠️ SPM Target Tip</h4>
              <p className="text-amber-700">
                A common mistake students make is writing &quot;Weight&quot; as the constant variable. You must specify <strong>&quot;Mass of the weight&quot;</strong> or <strong>&quot;Height of the weight dropped&quot;</strong>. Being specific saves your marks!
              </p>
            </div>
          </div>

          {/* Virtual Hardness Drop Simulator */}
          <div className="mb-8">
            <HardnessDropTest />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-green-800 mb-3">Textbook Conclusion: Why is Bronze harder?</h3>
            <p className="text-green-700 leading-relaxed mb-4">
              The diameter of the dent on the bronze block is <strong>smaller</strong> than the copper block, proving bronze is harder. But why?
            </p>
            <ul className="list-disc pl-5 space-y-2 text-green-700 font-medium">
              <li>In pure copper, atoms are of the same size and arranged in an orderly manner. Layers of atoms slide easily when force is applied.</li>
              <li>In bronze, the presence of <strong>foreign atoms</strong> (Tin) which are different in size <strong>disrupts the orderly arrangement</strong> of the copper atoms.</li>
              <li>This prevents the <strong>layers of atoms from sliding</strong> easily over one another, making the alloy much harder.</li>
            </ul>
          </div>
        </section>

        {/* Experiment 8.1B */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">2</div>
            <h2 className="text-3xl font-bold text-slate-800">Experiment 8.1B: The Rust Race (Corrosion Test)</h2>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">The Setup</h3>
            <ul className="space-y-4 text-slate-700">
              <li className="flex gap-2"><strong>Aim:</strong> To compare the resistance to corrosion of an alloy (stainless steel) with its pure metal (iron).</li>
              <li className="flex flex-col gap-1 mt-4">
                <strong>Variables:</strong>
                <ul className="list-disc pl-6 space-y-1 mt-1 text-slate-600">
                  <li><span className="font-semibold text-slate-800">Manipulated:</span> Type of nail (Iron nail, Steel nail, Stainless steel nail)</li>
                  <li><span className="font-semibold text-slate-800">Responding:</span> Amount of rust on the nail</li>
                  <li><span className="font-semibold text-slate-800">Constant:</span> Volume of water / Size of the nails</li>
                </ul>
              </li>
              <li className="flex gap-2 mt-4"><strong>Materials:</strong> Iron nail, steel nail, stainless steel nail, water.</li>
              <li className="flex gap-2"><strong>Apparatus:</strong> Test tubes, test tube rack.</li>
            </ul>
          </div>

          {/* Virtual Rust Race Simulator */}
          <div className="mb-8">
            <RustRaceTest />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-green-800 mb-3">Textbook Conclusion: Why doesn&apos;t stainless steel rust?</h3>
            <p className="text-green-700 leading-relaxed">
              The iron nail rusts the most, while the stainless steel nail shows <strong>no rust at all</strong>. Stainless steel is an alloy containing chromium and nickel. The chromium reacts with oxygen to form a very tough, invisible <strong>protective oxide layer</strong> (Chromium(III) oxide) on the surface, which completely blocks water and oxygen from reaching the iron beneath it!
            </p>
          </div>
        </section>

        {/* Glass and Ceramics Matrix (8.2 & 8.3) */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">3</div>
            <h2 className="text-3xl font-bold text-slate-800">Subtopics 8.2 & 8.3: Glass & Ceramics Mastery</h2>
          </div>

          <GlassCeramicsMatrix />
        </section>

        {/* Experiment 8.4 & Composite Materials */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-black text-xl">4</div>
            <h2 className="text-3xl font-bold text-slate-800">Subtopic 8.4: Composite Materials Phase Inspector</h2>
          </div>

          {/* Interactive Composite Materials Inspector */}
          <div className="mb-8">
            <CompositeInspector />
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">KSSM Lab 8.4: The Skeleton Strength Test</h3>
            <ul className="space-y-4 text-slate-700">
              <li className="flex gap-2"><strong>Aim:</strong> To compare the strength of concrete with reinforced concrete.</li>
              <li className="flex flex-col gap-1 mt-4">
                <strong>Variables:</strong>
                <ul className="list-disc pl-6 space-y-1 mt-1 text-slate-600">
                  <li><span className="font-semibold text-slate-800">Manipulated:</span> Type of concrete block (Pure concrete vs. Reinforced concrete with steel wires)</li>
                  <li><span className="font-semibold text-slate-800">Responding:</span> Maximum number of 1 kg weights required to break the block</li>
                  <li><span className="font-semibold text-slate-800">Constant:</span> Dimensions of the concrete blocks / Dropping height</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-green-800 mb-3">Textbook Conclusion: The Power of Reinforcement</h3>
            <p className="text-green-700 leading-relaxed mb-4">
              The reinforced concrete block can withstand a significantly higher load before failure.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-green-700 font-medium">
              <li>Pure concrete is very strong under <strong>compression</strong> (being crushed), but weak under <strong>tension</strong> (being stretched or bent), making it brittle.</li>
              <li>When steel rods are added, the steel skeleton absorbs high <strong>tensile forces</strong>.</li>
              <li>Combining matrix and reinforcement produces a composite material that withstands both compression AND tension!</li>
            </ul>
          </div>
        </section>
        
        <footer className="text-center text-slate-500 pt-8 border-t border-slate-200">
          <p>ChemLearn AI SPM Guide - Master Your Practical Exams</p>
        </footer>

      </div>
    </div>
  );
}
