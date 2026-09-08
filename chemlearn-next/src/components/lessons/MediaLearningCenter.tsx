'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface MediaLesson {
  id: string;
  title: string;
  topicId: 'alloys' | 'glass' | 'ceramics' | 'composites';
  topicLabel: string;
  topicTagColor: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  gradientFallback: string;
}

const MEDIA_LESSONS: MediaLesson[] = [
  // 8.1 Alloys
  {
    id: 'alloy-1',
    title: 'Alloys Beat',
    topicId: 'alloys',
    topicLabel: '8.1 Alloys',
    topicTagColor: 'text-purple-600',
    duration: '01:32',
    videoUrl: 'song8.1.mp4',
    thumbnail: '/images/lessons/calloys1.png',
    gradientFallback: 'from-purple-900 to-indigo-700',
  },
  {
    id: 'alloy-2',
    title: 'Importance of Alloys',
    topicId: 'alloys',
    topicLabel: '8.1 Alloys',
    topicTagColor: 'text-purple-600',
    duration: '02:34',
    videoUrl: '8.1.1.mp4',
    thumbnail: '/images/lessons/calloys2.png',
    gradientFallback: 'from-purple-900 to-indigo-700',
  },
  {
    id: 'alloy-3',
    title: 'Sains di Sebalik Aloi',
    topicId: 'alloys',
    topicLabel: '8.1 Alloys',
    topicTagColor: 'text-purple-600',
    duration: '01:44',
    videoUrl: '8.1.2.mp4',
    thumbnail: '/images/lessons/calloys3.png',
    gradientFallback: 'from-purple-900 to-indigo-700',
  },
  // 8.2 Glass
  {
    id: 'glass-1',
    title: 'The Amazing World of Glass',
    topicId: 'glass',
    topicLabel: '8.2 Glass',
    topicTagColor: 'text-emerald-600',
    duration: '01:46',
    videoUrl: 'song8.2.mov',
    thumbnail: '/images/lessons/cglass1.png',
    gradientFallback: 'from-emerald-900 to-teal-700',
  },
  {
    id: 'glass-2',
    title: 'Understanding Glass Materials',
    topicId: 'glass',
    topicLabel: '8.2 Glass',
    topicTagColor: 'text-emerald-600',
    duration: '18:34',
    videoUrl: '8.2.1.mp4',
    thumbnail: '/images/lessons/cglass2.png',
    gradientFallback: 'from-emerald-900 to-teal-700',
  },
  {
    id: 'glass-3',
    title: 'Bahan Buatan Dalam Industri (Kaca)',
    topicId: 'glass',
    topicLabel: '8.2 Glass',
    topicTagColor: 'text-emerald-600',
    duration: '04:52',
    videoUrl: '8.2.2.mp4',
    thumbnail: '/images/lessons/cglass3.png',
    gradientFallback: 'from-emerald-900 to-teal-700',
  },
  // 8.3 Ceramics
  {
    id: 'ceramics-1',
    title: 'Ceramics Learning Tune',
    topicId: 'ceramics',
    topicLabel: '8.3 Ceramics',
    topicTagColor: 'text-amber-600',
    duration: '01:02',
    videoUrl: 'song8.3.mp4',
    thumbnail: '/images/lessons/cceramics1.png',
    gradientFallback: 'from-amber-900 to-orange-700',
  },
  {
    id: 'ceramics-2',
    title: 'Composition Ceramics and Its Uses',
    topicId: 'ceramics',
    topicLabel: '8.3 Ceramics',
    topicTagColor: 'text-amber-600',
    duration: '06:15',
    videoUrl: '8.3.1.mp4',
    thumbnail: '/images/lessons/cceramics2.png',
    gradientFallback: 'from-amber-900 to-orange-700',
  },
  {
    id: 'ceramics-3',
    title: 'Bahan Buatan Dalam Industri (Seramik)',
    topicId: 'ceramics',
    topicLabel: '8.3 Ceramics',
    topicTagColor: 'text-amber-600',
    duration: '05:05',
    videoUrl: '8.3.2.mp4',
    thumbnail: '/images/lessons/cceramics3.png',
    gradientFallback: 'from-amber-900 to-orange-700',
  },
  // 8.4 Composites
  {
    id: 'composites-1',
    title: 'Matrix & The Fiber',
    topicId: 'composites',
    topicLabel: '8.4 Composites',
    topicTagColor: 'text-blue-600',
    duration: '06:21',
    videoUrl: 'song8.4.mp4',
    thumbnail: '/images/lessons/ccomposites1.png',
    gradientFallback: 'from-blue-900 to-indigo-700',
  },
  {
    id: 'composites-2',
    title: 'Composite Materials & Its Importance',
    topicId: 'composites',
    topicLabel: '8.4 Composites',
    topicTagColor: 'text-blue-600',
    duration: '04:40',
    videoUrl: '8.4.1.mp4',
    thumbnail: '/images/lessons/ccomposites2.png',
    gradientFallback: 'from-blue-900 to-indigo-700',
  },
  {
    id: 'composites-3',
    title: 'Bahan Buatan Dalam Industri (Bahan Komposit)',
    topicId: 'composites',
    topicLabel: '8.4 Composites',
    topicTagColor: 'text-blue-600',
    duration: '05:55',
    videoUrl: '8.4.2.mp4',
    thumbnail: '/images/lessons/ccomposites3.png',
    gradientFallback: 'from-blue-900 to-indigo-700',
  },
];

type TopicFilter = 'all' | 'alloys' | 'glass' | 'ceramics' | 'composites';

export default function MediaLearningCenter() {
  const [activeFilter, setActiveFilter] = useState<TopicFilter>('all');
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredLessons = activeFilter === 'all'
    ? MEDIA_LESSONS
    : MEDIA_LESSONS.filter((item) => item.topicId === activeFilter);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6" id="mediaCenter">
      {/* Header section identical to screenshot */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
            Chemistry Lessons
          </span>
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-base sm:text-lg">
          Explore interactive media dashboards for Form 4 Chapter 8: Manufactured Substances in Industry with detailed structural profiles.
        </p>

        {/* Filter dock pills */}
        <div className="flex items-center justify-center gap-3 flex-wrap mt-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
              activeFilter === 'all'
                ? 'bg-purple-700 text-white shadow-purple-700/25 shadow-md scale-105'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          >
            All Topics
          </button>
          <button
            onClick={() => setActiveFilter('alloys')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeFilter === 'alloys'
                ? 'bg-purple-600 text-white shadow-purple-600/25 shadow-md scale-105'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          >
            <span>🧪</span> 8.1 Alloys
          </button>
          <button
            onClick={() => setActiveFilter('glass')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeFilter === 'glass'
                ? 'bg-emerald-600 text-white shadow-emerald-600/25 shadow-md scale-105'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50'
            }`}
          >
            <span>🧪</span> 8.2 Glass
          </button>
          <button
            onClick={() => setActiveFilter('ceramics')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeFilter === 'ceramics'
                ? 'bg-amber-600 text-white shadow-amber-600/25 shadow-md scale-105'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            <span>🏺</span> 8.3 Ceramics
          </button>
          <button
            onClick={() => setActiveFilter('composites')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeFilter === 'composites'
                ? 'bg-blue-600 text-white shadow-blue-600/25 shadow-md scale-105'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <span>🧱</span> 8.4 Composites
          </button>
        </div>
      </div>

      {/* Section Sub-heading */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Media Learning Center
        </h2>
      </div>

      {/* 3-Column Video Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => setActiveVideo({ url: lesson.videoUrl, title: lesson.title })}
            className="group bg-white rounded-2xl p-3 border-2 border-slate-100 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col"
          >
            {/* Thumbnail Box */}
            <div className={`relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-gradient-to-br ${lesson.gradientFallback}`}>
              <Image
                src={lesson.thumbnail}
                alt={lesson.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              {/* Glassmorphic Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-md border border-white/50 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-white group-hover:text-slate-900 transition-all duration-200">
                  <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 14 16">
                    <path d="M0 0v16l14-8z" />
                  </svg>
                </div>
              </div>
              {/* Duration Tag */}
              <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold px-1.5 py-0.5 rounded font-mono">
                {lesson.duration}
              </div>
            </div>

            {/* Info Block */}
            <div className="px-1 pb-1">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${lesson.topicTagColor}`}>
                {lesson.topicLabel}
              </span>
              <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-purple-700 transition-colors mt-0.5">
                {lesson.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Popup */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
              <h3 className="text-lg font-bold text-white truncate pr-4">
                {activeVideo.title}
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close video"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Player */}
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <video
                src={activeVideo.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML video.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
