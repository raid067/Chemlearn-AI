'use client';
import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { auth } from '@/lib/firebase';
import { Sparkles, Loader2, Download, FileText } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';

export default function AINotesGenerator() {
  const { user } = useAuthStore();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesHtml, setNotesHtml] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to use this feature.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ topic })
      });
      
      if (!res.ok) throw new Error('Failed to generate notes');
      const data = await res.json();
      
      setNotesHtml(sanitizeHtml(data.notes));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Generate Smart Notes</h2>
          <p className="text-slate-500 text-sm mb-6">Enter a topic and let AI structure perfect SPM study notes for you.</p>
          
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
            
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Rate of Reaction"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate
            </button>
          </form>
        </div>
      </div>
      
      <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
        {notesHtml ? (
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-brand-purple">Generated Notes</h2>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-purple bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                <Download className="w-4 h-4" /> Save PDF
              </button>
            </div>
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(notesHtml) }}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p>Your notes will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
