'use client';
import { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { auth } from '@/lib/firebase';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';
import { marked } from 'marked';

export default function HomeworkChecker() {
  const user = useAuthStore(s => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
      setImageMime(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleGrade = async () => {
    if (!user) { setError('Sign in required'); return; }
    if (!imagePreview || !imageMime) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: imagePreview, imageMimeType: imageMime })
      });
      
      if (!res.ok) throw new Error('Grading failed');
      const data = await res.json();
      
      const parsedHtml = marked.parse(data.feedback, { async: false }) as string;
      setFeedback(sanitizeHtml(parsedHtml));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Homework Checker</h2>
          <p className="text-slate-500">Snap a photo of your written chemistry answer and get instant SPM-standard grading and feedback.</p>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>}

        {!imagePreview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-brand-purple transition-all group"
          >
            <Upload className="w-12 h-12 text-slate-400 group-hover:text-brand-purple mb-4 transition-colors" />
            <h3 className="font-bold text-slate-700 text-lg">Click to Upload Answer</h3>
            <p className="text-slate-500 text-sm mt-1">PNG, JPG, JPEG</p>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex justify-center">
              <img src={imagePreview} alt="Homework" className="max-h-96 object-contain" />
              <button 
                onClick={() => { setImagePreview(null); setFeedback(''); }}
                className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-black/70 backdrop-blur-sm"
              >
                Replace Image
              </button>
            </div>
            
            {!feedback ? (
              <button
                onClick={handleGrade}
                disabled={loading}
                className="w-full py-4 bg-brand-purple text-white rounded-xl font-bold text-lg hover:bg-brand-purple/90 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing Answer...</> : 'Grade My Answer'}
              </button>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="font-bold text-lg text-brand-purple mb-4">Teacher's Feedback</h3>
                <div 
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: feedback }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
