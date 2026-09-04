import Link from 'next/link';

export const metadata = {
  title: '404: Reaction Compound Not Found | ChemLearn AI',
  description: 'The chemistry simulation, lesson, or resource could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
        <div className="w-20 h-20 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ⚗️
        </div>
        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          Error 404 • Compound Displaced
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Reaction Yield: 0%
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm md:text-base">
          The reagent or page you are looking for has evaporated, decomposed, or moved to another URL.
        </p>

        <div className="grid grid-cols-2 gap-3 text-left mb-8">
          <Link
            href="/lessons"
            className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-xl transition-all"
          >
            <div className="font-bold text-xs text-slate-800">📚 Lessons</div>
            <div className="text-[11px] text-slate-500">Chapters 6 &amp; 8 notes</div>
          </Link>
          <Link
            href="/quizzes"
            className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-xl transition-all"
          >
            <div className="font-bold text-xs text-slate-800">🎯 Quizzes</div>
            <div className="text-[11px] text-slate-500">Formative self-tests</div>
          </Link>
          <Link
            href="/experiments"
            className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-xl transition-all"
          >
            <div className="font-bold text-xs text-slate-800">🧪 Virtual Labs</div>
            <div className="text-[11px] text-slate-500">Interactive 3D trials</div>
          </Link>
          <Link
            href="/dashboard"
            className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-xl transition-all"
          >
            <div className="font-bold text-xs text-slate-800">📊 Dashboard</div>
            <div className="text-[11px] text-slate-500">Study streak &amp; stats</div>
          </Link>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center w-full py-3.5 px-6 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-lg shadow-purple-700/20 transition-all"
        >
          ← Return to Laboratory Home
        </Link>
      </div>
    </div>
  );
}
