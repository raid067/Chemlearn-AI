'use client';
import { useLabStore } from '@/stores/useLabStore';
import { useChatStore } from '@/stores/useChatStore';
import { Bot, Info } from 'lucide-react';
import ChatInput from '../chat/ChatInput';
import ChatMessage from '../chat/ChatMessage';

export default function AILabAssistant() {
  const { activeLab, step } = useLabStore();
  const { messages } = useChatStore();

  return (
    <>
      <div className="p-4 border-b border-slate-200 bg-brand-purple/5">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-brand-purple" />
          <h3 className="font-bold text-slate-800">Lab Assistant</h3>
        </div>
        <p className="text-sm text-slate-600">
          I'm observing your {activeLab} experiment. Ask me anything!
        </p>
      </div>
      
      <div className="p-4 border-b border-slate-200">
        <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1">
          <Info className="w-3 h-3" /> Current Step {step + 1}
        </h4>
        <div className="text-sm font-medium text-slate-700">
          {step === 0 ? 'Select a compound from the shelf.' : 'Follow the safety procedures.'}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.filter(m => m.id !== 'initial').map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm mt-10">
            Ask the AI for hints or explanations during the lab.
          </div>
        )}
      </div>
      
      <div className="shrink-0 bg-white border-t border-slate-200">
        <ChatInput />
      </div>
    </>
  );
}
