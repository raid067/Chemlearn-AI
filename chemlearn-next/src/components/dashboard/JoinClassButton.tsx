'use client';
import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { Users, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';

export default function JoinClassButton() {
  const user = useAuthStore(s => s.user);
  const showToast = useUIStore(s => s.showToast);
  
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim() })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join class');
      
      setIsOpen(false);
      setInviteCode('');
      showToast('Joined Class!', `Successfully joined ${data.className}`, '🎉');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition-colors border border-slate-200"
      >
        <Users className="w-5 h-5" />
        Join Class
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Join a Class">
        <form onSubmit={handleJoin} className="flex flex-col gap-4 mt-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Enter 6-Character Invite Code</label>
            <input 
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3"
              maxLength={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple font-mono uppercase tracking-widest text-center text-xl font-bold"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || inviteCode.length < 6}
            className="mt-2 w-full flex justify-center items-center gap-2 py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-purple/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join'}
          </button>
        </form>
      </Modal>
    </>
  );
}
