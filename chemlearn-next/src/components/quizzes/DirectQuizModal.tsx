'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useQuizStore } from '@/stores/useQuizStore';
import { CheckCircle, XCircle } from 'lucide-react';
import { MCQQuestion, StructuredQuestion } from '@/types/quiz';
import { useGamificationStore } from '@/stores/useGamificationStore';

export default function DirectQuizModal() {
  const { 
    directModalOpen, closeDirectModal, 
    aiQuestions, aiScore, incrementAIScore, 
    incrementAIAnswered, resetAIQuiz
  } = useQuizStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [structuredAns, setStructuredAns] = useState('');

  if (!aiQuestions || aiQuestions.length === 0) return null;

  const q = aiQuestions[currentIndex];
  const isFinished = currentIndex >= aiQuestions.length;

  const handleNext = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= aiQuestions.length) {
      // Award COMPLETE_QUIZ XP
      import('@/lib/firebase').then(async ({ auth }) => {
        const uid = auth.currentUser?.uid;
        if (uid) {
          useGamificationStore.getState().syncWithFirebase(uid, 'COMPLETE_QUIZ');
        } else {
          useGamificationStore.getState().addXP(15, 'Completed Quiz', 'COMPLETE_QUIZ');
        }
      });
    }
    setCurrentIndex(nextIdx);
    setSelectedOption(null);
    setShowExplanation(false);
    setStructuredAns('');
  };

  const handleOptionClick = (idx: number, isCorrect: boolean) => {
    if (showExplanation) return; // Prevent multiple clicks
    setSelectedOption(idx);
    setShowExplanation(true);
    incrementAIAnswered();
    if (isCorrect) incrementAIScore();
  };

  const handleSelfGrade = (isCorrect: boolean) => {
    if (showExplanation) return;
    setShowExplanation(true);
    incrementAIAnswered();
    if (isCorrect) incrementAIScore();
  };

  if (isFinished) {
    return (
      <Modal isOpen={directModalOpen} onClose={closeDirectModal} title="Quiz Completed">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-24 h-24 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-bold">{Math.round((aiScore / aiQuestions.length) * 100)}%</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Finished!</h2>
          <p className="text-slate-600 mb-8">You scored {aiScore} out of {aiQuestions.length} correct.</p>
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => {
                setCurrentIndex(0);
                setSelectedOption(null);
                setShowExplanation(false);
                setStructuredAns('');
                useQuizStore.setState({ aiScore: 0, aiAnswered: 0 });
              }}
              className="flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={closeDirectModal}
              className="flex-1 py-3 bg-brand-purple text-white hover:bg-brand-purple/90 rounded-xl font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={directModalOpen} onClose={closeDirectModal} title={`Question ${currentIndex + 1} of ${aiQuestions.length}`}>
      <div className="flex flex-col gap-6">
        <div className="text-lg font-semibold text-slate-800">
          {q.question}
        </div>

        {q.type === 'MCQ' ? (
          <div className="flex flex-col gap-3">
            {(q as MCQQuestion).options.map((opt, idx) => {
              const isCorrect = idx === (q as MCQQuestion).correctIndex;
              let btnClass = "text-left p-4 rounded-xl border-2 transition-all ";
              
              if (!showExplanation) {
                btnClass += "border-slate-200 hover:border-brand-purple bg-white text-slate-700";
              } else {
                if (isCorrect) {
                  btnClass += "border-green-500 bg-green-50 text-green-800";
                } else if (idx === selectedOption) {
                  btnClass += "border-red-500 bg-red-50 text-red-800";
                } else {
                  btnClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-50";
                }
              }

              return (
                <button 
                  key={idx}
                  onClick={() => handleOptionClick(idx, isCorrect)}
                  disabled={showExplanation}
                  className={btnClass}
                >
                  <div className="flex justify-between items-center">
                    <span>{opt}</span>
                    {showExplanation && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {showExplanation && !isCorrect && idx === selectedOption && <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <textarea 
              value={structuredAns}
              onChange={(e) => setStructuredAns(e.target.value)}
              disabled={showExplanation}
              placeholder="Type your answer here..."
              className="w-full p-4 rounded-xl border border-slate-200 min-h-[120px] focus:outline-none focus:border-brand-purple"
            />
            {!showExplanation ? (
              <button 
                onClick={() => setShowExplanation(true)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
              >
                Reveal Answer
              </button>
            ) : (
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleSelfGrade(true)} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold">I was correct</button>
                <button onClick={() => handleSelfGrade(false)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">I was wrong</button>
              </div>
            )}
          </div>
        )}

        {showExplanation && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 text-sm">
            <span className="font-bold block mb-1">Explanation / Expected Answer:</span>
            {q.type === 'MCQ' ? (q as MCQQuestion).explanation : (q as StructuredQuestion).expectedAnswer}
          </div>
        )}

        {showExplanation && (
          <button 
            onClick={handleNext}
            className="w-full mt-4 py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-violet transition-colors"
          >
            {currentIndex === aiQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </Modal>
  );
}
