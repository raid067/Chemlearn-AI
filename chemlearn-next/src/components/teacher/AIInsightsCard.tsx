'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { Bot, Loader2, FileLineChart } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';

export default function AIInsightsCard() {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ classSummary: "Avg Score: 65%, Weakest Topic: Qualitative Analysis" })
      });
      const data = await res.json();
      setInsights(data.insights);
    } catch (e) {
      console.error(e);
      setInsights("Failed to load insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 bg-brand-purple/5 flex items-center gap-3">
        <Bot className="w-6 h-6 text-brand-purple" />
        <h3 className="font-bold text-slate-800">AI Pedagogical Insights</h3>
      </div>
      
      <div className="p-6 flex-1 text-sm text-slate-600">
        {insights ? (
          <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: sanitizeHtml(insights.replace(/\n/g, '<br/>')) }} />
        ) : (
          <div className="text-center py-6">
            <FileLineChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>Generate AI analysis based on class performance.</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <button 
          onClick={generateInsights}
          disabled={loading}
          className="w-full py-2.5 bg-brand-purple text-white rounded-lg font-bold hover:bg-brand-purple/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          Generate Strategies
        </button>
      </div>
    </div>
  );
}
