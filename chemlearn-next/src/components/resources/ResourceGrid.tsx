'use client';

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface ResourceItem {
  id: string;
  topicId: 'alloys' | 'glass' | 'ceramics' | 'composites';
  topicLabel: string;
  topicTagColor: string;
  topicBgColor: string;
  title: string;
  description: string;
  buttons: {
    label: string;
    url: string;
    type: 'image' | 'pdf';
  }[];
}

const RESOURCES_DATA: ResourceItem[] = [
  // 8.1 Alloys
  {
    id: 'res-alloys-1',
    topicId: 'alloys',
    topicLabel: '8.1 Alloys',
    topicTagColor: 'text-purple-600',
    topicBgColor: 'bg-purple-100/80',
    title: 'Alloys Chemistry Guide',
    description: 'Explains alloy formation, properties, examples, and why alloys outperform pure metals in strength.',
    buttons: [
      { label: 'Download Notes (Malay)', url: '/downloads/notes-alloys-ms.jpg', type: 'image' },
      { label: 'Download Notes (English)', url: '/downloads/notes-alloys-en.jpg', type: 'image' },
    ],
  },
  {
    id: 'res-alloys-2',
    topicId: 'alloys',
    topicLabel: '8.1 Alloys',
    topicTagColor: 'text-purple-600',
    topicBgColor: 'bg-purple-100/80',
    title: 'Understanding Metal Alloys',
    description: 'Explore the fascinating world of alloys by learning how they are produced, understanding their structures and properties, discovering their real-life applications, examining methods of corrosion protection, and mastering effective exam strategies through interactive notes, activities, and practice questions.',
    buttons: [
      { label: 'Download Infographic Note', url: '/downloads/infographic-alloys.jpg', type: 'image' },
    ],
  },
  {
    id: 'res-alloys-3',
    topicId: 'alloys',
    topicLabel: '8.1 Alloys',
    topicTagColor: 'text-purple-600',
    topicBgColor: 'bg-purple-100/80',
    title: 'Mastering Metal Alloys',
    description: 'Learn how alloys are created, explore well-known alloy examples, understand their atomic structures, investigate their unique properties, and discover their practical applications in everyday life and modern industries.',
    buttons: [
      { label: 'Download Comic', url: '/downloads/comic-alloys.jpg', type: 'image' },
    ],
  },

  // 8.2 Glass
  {
    id: 'res-glass-1',
    topicId: 'glass',
    topicLabel: '8.2 Glass',
    topicTagColor: 'text-emerald-600',
    topicBgColor: 'bg-emerald-100/80',
    title: 'Glass Properties Explained',
    description: 'Discover how glass materials withstand thermal, chemical, and mechanical forces, comparing silica structures, melting temperatures, and specialized industrial uses.',
    buttons: [
      { label: 'Download Notes (Malay)', url: '/downloads/notes-glass-ms.jpg', type: 'image' },
      { label: 'Download Notes (English)', url: '/downloads/notes-glass-en.jpg', type: 'image' },
    ],
  },
  {
    id: 'res-glass-2',
    topicId: 'glass',
    topicLabel: '8.2 Glass',
    topicTagColor: 'text-emerald-600',
    topicBgColor: 'bg-emerald-100/80',
    title: 'Modern Glass Guide',
    description: 'Learn about glass composition, properties, and types including fused silica, soda-lime, borosilicate, and lead crystal glass, with practical applications in science and industry.',
    buttons: [
      { label: 'Download Comic', url: '/downloads/comic-glass.jpg', type: 'image' },
    ],
  },
  {
    id: 'res-glass-3',
    topicId: 'glass',
    topicLabel: '8.2 Glass',
    topicTagColor: 'text-emerald-600',
    topicBgColor: 'bg-emerald-100/80',
    title: 'Exploring Glass Types',
    description: 'Discover how different glass compositions create unique properties, from heat resistance to optical clarity, and learn their specialized industrial applications.',
    buttons: [
      { label: 'Download Infographic Note', url: '/downloads/infographic-glass.jpg', type: 'image' },
    ],
  },

  // 8.3 Ceramics
  {
    id: 'res-ceramics-1',
    topicId: 'ceramics',
    topicLabel: '8.3 Ceramics',
    topicTagColor: 'text-amber-600',
    topicBgColor: 'bg-amber-100/80',
    title: 'Ceramic Materials Explained',
    description: 'Learn about ceramics, their properties, advantages, and manufacturing through concise summary overviews.',
    buttons: [
      { label: 'Download Notes (Malay)', url: '/downloads/notes-ceramics-ms.jpg', type: 'image' },
      { label: 'Download Notes (English)', url: '/downloads/notes-ceramics-en.jpg', type: 'image' },
    ],
  },
  {
    id: 'res-ceramics-2',
    topicId: 'ceramics',
    topicLabel: '8.3 Ceramics',
    topicTagColor: 'text-amber-600',
    topicBgColor: 'bg-amber-100/80',
    title: 'Advanced Ceramics Guide',
    description: 'Explore traditional and advanced ceramics, high-temperature superconductors, and structural applications across modern technology.',
    buttons: [
      { label: 'Download Infographic Note', url: '/downloads/infographic-ceramics.jpg', type: 'image' },
      { label: 'Download Notes (Part 1)', url: '/downloads/notes-ceramics-p1.jpg', type: 'image' },
      { label: 'Download Notes (Part 2)', url: '/downloads/notes-ceramics-p2.jpg', type: 'image' },
    ],
  },

  // 8.4 Composites
  {
    id: 'res-composites-1',
    topicId: 'composites',
    topicLabel: '8.4 Composites',
    topicTagColor: 'text-blue-600',
    topicBgColor: 'bg-blue-100/80',
    title: 'Composite Materials Blueprint',
    description: 'Detailed structural profiles of composite materials, matrix vs reinforcement phases, and superior hybrid properties.',
    buttons: [
      { label: 'Download Blueprint Note', url: '/downloads/blueprint-composites.jpg', type: 'image' },
      { label: 'Download Notes (Malay)', url: '/downloads/notes-composites-ms.jpg', type: 'image' },
      { label: 'Download Notes (English)', url: '/downloads/notes-composites-en.jpg', type: 'image' },
    ],
  },
  {
    id: 'res-composites-2',
    topicId: 'composites',
    topicLabel: '8.4 Composites',
    topicTagColor: 'text-blue-600',
    topicBgColor: 'bg-blue-100/80',
    title: 'Mastering Composites',
    description: 'Explore fiber-reinforced polymers, reinforced concrete, and advanced superconductors with real-world applications.',
    buttons: [
      { label: 'Download Infographic Note', url: '/downloads/infographic-composites.jpg', type: 'image' },
    ],
  },
];

type TopicFilter = 'all' | 'alloys' | 'glass' | 'ceramics' | 'composites';

export default function ResourceGrid() {
  const [activeFilter, setActiveFilter] = useState<TopicFilter>('all');
  const [activePreview, setActivePreview] = useState<{ url: string; title: string; type: 'image' | 'pdf' } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePreview(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredResources = activeFilter === 'all'
    ? RESOURCES_DATA
    : RESOURCES_DATA.filter((item) => item.topicId === activeFilter);

  return (
    <div className="w-full">
      {/* Topic Filter Pills */}
      <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
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

      {/* 3-Column Resource Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Category Tag Badge */}
              <span
                className={`inline-block text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3.5 ${item.topicTagColor} ${item.topicBgColor}`}
              >
                {item.topicLabel}
              </span>

              {/* Title */}
              <h3 className="text-xl font-extrabold text-slate-900 leading-snug tracking-tight mb-2.5">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {item.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2 mt-auto">
              {item.buttons.map((btn, bIdx) => (
                <button
                  key={bIdx}
                  onClick={() => setActivePreview({ url: btn.url, title: btn.label, type: btn.type })}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:border-purple-300 hover:bg-purple-50/60 hover:text-purple-700 transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Resource Viewer Modal */}
      {activePreview && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActivePreview(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 truncate pr-4">
                {activePreview.title}
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={activePreview.url}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Save File
                </a>
                <button
                  onClick={() => setActivePreview(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-slate-100">
              {activePreview.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePreview.url}
                  alt={activePreview.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md"
                />
              ) : (
                <iframe
                  src={activePreview.url}
                  title={activePreview.title}
                  className="w-full h-[75vh] rounded-lg border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
