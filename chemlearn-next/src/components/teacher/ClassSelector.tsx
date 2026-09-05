'use client';
import { useState, useEffect } from 'react';
import { Users, Plus, Loader2, Copy, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTeacherStore, ClassData } from '@/stores/useTeacherStore';
import { collection, query, where, onSnapshot, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import Modal from '@/components/ui/Modal';

export default function ClassSelector() {
  const { user } = useAuthStore();
  const { classes, selectedClassId, setClasses, setSelectedClassId } = useTeacherStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore(app);
    const q = query(collection(db, 'classes'), where('teacherId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const clsData: ClassData[] = [];
      snap.forEach(doc => {
        clsData.push({ id: doc.id, ...doc.data() } as ClassData);
      });
      setClasses(clsData);
      
      if (clsData.length > 0 && !useTeacherStore.getState().selectedClassId) {
        useTeacherStore.getState().setSelectedClassId(clsData[0].id);
      }
    }, (err) => {
      console.warn("[ClassSelector] Real-time classes listener error:", err.message);
    });
    return () => unsub();
  }, [user, setClasses]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/classes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ className: newClassName })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create class');
      
      setSelectedClassId(data.classId);
      setIsModalOpen(false);
      setNewClassName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const copyCode = () => {
    if (selectedClass) {
      navigator.clipboard.writeText(selectedClass.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      {selectedClass && (
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invite Code:</span>
          <span className="font-mono font-bold text-brand-purple">{selectedClass.inviteCode}</span>
          <button 
            onClick={copyCode}
            aria-label="Copy invite code"
            className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        <div className="w-10 h-10 bg-brand-purple/10 text-brand-purple rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        
        {classes.length > 0 ? (
          <select 
            value={selectedClassId || ''}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-none pr-4 cursor-pointer"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        ) : (
          <span className="px-3 text-slate-500 text-sm font-medium">No classes yet</span>
        )}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          aria-label="Create new class"
          className="ml-2 p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Class">
        <form onSubmit={handleCreateClass} className="flex flex-col gap-4 mt-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Class Name</label>
            <input 
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Form 5 Beta (2024)"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex justify-center items-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Class'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
