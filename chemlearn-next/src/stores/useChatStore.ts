import { create } from 'zustand';
import { ChatMessage } from '@/types/chat';

interface ChatState {
  messages: ChatMessage[];
  imageBase64: string | null;
  imageMimeType: string | null;
  isLoading: boolean;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  setImage: (base64: string, mimeType: string) => void;
  clearImage: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  imageBase64: null,
  imageMimeType: null,
  isLoading: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
  setImage: (base64, mimeType) => set({ imageBase64: base64, imageMimeType: mimeType }),
  clearImage: () => set({ imageBase64: null, imageMimeType: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
