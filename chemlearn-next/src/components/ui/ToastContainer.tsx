'use client';
import { useUIStore } from '@/stores/useUIStore';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ToastContainer() {
  const toasts = useUIStore(s => s.toasts);
  const removeToast = useUIStore(s => s.removeToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className="pointer-events-auto w-72 bg-white border border-slate-200 shadow-lg rounded-xl p-4 flex gap-3 transform transition-all duration-300 animate-in slide-in-from-right-8"
          role="status"
          aria-live="polite"
        >
          <div className="text-xl leading-none">{toast.icon}</div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">{toast.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{toast.description}</p>
          </div>
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors self-start"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
