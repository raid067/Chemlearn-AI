import Link from 'next/link';
import ChemLearnLogo from '@/components/ChemLearnLogo';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-14 px-4 sm:px-6 lg:px-[10%] mt-auto text-slate-600 font-sans" aria-label="Main Footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1.1fr_1.1fr_1.2fr] gap-9 mb-10">
          {/* Brand & Legal Entity Column */}
          <div className="flex flex-col">
            <div className="mb-3">
              <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                <ChemLearnLogo href={null} textClassName="text-slate-900" />
              </Link>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-4 max-w-sm">
              Master Malaysian SPM Form 4 &amp; 5 Chemistry through interactive simulations, qualitative salt analysis, and automated KSSM essay evaluations.
            </p>
            <div className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
              <strong className="text-slate-900">ChemLearn Educational Technologies Sdn. Bhd.</strong><br />
              SSM Reg. No.: 202401038492 (1542381-X)<br />
              Level 14, Menara Southgate, No. 2 Jalan Dua, Off Jalan Chan Sow Lin, 55200 Kuala Lumpur, Malaysia<br />
              Official Support:{' '}
              <a href="mailto:support@chemlearn.my" className="text-brand-purple font-semibold hover:underline">
                support@chemlearn.my
              </a>
            </div>
          </div>

          {/* Syllabus & Notes */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4 tracking-tight">Syllabus &amp; Notes</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/lessons" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Form 4 Lessons
                </Link>
              </li>
              <li>
                <Link href="/quizzes" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Practice Quizzes
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Study Guides &amp; Formulas
                </Link>
              </li>
              <li>
                <Link href="/experiments/chapter-8" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Chapter 8 Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Interactive Labs */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4 tracking-tight">Interactive Labs</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/experiments/qualitative-sim.html" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Salt Analysis Matrix
                </a>
              </li>
              <li>
                <a href="/experiments/essay-grader.html" className="text-slate-500 hover:text-brand-purple transition-colors">
                  AI Essay Grader
                </a>
              </li>
              <li>
                <a href="/experiments/alloy-sim.html" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Alloy Lattice Physics
                </a>
              </li>
              <li>
                <a href="/experiments/titration-sim.html" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Acid-Base Titration
                </a>
              </li>
              <li>
                <a href="/experiments/srs-flashcards.html" className="text-slate-500 hover:text-brand-purple transition-colors">
                  SM-2 Flashcards
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4 tracking-tight">Legal &amp; Trust</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Privacy Policy (PDPA)
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/#cookie-prefs" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Cookie Settings
                </Link>
              </li>
              <li>
                <Link href="/thank-you" className="text-slate-500 hover:text-brand-purple transition-colors">
                  Getting Started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <p>© 2026 ChemLearn Educational Technologies Sdn. Bhd. All rights reserved.</p>
          <p className="text-center md:text-right">
            Independent supplementary revision software aligned with KSSM curriculum. Not affiliated with Lembaga Peperiksaan Malaysia.
          </p>
        </div>
      </div>
    </footer>
  );
}
