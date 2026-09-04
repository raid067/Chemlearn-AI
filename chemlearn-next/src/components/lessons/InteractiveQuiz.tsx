'use client';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';


interface InteractiveQuizProps {
  question: string;
  options: string[];
  correctIndex: number;
  onPass?: () => void;
}

export function InteractiveQuiz({ question, options, correctIndex, onPass }: InteractiveQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);

  const handleSelect = (idx: number) => {
    if (passed) return; // locked
    setSelected(idx);
    if (idx === correctIndex) {
      setPassed(true);
      if (onPass) onPass();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 my-8">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Check</h3>
      <p className="text-slate-800 font-medium mb-6 text-lg">{question}</p>
      
      <div className="space-y-3">
        {options.map((option, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === correctIndex;
          
          let stateClasses = "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700";
          
          if (passed) {
            if (isCorrect) stateClasses = "bg-green-50 border-green-500 text-green-800 font-bold shadow-sm";
            else if (isSelected) stateClasses = "bg-red-50 border-red-300 text-red-500 opacity-50";
            else stateClasses = "bg-slate-50 border-slate-200 opacity-50";
          } else if (isSelected) {
            stateClasses = "bg-red-50 border-red-500 text-red-700 animate-shake";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={passed}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all flex justify-between items-center ${stateClasses}`}
            >
              <span>{option}</span>
              {passed && isCorrect && <CheckCircle className="text-green-500 w-6 h-6" />}
              {isSelected && !passed && <XCircle className="text-red-500 w-6 h-6" />}
            </button>
          );
        })}
      </div>
      
      {passed && (
        <div className="mt-6 text-center text-green-600 font-bold animate-fade-in">
          Excellent! You understand this concept.
        </div>
      )}
    </div>
  );
}
