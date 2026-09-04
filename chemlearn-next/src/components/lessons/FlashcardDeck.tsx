'use client';
import { useFlashcardStore } from '@/stores/useFlashcardStore';
import { useEffect, useState } from 'react';
import { RotateCcw, Check, X, Loader2, Sparkles } from 'lucide-react';

// Sample default deck
const DEFAULT_DECK = [
  { question: 'What is an alloy?', answer: 'A mixture of two or more elements, where the main element is a metal.', interval: 1, repetitions: 0, easeFactor: 2.5, nextReviewDate: 0 },
  { question: 'Why are alloys harder than pure metals?', answer: 'Different sized atoms disrupt the orderly arrangement, preventing layers from sliding over each other easily.', interval: 1, repetitions: 0, easeFactor: 2.5, nextReviewDate: 0 },
  { question: 'What are the main components of Bronze?', answer: 'Copper (90%) and Tin (10%)', interval: 1, repetitions: 0, easeFactor: 2.5, nextReviewDate: 0 }
];

export default function FlashcardDeck() {
  const { cards, setCards, currentIndex, isFlipped, flip, markCard } = useFlashcardStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cards.length === 0) {
      setCards(DEFAULT_DECK);
    }
  }, [cards, setCards]);

  const generateAIFlashcards = async () => {
    setLoading(true);
    // Fake generation for UI mock
    setTimeout(() => {
      setCards([
        { question: 'AI Question 1', answer: 'AI Answer 1', interval: 1, repetitions: 0, easeFactor: 2.5, nextReviewDate: 0 },
        { question: 'AI Question 2', answer: 'AI Answer 2', interval: 1, repetitions: 0, easeFactor: 2.5, nextReviewDate: 0 }
      ]);
      setLoading(false);
    }, 1500);
  };

  if (cards.length === 0) return null;

  const card = cards[currentIndex];

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto">
      <div className="flex justify-between w-full mb-4 items-center">
        <span className="text-sm font-bold text-slate-500">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <button 
          onClick={generateAIFlashcards}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-bold text-brand-purple bg-brand-purple/10 px-4 py-2 rounded-lg hover:bg-brand-purple/20 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          AI Generate More
        </button>
      </div>

      <div 
        onClick={() => !isFlipped && flip()}
        className={`w-full min-h-[300px] bg-white rounded-3xl shadow-md border border-slate-200 p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all transform perspective-1000 ${
          isFlipped ? 'border-brand-purple ring-4 ring-brand-purple/10' : 'hover:-translate-y-1 hover:shadow-lg'
        }`}
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {card.question}
        </h2>
        
        {isFlipped ? (
          <div className="animate-fade-in-up">
            <div className="w-full h-px bg-slate-100 my-6"></div>
            <p className="text-xl text-slate-600 font-medium">
              {card.answer}
            </p>
          </div>
        ) : (
          <div className="text-slate-400 font-medium mt-auto flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Click to flip
          </div>
        )}
      </div>

      {isFlipped && (
        <div className="flex gap-4 w-full mt-8 animate-fade-in-up">
          <button 
            onClick={() => markCard('learning')}
            className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 font-bold border border-red-200 transition-colors"
          >
            <X className="w-6 h-6" /> Need Review
          </button>
          <button 
            onClick={() => markCard('known')}
            className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 font-bold border border-green-200 transition-colors"
          >
            <Check className="w-6 h-6" /> Got It
          </button>
        </div>
      )}
    </div>
  );
}
