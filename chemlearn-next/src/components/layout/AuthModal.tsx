'use client';
import { useState } from 'react';
import Modal from '../ui/Modal';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AuthModal() {
  const { activeModal, closeModal, authMode, setAuthMode } = useUIStore();
  const { signIn, signUp, loading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (authMode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
      closeModal();
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <Modal isOpen={activeModal === 'auth'} onClose={closeModal} title={authMode === 'signin' ? 'Sign In' : 'Create Account'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}
        
        {authMode === 'signup' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
              required 
            />
          </div>
        )}
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
            required 
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
            required 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 bg-brand-purple text-white py-2 rounded-lg font-medium hover:bg-brand-purple/90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
        
        <div className="text-center text-sm text-slate-500 mt-2">
          {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            className="text-brand-purple hover:underline font-medium"
          >
            {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
