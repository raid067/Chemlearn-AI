'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Modal from '../ui/Modal';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';

function formatAuthError(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Authentication failed. Please try again.';
  const code = (err as { code?: string }).code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please verify your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please Sign In instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access is temporarily blocked to protect your account. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please enable popups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request allowed at a time.';
    default: {
      const raw = (err as Error).message || '';
      return raw.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[^)]+\)\.?/i, '').trim() || 'Authentication failed. Please try again.';
    }
  }
}

export default function AuthModal() {
  const { activeModal, closeModal, authMode, setAuthMode } = useUIStore();
  const { signIn, signUp, signInWithGoogle, resetPassword, loading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const getTitle = () => {
    if (authMode === 'reset') return 'Reset Password';
    if (authMode === 'signup') return 'Create Account';
    return 'Sign In';
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address to receive reset instructions.');
      return;
    }
    try {
      await resetPassword(cleanEmail);
      setResetSent(true);
    } catch (err: unknown) {
      setError(formatAuthError(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    
    try {
      if (authMode === 'signin') {
        await signIn(cleanEmail, password);
      } else {
        await signUp(cleanEmail, password, displayName.trim());
      }
      closeModal();
      setEmail('');
      setPassword('');
      setDisplayName('');
      setShowPassword(false);
      setResetSent(false);
    } catch (err: unknown) {
      setError(formatAuthError(err));
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
      closeModal();
      setEmail('');
      setPassword('');
      setDisplayName('');
      setResetSent(false);
    } catch (err: unknown) {
      setError(formatAuthError(err));
    }
  };

  const handleModeChange = (mode: 'signin' | 'signup' | 'reset') => {
    setError('');
    setResetSent(false);
    setAuthMode(mode);
  };

  return (
    <Modal isOpen={activeModal === 'auth'} onClose={closeModal} title={getTitle()}>
      <div className="flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {authMode === 'reset' ? (
          resetSent ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
                ✓
              </div>
              <h3 className="font-semibold text-slate-800 text-base">Password Reset Email Sent</h3>
              <p className="text-sm text-slate-600 max-w-xs">
                We sent a password reset link to <strong className="text-slate-800">{email}</strong>. Check your inbox and spam folder.
              </p>
              <button
                type="button"
                onClick={() => handleModeChange('signin')}
                className="mt-2 text-sm text-brand-purple font-medium hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Enter the email address associated with your ChemLearn account and we will send you instructions to reset your password.
              </p>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@moe-dl.edu.my"
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-slate-900 placeholder:text-slate-400"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="mt-1 bg-brand-purple text-white py-2 rounded-lg font-medium hover:bg-brand-purple/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>

              <div className="text-center text-sm text-slate-500">
                Remember your password?{' '}
                <button 
                  type="button" 
                  onClick={() => handleModeChange('signin')}
                  className="text-brand-purple hover:underline font-medium"
                >
                  Sign In
                </button>
              </div>
            </form>
          )
        ) : (
          <>
            {/* Quick 1-Click Social Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">or with email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {authMode === 'signup' && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Nurul Izzah"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-slate-900 placeholder:text-slate-400"
                    required 
                  />
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-slate-900 placeholder:text-slate-400"
                  required 
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => handleModeChange('reset')}
                      className="text-xs text-brand-purple hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-slate-900 placeholder:text-slate-400"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="mt-2 bg-brand-purple text-white py-2 rounded-lg font-medium hover:bg-brand-purple/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
              
              <div className="text-center text-sm text-slate-500 mt-1">
                {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  onClick={() => handleModeChange(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-brand-purple hover:underline font-medium"
                >
                  {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
