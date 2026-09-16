'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Play, Video, Link2, RotateCcw, Check, X } from 'lucide-react';
import { parseVideoUrl } from '@/lib/video';

interface LessonVideoPlayerProps {
  chapterId: string;
  topicId: string;
  topicTitle: string;
  defaultVideoUrl?: string;
  chapterColor?: string;
}

export default function LessonVideoPlayer({
  chapterId,
  topicId,
  topicTitle,
  defaultVideoUrl,
  chapterColor = '#6d28d9',
}: LessonVideoPlayerProps) {
  const storageKey = `chemlearn_video_${chapterId}_${topicId}`;

  const savedUrl = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('storage', onStoreChange);
      return () => window.removeEventListener('storage', onStoreChange);
    },
    () => {
      try {
        return localStorage.getItem(storageKey) ?? '';
      } catch {
        return '';
      }
    },
    () => ''
  );

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const currentUrl = savedUrl.trim() || defaultVideoUrl || '';
  const isCustom = Boolean(savedUrl.trim());
  const parsed = parseVideoUrl(currentUrl);

  const handleSaveLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) return;

    try {
      localStorage.setItem(storageKey, trimmed);
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Ignore storage errors
    }

    setIsEditing(false);
    setInputUrl('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefault = () => {
    try {
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Ignore storage errors
    }
    setIsEditing(false);
    setInputUrl('');
  };

  return (
    <section 
      aria-label="Lesson Video Player"
      className="my-8 rounded-3xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: chapterColor }}
          >
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Lesson Video Explanation
              {isCustom && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Custom Link
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Interactive visual lecture &amp; concept walk-through
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Video Link Saved!
            </span>
          )}

          {isCustom && defaultVideoUrl && (
            <button
              onClick={handleResetDefault}
              title="Reset to default video"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}

          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setInputUrl(currentUrl);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-purple bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Link2 className="w-3.5 h-3.5" />
            {isEditing ? 'Close' : currentUrl ? 'Change Video Link' : 'Put Video Link'}
          </button>
        </div>
      </div>

      {/* Inline Link Input Dock (when editing or toggled) */}
      {isEditing && (
        <form 
          onSubmit={handleSaveLink}
          className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-purple-50/70 to-indigo-50/70 border border-purple-100 animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste YouTube, Vimeo, or MP4 link (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-purple-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                required
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand-purple hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Save Video Link
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>💡 Supports standard YouTube URLs, youtu.be, shorts, Vimeo, and direct .mp4/.webm media files.</span>
          </p>
        </form>
      )}

      {/* Video Content Display */}
      {parsed.type === 'youtube' && parsed.embedUrl ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md bg-black border border-slate-900">
          <iframe
            src={parsed.embedUrl}
            title={`${topicTitle} - Video Lesson`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : parsed.type === 'vimeo' && parsed.embedUrl ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md bg-black border border-slate-900">
          <iframe
            src={parsed.embedUrl}
            title={`${topicTitle} - Video Lesson`}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : parsed.type === 'direct' && parsed.directUrl ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md bg-black border border-slate-900 flex items-center justify-center">
          <video
            key={parsed.directUrl}
            src={parsed.directUrl}
            controls
            className="w-full h-full object-contain"
            playsInline
          >
            Your browser does not support HTML5 video playback.
          </video>
        </div>
      ) : (
        /* Empty state: No video link set yet */
        <div className="w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-brand-purple flex items-center justify-center mb-3">
            <Play className="w-6 h-6 ml-0.5 fill-current" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            No Video Linked to this Topic Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mb-4">
            You can put any YouTube SPM Chemistry tutorial, teacher lecture, or video link here to watch side-by-side with your revision notes.
          </p>
          <button
            onClick={() => {
              setIsEditing(true);
              setInputUrl('');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer hover:-translate-y-0.5"
          >
            <Link2 className="w-4 h-4" />
            Put Video Link Now
          </button>
        </div>
      )}
    </section>
  );
}
