export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageData?: string;
  imageMimeType?: string;
  timestamp: Date;
}

export interface ChatHistoryEntry {
  question: string;
  answer: string;
  timestamp: Date;
}
