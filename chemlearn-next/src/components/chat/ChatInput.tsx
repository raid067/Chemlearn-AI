'use client';
import { useState, useRef } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function ChatInput() {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addMessage, imageBase64, imageMimeType, setImage, clearImage, isLoading, setLoading } = useChatStore();
  const { user } = useAuthStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImage(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !imageBase64) || isLoading) return;
    
    // Require auth for AI requests
    if (!user) {
      addMessage({
        id: `sys-${Date.now()}`,
        role: 'assistant',
        content: 'Please sign in to ask questions.',
        timestamp: new Date()
      });
      return;
    }

    const currentText = text;
    const currentImg = imageBase64;
    const currentMime = imageMimeType;
    
    // Add user message
    addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentText,
      imageData: currentImg || undefined,
      imageMimeType: currentMime || undefined,
      timestamp: new Date()
    });

    setText('');
    clearImage();
    setLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: currentText,
          imageBase64: currentImg,
          imageMimeType: currentMime
        })
      });

      if (!res.ok) throw new Error('API error');
      
      const data = await res.json();
      
      addMessage({
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'Sorry, I encountered an error processing your request.',
        timestamp: new Date()
      });

    } catch (error) {
      console.error(error);
      addMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I am sorry, there was a network error. Please try again.',
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-100">
      {imageBase64 && (
        <div className="mb-3 relative inline-block">
          <img src={imageBase64} alt="Preview" className="h-20 rounded-lg border border-slate-200" />
          <button 
            aria-label="Remove image"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 hover:bg-slate-700"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSend} className="relative flex items-end gap-2">
        <button
          aria-label="Upload image"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-slate-400 hover:text-brand-purple hover:bg-brand-purple/5 rounded-xl transition-colors shrink-0"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
        />
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isLoading ? "AI is thinking..." : "Ask about SPM Chemistry..."}
          disabled={isLoading}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white transition-all disabled:opacity-50"
        />
        
        <button
          aria-label="Send message"
          type="submit"
          disabled={(!text.trim() && !imageBase64) || isLoading}
          className="p-3 bg-brand-purple text-white rounded-xl hover:bg-brand-purple/90 transition-colors disabled:opacity-50 disabled:bg-slate-300 shrink-0"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
