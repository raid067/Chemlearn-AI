'use client';
import { ExternalQuiz } from '@/types/quiz';
import { TOPICS } from '@/lib/constants';

export default function QuizCard({ quiz, index = 0 }: { quiz: ExternalQuiz, index?: number }) {
  const topicMeta = TOPICS.find(t => t.label === quiz.topic);

  return (
    <a 
      href={quiz.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-xl hover:-translate-y-2 hover:border-brand-purple/30 transition-all duration-300 group animate-fade-in-up block"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
    >
      <div className="mb-4">
        <span 
          className="text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide inline-block"
          style={{ backgroundColor: `${topicMeta?.color || '#8b5cf6'}15`, color: topicMeta?.color || '#8b5cf6' }}
        >
          {quiz.topic}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-purple transition-colors">
        {quiz.title}
      </h3>

      {quiz.description && (
        <p className="text-slate-500 leading-relaxed text-sm flex-1">
          {quiz.description}
        </p>
      )}
    </a>
  );
}
