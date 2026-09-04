'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { useQuizStore } from '@/stores/useQuizStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Swords, Loader2, Play } from 'lucide-react';
import { createMatch, joinMatch, subscribeToMatch, DuelState } from '@/lib/firebase/duel';

import { auth } from '@/lib/firebase';

export default function DuelModal() {
  const router = useRouter();
  const { duelModalOpen, closeDuelModal } = useQuizStore();
  const { user } = useAuthStore();
  const [matchIdInput, setMatchIdInput] = useState('');
  const [matchState, setMatchState] = useState<DuelState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!matchState?.matchId) return;
    const unsub = subscribeToMatch(matchState.matchId, (data) => {
      setMatchState(data);
    });
    return () => unsub();
  }, [matchState?.matchId]);

  const handleCreate = async () => {
    if (!user) return setError('Must be logged in');
    setLoading(true);
    setError('');
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai/duel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: 'Random SPM Chemistry' })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate duel questions');
      }
      
      const { questions } = await res.json();
      
      if (!questions || questions.length === 0) {
        throw new Error('No questions generated');
      }

      const mId = await createMatch(user.uid, user.displayName || 'Player 1', questions);
      setMatchState({ matchId: mId } as DuelState); // Temporary state to trigger subscription
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) return setError('Must be logged in');
    if (matchIdInput.length !== 6) return setError('Invalid match ID');
    setLoading(true);
    setError('');
    try {
      await joinMatch(matchIdInput, user.uid, user.displayName || 'Player 2');
      setMatchState({ matchId: matchIdInput } as DuelState);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMatchState(null);
    setMatchIdInput('');
    closeDuelModal();
  };

  return (
    <Modal isOpen={duelModalOpen} onClose={handleClose} title="1v1 Real-Time Duel">
      <div className="flex flex-col gap-6 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-500 shadow-inner">
          <Swords className="w-10 h-10" />
        </div>

        {error && <div className="text-red-500 font-bold bg-red-50 p-2 rounded-lg">{error}</div>}

        {!matchState ? (
          <>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Host a Match</h3>
              <button 
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create New Match'}
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">or join existing</span></div>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Join a Match</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter 6-digit Match ID" 
                  value={matchIdInput}
                  onChange={(e) => setMatchIdInput(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-center font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button 
                  onClick={handleJoin}
                  disabled={loading}
                  className="px-6 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  Join
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="font-black text-2xl tracking-widest text-slate-800 mb-6">{matchState.matchId}</h3>
            
            <div className="flex justify-between items-center mb-8 relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
              
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-16 h-16 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white">
                  P1
                </div>
                <span className="font-bold text-slate-800">{matchState.player1?.displayName}</span>
                <span className="text-brand-purple font-black">{matchState.player1?.score || 0}</span>
              </div>
              
              <div className="z-10 bg-white px-3 py-1 rounded-full font-bold text-slate-400 text-sm">VS</div>

              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white ${matchState.player2 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400 animate-pulse'}`}>
                  {matchState.player2 ? 'P2' : '?'}
                </div>
                <span className="font-bold text-slate-800">{matchState.player2?.displayName || 'Waiting...'}</span>
                <span className="text-orange-500 font-black">{matchState.player2?.score || 0}</span>
              </div>
            </div>

            {matchState.status === 'waiting' && (
              <p className="text-slate-500 font-medium animate-pulse">Waiting for opponent to join...</p>
            )}

            {matchState.status === 'playing' && (
              <button 
                onClick={() => {
                  closeDuelModal();
                  router.push(`/duel/${matchState.matchId}`);
                }}
                className="w-full py-4 bg-green-500 text-white rounded-xl font-black text-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
              >
                <Play className="w-6 h-6 fill-current" /> ENTER ARENA
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
