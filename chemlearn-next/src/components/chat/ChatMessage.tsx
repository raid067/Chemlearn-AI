'use client';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { marked } from 'marked';

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isBot = message.role === 'assistant';
  
  // Basic markdown parsing for bold text and line breaks
  const rawHtml = marked.parse(message.content, { async: false }) as string;
  const cleanHtml = sanitizeHtml(rawHtml);

  return (
    <div className={cn("flex gap-4", isBot ? "flex-row" : "flex-row-reverse")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isBot ? "bg-brand-purple/10 text-brand-purple" : "bg-slate-800 text-white"
      )}>
        {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-5 py-3",
        isBot 
          ? "bg-white border border-slate-100 shadow-sm text-slate-700" 
          : "bg-brand-purple text-white"
      )}>
        {message.imageData && (
          <img 
            src={message.imageData} 
            alt="Uploaded by user" 
            className="max-w-full rounded-lg mb-3 object-contain max-h-48"
          />
        )}
        <div 
          className={cn("prose prose-sm max-w-none", isBot ? "prose-slate" : "prose-invert")}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      </div>
    </div>
  );
}
