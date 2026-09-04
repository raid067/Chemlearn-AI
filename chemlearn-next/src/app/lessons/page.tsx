import Link from 'next/link';
import { CHAPTERS } from '@/lib/constants';

export default function CurriculumHub() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Chemistry Curriculum</h1>
          <p className="text-lg text-slate-600">Master SPM Chemistry through bite-sized, interactive lessons.</p>
        </header>

        <div className="grid gap-6">
          {CHAPTERS.map((chapter) => (
            <Link key={chapter.id} href={`/lessons/${chapter.id}`} className="block group">
              <div 
                className="rounded-2xl p-6 transition-all duration-300 hover:shadow-xl border border-transparent hover:border-slate-200"
                style={{ backgroundColor: chapter.bg }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{chapter.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: chapter.color }}>{chapter.title}</h2>
                    <p className="text-slate-600 font-medium">{chapter.topics.length} Topics</p>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed mb-6">{chapter.description}</p>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  {chapter.topics.slice(0, 4).map((topic) => (
                    <div key={topic.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-sm font-medium text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chapter.color }}></span>
                      <span className="truncate">{topic.title}</span>
                    </div>
                  ))}
                  {chapter.topics.length > 4 && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-sm font-medium text-slate-500 italic">
                      + {chapter.topics.length - 4} more topics...
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
