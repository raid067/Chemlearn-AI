'use client';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  const { user } = useAuthStore();
  const { openModal, setAuthMode } = useUIStore();

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/10 via-slate-50 to-white"></div>
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/10 text-brand-purple font-medium text-sm mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4" />
          <span>The #1 SPM Chemistry AI Tutor</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
          Master SPM Chemistry<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-violet">
            Faster & Smarter
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 animate-fade-in-up [animation-delay:200ms]">
          Interactive 3D labs, AI-powered notes, smart flashcards, and a bilingual AI tutor designed specifically for the Malaysian SPM syllabus.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:300ms]">
          {user ? (
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 bg-brand-purple text-white rounded-xl font-bold text-lg hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button 
              onClick={() => { setAuthMode('signup'); openModal('auth'); }}
              className="w-full sm:w-auto px-8 py-4 bg-brand-purple text-white rounded-xl font-bold text-lg hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-2"
            >
              Start Learning for Free <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
          >
            Explore Features
          </a>
        </div>
      </div>
    </section>
  );
}
