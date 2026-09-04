'use client';
import { Play, FileText, Image as ImageIcon } from 'lucide-react';

const LESSONS = [
  { title: "Alloys Beat", topic: "8.1 Alloys", type: "video", url: "song8.1.mp4" },
  { title: "Importance of Alloys", topic: "8.1 Alloys", type: "video", url: "8.1.1.mp4" },
  { title: "Sains di Sebalik Aloi", topic: "8.1 Alloys", type: "video", url: "8.1.2.mp4" },
  { title: "The Amazing World of Glass", topic: "8.2 Glass", type: "video", url: "song8.2.mov" },
  { title: "Understanding Glass Materials", topic: "8.2 Glass", type: "video", url: "8.2.1.mp4" },
  { title: "Bahan Buatan Dalam Industri (Kaca)", topic: "8.2 Glass", type: "video", url: "8.2.2.mp4" },
  { title: "Ceramics Learning Tune", topic: "8.3 Ceramics", type: "video", url: "song8.3.mp4" },
  { title: "Composition Ceramics and Its Uses", topic: "8.3 Ceramics", type: "video", url: "8.3.1.mp4" },
  { title: "Bahan Buatan Dalam Industri (Seramik)", topic: "8.3 Ceramics", type: "video", url: "8.3.2.mp4" },
  { title: "Matrix & The Fiber", topic: "8.4 Composites", type: "video", url: "song8.4.mp4" },
  { title: "Composite Materials & Its Importance", topic: "8.4 Composites", type: "video", url: "8.4.1.mp4" },
  { title: "Bahan Buatan Dalam Industri (Bahan Komposit)", topic: "8.4 Composites", type: "video", url: "8.4.2.mp4" }
];

export default function LessonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {LESSONS.map((lesson, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col group cursor-pointer hover:border-brand-purple/50 transition-colors">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 mb-4 group-hover:bg-brand-purple group-hover:text-white transition-colors">
            {lesson.type === 'video' ? <Play /> : lesson.type === 'pdf' ? <FileText /> : <ImageIcon />}
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-brand-purple">{lesson.title}</h3>
          <span className="text-sm font-medium text-brand-purple/70 mb-4">{lesson.topic}</span>
          
          <div className="mt-auto text-sm font-semibold text-slate-400 group-hover:text-brand-purple flex items-center gap-1">
            View Lesson <Play className="w-3 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
