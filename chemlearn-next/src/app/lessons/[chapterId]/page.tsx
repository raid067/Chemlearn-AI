import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CHAPTERS } from '@/lib/constants';
import { ChevronLeft, PlayCircle } from 'lucide-react';

export default async function ChapterOverview({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const chapter = CHAPTERS.find(c => c.id === chapterId);
  
  if (!chapter) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/lessons" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Curriculum
          </Link>
        </div>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{chapter.emoji}</span>
            <h1 className="text-4xl font-bold" style={{ color: chapter.color }}>{chapter.title}</h1>
          </div>
          <p className="text-lg text-slate-600">{chapter.description}</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-semibold text-slate-900">Chapter Topics</h2>
            <p className="text-sm text-slate-500 mt-1">{chapter.topics.length} topics to master</p>
          </div>
          
          <div className="divide-y divide-slate-100">
            {chapter.topics.map((topic, index) => (
              <Link 
                key={topic.id} 
                href={`/lessons/${chapter.id}/${topic.id}`}
                className="flex items-center p-6 hover:bg-slate-50 transition-colors group"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 mr-4"
                  style={{ backgroundColor: chapter.color }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {topic.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      {topic.estimatedTime}
                    </span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      topic.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      topic.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {topic.difficulty}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors">
                  <ChevronLeft className="w-6 h-6 rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
