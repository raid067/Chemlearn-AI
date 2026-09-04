import React from 'react';
import { AlertTriangle, Lightbulb, BookOpen, ChevronRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

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
            <span className="text-brand-purple">The Official KSSM Experiments</span>
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
              Examiners love testing the <strong>Hardness Drop Test</strong> and the <strong>Rust Race</strong> in SPM <strong>Paper 3 (Practical)</strong> and as structured essay questions in <strong>Paper 2</strong>. If you can memorize the variables and the "why" behind the results, you are guaranteed easy marks. Let's break them down!
            </p>
          </div>
        </header>

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
                A common mistake students make is writing "Weight" as the constant variable. You must specify <strong>"Mass of the weight"</strong> or <strong>"Height of the weight dropped"</strong>. Being specific saves your marks!
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-50 rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Procedure
            </h3>
            <ol className="list-decimal pl-5 space-y-4 text-slate-300">
              <li>Tape a steel ball bearing onto the surface of a <strong>copper block</strong> using cellophane tape.</li>
              <li>Hang a <strong>1 kg weight</strong> exactly <strong>50 cm</strong> above the block using a retort stand and thread.</li>
              <li>Cut the thread to drop the 1 kg weight directly onto the ball bearing.</li>
              <li>Remove the ball bearing and measure the <strong>diameter of the dent</strong> left on the copper block.</li>
              <li>Repeat steps 1 to 4 using a <strong>bronze block</strong> to replace the copper block.</li>
            </ol>
            
            <div className="mt-8 p-4 border border-dashed border-slate-700 rounded-xl bg-slate-800/50 text-center text-slate-400">
              <p>[Web Designer: Insert 3D interactive diagram of the retort stand, 1kg weight, and the dented blocks here]</p>
            </div>
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

          <div className="bg-slate-900 text-slate-50 rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Procedure
            </h3>
            <ol className="list-decimal pl-5 space-y-4 text-slate-300">
              <li>Label three test tubes as A, B, and C.</li>
              <li>Place an <strong>iron nail</strong> in A, a <strong>steel nail</strong> in B, and a <strong>stainless steel nail</strong> in C.</li>
              <li>Pour 10 cm³ of water into each test tube until the nails are fully submerged.</li>
              <li>Leave the test tubes in a rack for <strong>one week</strong>.</li>
              <li>Observe and record the amount of rust on each nail.</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-green-800 mb-3">Textbook Conclusion: Why doesn't stainless steel rust?</h3>
            <p className="text-green-700 leading-relaxed">
              The iron nail rusts the most, while the stainless steel nail shows <strong>no rust at all</strong>. Stainless steel is an alloy containing chromium and nickel. The chromium reacts with oxygen to form a very tough, invisible <strong>protective oxide layer</strong> (Chromium(III) oxide) on the surface, which completely blocks water and oxygen from reaching the iron beneath it!
            </p>
          </div>
        </section>

        {/* Warning Box for Glass and Ceramics */}
        <section className="mb-16">
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-red-800 mb-3">Stop! No Experiments for Glass (8.2) & Ceramics (8.3)</h2>
            <p className="text-red-700 text-lg max-w-2xl mx-auto leading-relaxed">
              Don't waste time looking for lab procedures for glass and ceramics. Making them requires industrial furnaces that reach thousands of degrees—way too dangerous for a school lab! 
              <br/><br/>
              <strong>Your SPM Strategy:</strong> Focus entirely on memorizing their <strong>properties</strong> (e.g., inert, heat insulators, brittle) and their <strong>uses</strong> (e.g., borosilicate glass for labware, advanced ceramics for engine parts).
            </p>
          </div>
        </section>

        {/* Experiment 8.4 */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">3</div>
            <h2 className="text-3xl font-bold text-slate-800">Experiment 8.4: The Skeleton Strength Test (Composite Materials)</h2>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">The Setup</h3>
            <ul className="space-y-4 text-slate-700">
              <li className="flex gap-2"><strong>Aim:</strong> To compare the strength of concrete with reinforced concrete.</li>
              <li className="flex flex-col gap-1 mt-4">
                <strong>Variables:</strong>
                <ul className="list-disc pl-6 space-y-1 mt-1 text-slate-600">
                  <li><span className="font-semibold text-slate-800">Manipulated:</span> Type of concrete block (Pure concrete vs. Concrete with steel wires/paper clips)</li>
                  <li><span className="font-semibold text-slate-800">Responding:</span> Number of 1 kg weights required to break the block</li>
                  <li><span className="font-semibold text-slate-800">Constant:</span> Size of the concrete blocks / Height of the weight dropped</li>
                </ul>
              </li>
              <li className="flex gap-2 mt-4"><strong>Materials:</strong> Cement, water, paper clips (acting as steel reinforcement).</li>
              <li className="flex gap-2"><strong>Apparatus:</strong> Plastic moulds, 1 kg weights, retort stand, metre rule.</li>
            </ul>
          </div>

          {/* Warning Tip 2 */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex gap-4">
            <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-800 text-lg mb-1">⚠️ SPM Target Tip</h4>
              <p className="text-amber-700">
                In Paper 2 structure questions, examiners will strictly check if you wrote <strong>"atoms"</strong> when explaining alloys. However, for composite materials, the keywords shift to <strong>"forces"</strong> (compression and tension). Don't mix up the vocabulary!
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-50 rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Procedure
            </h3>
            <ol className="list-decimal pl-5 space-y-4 text-slate-300">
              <li>Prepare a pure concrete block and a reinforced concrete block (mixed with paper clips) of the exact same size.</li>
              <li>Place the pure concrete block across two supports.</li>
              <li>Hang a <strong>1 kg weight</strong> 50 cm above the center of the block.</li>
              <li>Drop the weight onto the block.</li>
              <li>If it doesn't break, add another 1 kg weight (total 2 kg) and drop it again from the same height.</li>
              <li>Record the <strong>maximum number of weights</strong> dropped just before the block breaks.</li>
              <li>Repeat the test with the reinforced concrete block.</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-green-800 mb-3">Textbook Conclusion: The Power of Reinforcement</h3>
            <p className="text-green-700 leading-relaxed mb-4">
              The reinforced concrete block can withstand a significantly higher number of weights before breaking. 
            </p>
            <ul className="list-disc pl-5 space-y-2 text-green-700 font-medium">
              <li>Pure concrete is very strong under <strong>compression</strong> (being crushed), but weak under <strong>tension</strong> (being stretched or bent), making it brittle.</li>
              <li>When steel wires (or paper clips in our lab) are added, the steel acts as a skeleton that is highly resistant to <strong>tension forces</strong>.</li>
              <li>Combining them creates a composite material that is strong under both compression AND tension!</li>
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
