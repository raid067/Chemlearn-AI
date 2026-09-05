'use client';
import { useState } from 'react';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { Trophy, ArrowRight, Loader2, Award } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useGamificationStore } from '@/stores/useGamificationStore';

export default function DailyChallenge() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; total: number; xpAwarded: number } | null>(null);

  const { 
    challengeStarted, challengeIndex, challengeComplete, 
    startChallenge, nextChallengeQuestion, completeChallenge 
  } = useDashboardStore();
  
  const [questions, setQuestions] = useState<any[]>([]);

  const handleStart = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai/challenge', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.questions && data.challengeId) {
        setChallengeId(data.challengeId);
        setQuestions(data.questions);
        startChallenge();
      }
    } catch (e) {
      console.error('Failed to load challenge:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (idx: number) => {
    const updatedAnswers = { ...answers, [challengeIndex]: idx };
    setAnswers(updatedAnswers);

    if (challengeIndex < questions.length - 1) {
      nextChallengeQuestion();
      return;
    }

    // Completed last question: submit for server-authoritative grading
    setSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (token && challengeId) {
        const res = await fetch('/api/challenges/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            challengeId,
            answers: updatedAnswers,
          })
        });

        if (res.ok) {
          const json = await res.json();
          const { score, total, xpAwarded, currentXp, currentLevel } = json.data;
          setResult({ score, total, xpAwarded });
          useGamificationStore.setState({
            xp: currentXp,
            level: currentLevel,
          });
        } else {
          setResult({ score: 0, total: questions.length, xpAwarded: 0 });
        }
      } else {
        // Fallback for unauthenticated guest
        setResult({ score: questions.length, total: questions.length, xpAwarded: 0 });
      }
      completeChallenge();
    } catch (err) {
      console.error('Challenge submission error:', err);
      completeChallenge();
    } finally {
      setSubmitting(false);
    }
  };

  if (challengeComplete) {
    return (
      <div className="bg-gradient-to-br from-brand-purple to-brand-violet rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-300" />
          <h2 className="text-xl font-bold">Challenge Complete!</h2>
        </div>
        <p className="text-white/90 bg-white/10 rounded-lg p-4 font-medium backdrop-blur-sm mb-4">
          You scored {result?.score ?? 0}/{result?.total ?? questions.length} on today's chemistry challenge.
        </p>
        {(result?.xpAwarded ?? 0) > 0 ? (
          <div className="flex items-center gap-2 text-sm text-yellow-300 font-bold mb-2">
            <Award className="w-4 h-4" />
            <span>+{result?.xpAwarded} Daily Bonus XP Awarded!</span>
          </div>
        ) : (
          <div className="text-sm text-white/80">Come back tomorrow for a new daily challenge!</div>
        )}
      </div>
    );
  }

  if (challengeStarted && questions.length > 0) {
    const q = questions[challengeIndex];
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-4">
          <span>Question {challengeIndex + 1} of {questions.length}</span>
          {submitting && (
            <span className="text-brand-purple flex items-center gap-1 font-bold">
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-6">{q.q}</h3>
        <div className="flex flex-col gap-3">
          {q.options.map((opt: string, i: number) => (
            <button 
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={submitting}
              className="text-left w-full p-4 rounded-xl border border-slate-200 hover:border-brand-purple hover:bg-brand-purple/5 transition-all font-medium text-slate-700 disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-brand-purple/10 rounded-lg">
          <Trophy className="w-6 h-6 text-brand-purple" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Daily AI Challenge</h2>
      </div>
      <p className="text-slate-500 text-sm mb-6 mt-2">
        Complete 5 quick questions generated by Gemini AI to earn bonus XP today.
      </p>
      <button 
        onClick={handleStart}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3 font-medium hover:bg-slate-800 transition-colors disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>Start Challenge <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  );
}
