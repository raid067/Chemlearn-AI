import { create } from 'zustand';

interface Toast {
  id: string;
  title: string;
  description: string;
  icon: string;
}

type ModalType = 'auth' | 'share' | 'settings' | 'parent' | null;

interface UIState {
  activeModal: ModalType;
  authMode: 'signin' | 'signup';
  mobileMenuOpen: boolean;
  toasts: Toast[];
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  showToast: (title: string, description: string, icon?: string) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  authMode: 'signin',
  mobileMenuOpen: false,
  toasts: [],
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setAuthMode: (mode) => set({ authMode: mode }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  showToast: (title, description, icon = '✅') => {
    const id = `toast-${Date.now()}`;
    set((s) => ({ toasts: [...s.toasts, { id, title, description, icon }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
