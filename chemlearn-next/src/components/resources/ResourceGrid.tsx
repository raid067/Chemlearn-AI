'use client';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';

const RESOURCES = [
  { title: 'Chapter 8 Mind Map', type: 'PDF', icon: <FileText />, url: '#' },
  { title: 'Periodic Table (HD)', type: 'Image', icon: <ImageIcon />, url: '#' },
  { title: 'Alloys Composition Table', type: 'PDF', icon: <FileText />, url: '#' },
  { title: 'Common Cations & Anions', type: 'PDF', icon: <FileText />, url: '#' }
];

export default function ResourceGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {RESOURCES.map((res, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col group">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 mb-4">
            {res.icon}
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{res.title}</h3>
          <span className="text-sm font-medium text-slate-500 mb-6">{res.type} Format</span>
          
          <a 
            href={res.url} 
            className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-brand-purple/20 text-brand-purple font-bold hover:bg-brand-purple hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" /> Download
          </a>
        </div>
      ))}
    </div>
  );
}
