'use client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, use } from 'react';
import { CHAPTERS } from '@/lib/constants';
import { ChevronLeft, BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';

export default function TopicPage({ params }: { params: Promise<{ chapterId: string, topicId: string }> }) {
  const unwrappedParams = use(params);
  const chapter = CHAPTERS.find(c => c.id === unwrappedParams.chapterId);
  const topic = chapter?.topics.find(t => t.id === unwrappedParams.topicId);
  
  const { user } = useAuthStore();
  const [completed, setCompleted] = useState(false);
  const htmlContent = topic ? DOMPurify.sanitize(marked.parse(topic.content) as string) : '';

  if (!chapter || !topic) {
    notFound();
  }

  const handleComplete = async () => {
    if (completed) return;
    setCompleted(true);
    
    if (user) {
      await useGamificationStore.getState().syncWithFirebase(user.uid, 'COMPLETE_LESSON');
    } else {
      await useGamificationStore.getState().addXP(25, 'Completed Lesson', 'COMPLETE_LESSON');
    }
  };

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const askAiTutor = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    
    try {
      let token = '';
      if (user) {
        token = await user.getIdToken();
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          question: `Explain this Chemistry concept to me simply: ${aiQuery}`
        })
      });
      
      if (!res.ok) {
        throw new Error('API Error');
      }

      const data = await res.json();
      if (data.answer) {
        setAiResponse(data.answer);
      } else {
        setAiResponse('Sorry, I could not generate an answer right now.');
      }
    } catch {
      setAiResponse('Connection failed or unauthorized.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link 
          href={`/lessons/${chapter.id}`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {chapter.title}
        </Link>
        
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: chapter.color }}>
          <BookOpen className="w-4 h-4" />
          {topic.estimatedTime}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: chapter.bg, color: chapter.color }}>
            {topic.difficulty}
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{topic.title}</h1>
        </div>

        {/* Prose (Markdown Content) */}
        <article 
          className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-a:text-blue-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Ask AI Section */}
        <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col md:flex-row items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Need a better explanation?</h3>
            <p className="text-slate-600 mb-4">
              Type or paste any text from the lesson, and your AI Tutor will explain it in simpler terms!
            </p>
            <div className="flex gap-2 w-full mb-4">
              <input 
                type="text" 
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAiTutor()}
                placeholder="e.g., What does ionisation mean?"
                className="flex-1 px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={askAiTutor}
                disabled={aiLoading}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
              >
                {aiLoading ? 'Thinking...' : 'Ask AI'}
              </button>
            </div>
            
            {aiResponse && (
              <div className="p-4 bg-white rounded-xl border border-blue-100 text-slate-800 animate-fade-in whitespace-pre-wrap">
                {aiResponse}
              </div>
            )}
          </div>
        </div>

        {/* Completion Action */}
        <div className="mt-12 flex justify-center pb-24">
          <button 
            onClick={handleComplete}
            disabled={completed}
            className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all duration-300 ${
              completed 
                ? 'bg-green-100 text-green-600 cursor-default' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl hover:shadow-2xl hover:-translate-y-1'
            }`}
          >
            {completed ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Lesson Completed! (+25 XP)
              </>
            ) : (
              <>Mark as Complete</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
