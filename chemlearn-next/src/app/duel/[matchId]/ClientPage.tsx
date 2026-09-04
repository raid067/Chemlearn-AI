'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { subscribeToMatch, updateScore, finishMatch, DuelState } from '@/lib/firebase/duel';

import { Loader2, Swords, Trophy, XCircle, CheckCircle2 } from 'lucide-react';

export default function DuelArenaPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const { user, initialized } = useAuthStore();
  
  const [match, setMatch] = useState<DuelState | null>(null);
  const [loading, setLoading] = useState(true);
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);

  useEffect(() => {
    if (initialized && !user) router.push('/');
  }, [user, initialized, router]);

  useEffect(() => {
    if (!matchId) return;
    const unsub = subscribeToMatch(matchId, (data) => {
      setMatch(data);
      setLoading(false);
    });
    return () => unsub();
  }, [matchId]);

  if (loading || !user || !match) return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
    </div>
  );

  const isPlayer1 = match.player1.uid === user.uid;
  const me = isPlayer1 ? match.player1 : match.player2;
  const opponent = isPlayer1 ? match.player2 : match.player1;

  const currentQ = match.questions[qIndex];
  const isFinished = match.status === 'finished' || me?.finished;

  const handleAnswer = async (optIndex: number) => {
    if (answered !== null || isFinished || !me) return;
    setAnswered(optIndex);

    const isCorrect = optIndex === currentQ.ans;
    if (isCorrect) {
      await updateScore(match.matchId, user.uid, me.score + 10);
    }

    setTimeout(async () => {
      setAnswered(null);
      if (qIndex + 1 < match.questions.length) {
        setQIndex(prev => prev + 1);
      } else {
        await finishMatch(match.matchId, user.uid);
        // Award XP when finishing
        if (isCorrect) {
          await useGamificationStore.getState().syncWithFirebase(user.uid, 'WIN_DUEL');
        }
      }
    }, 1000);
  };

  const winner = match.status === 'finished' 
    ? (match.player1.score > (match.player2?.score || 0) ? match.player1 : ((match.player2?.score || 0) > match.player1.score ? match.player2 : null))
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header scoreboard */}
      <header className="bg-white border-b border-slate-200 p-4 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md ${isPlayer1 ? 'bg-brand-purple' : 'bg-orange-500'}`}>
              ME
            </div>
            <div>
              <div className="font-bold text-slate-800">{me?.displayName}</div>
              <div className="text-xl font-black text-brand-purple">{me?.score} pts</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <Swords className="w-8 h-8 text-slate-300" />
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">vs</span>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="font-bold text-slate-800">{opponent?.displayName || 'Waiting...'}</div>
              <div className="text-xl font-black text-orange-500">{opponent?.score || 0} pts</div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md ${!isPlayer1 ? 'bg-brand-purple' : 'bg-orange-500'}`}>
              OPP
            </div>
          </div>
        </div>
      </header>

      {/* Main Arena */}
      <main className="flex-1 container mx-auto max-w-3xl p-4 py-8 flex flex-col">
        {match.status === 'finished' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center animate-in zoom-in duration-500">
            <Trophy className={`w-24 h-24 mx-auto mb-6 ${winner?.uid === user.uid ? 'text-yellow-400' : 'text-slate-300'}`} />
            <h2 className="text-4xl font-black text-slate-800 mb-2">
              {winner ? (winner.uid === user.uid ? 'YOU WON!' : 'DEFEAT') : 'DRAW!'}
            </h2>
            <p className="text-slate-500 text-lg mb-8">
              Final Score: {me?.score} - {opponent?.score}
            </p>
            <button onClick={() => router.push('/dashboard')} className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">
              Return to Dashboard
            </button>
          </div>
        ) : me?.finished ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center">
            <Loader2 className="w-16 h-16 text-brand-purple animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Waiting for {opponent?.displayName}...</h2>
            <p className="text-slate-500">You finished! Let's see how they do.</p>
          </div>
        ) : (
          currentQ && (
            <div className="flex flex-col gap-6 h-full justify-center">
              <div className="text-center mb-4">
                <span className="px-4 py-1.5 bg-brand-purple/10 text-brand-purple font-bold rounded-full text-sm">
                  Question {qIndex + 1} of {match.questions.length}
                </span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8">
                {currentQ.q}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options.map((opt: string, i: number) => {
                  let stateStyle = 'bg-white border-slate-200 hover:border-brand-purple hover:shadow-md text-slate-700';
                  let icon = null;
                  
                  if (answered !== null) {
                    if (i === currentQ.ans) {
                      stateStyle = 'bg-green-50 border-green-500 text-green-700 font-bold';
                      icon = <CheckCircle2 className="w-6 h-6 text-green-500" />;
                    } else if (i === answered) {
                      stateStyle = 'bg-red-50 border-red-500 text-red-700';
                      icon = <XCircle className="w-6 h-6 text-red-500" />;
                    } else {
                      stateStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={answered !== null}
                      className={`relative p-6 text-left rounded-2xl border-2 transition-all duration-300 text-lg flex items-center justify-between ${stateStyle}`}
                    >
                      <span>{opt}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
