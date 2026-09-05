'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useQuizStore } from '@/stores/useQuizStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { auth } from '@/lib/firebase';
import { Loader2, Sparkles } from 'lucide-react';

export default function AIQuizModal() {
  const { aiModalOpen, closeAIModal, setAIQuestions } = useQuizStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('8.1 Alloys');
  const [difficulty, setDifficulty] = useState('Medium');
  const [type, setType] = useState('MCQ');
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to generate AI quizzes');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, difficulty, type })
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      
      if (data.quizId) {
        useQuizStore.getState().setActiveQuizId(data.quizId);
      }
      setAIQuestions(data.questions);
      closeAIModal();
      useQuizStore.getState().openDirectModal();
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={aiModalOpen} onClose={closeAIModal} title="Generate AI Quiz">
      <form onSubmit={handleGenerate} className="flex flex-col gap-5">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Topic / Focus Area</label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Oxidation and Reduction"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Difficulty</label>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard (HOTS)</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white"
            >
              <option value="MCQ">Multiple Choice</option>
              <option value="Structured">Structured (Kertas 2)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-purple/20 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Magic Quiz</>
          )}
        </button>
      </form>
    </Modal>
  );
}
