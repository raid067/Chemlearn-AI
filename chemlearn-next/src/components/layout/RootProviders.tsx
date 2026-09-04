'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import AuthModal from './AuthModal';
import MobileDrawer from './MobileDrawer';
import ToastContainer from '../ui/ToastContainer';

export default function RootProviders({ children }: { children: React.ReactNode }) {
  const init = useAuthStore(s => s.init);
  
  useEffect(() => {
    const unsubscribe = init();
    return () => unsubscribe();
  }, [init]);

  return (
    <>
      {children}
      <AuthModal />
      <MobileDrawer />
      <ToastContainer />
    </>
  );
}
