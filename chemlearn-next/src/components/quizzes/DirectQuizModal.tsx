'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useQuizStore } from '@/stores/useQuizStore';
import { CheckCircle, XCircle, Loader2, Award } from 'lucide-react';
import { MCQQuestion } from '@/types/quiz';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { QuestionGradingResult, QuizGradingResponse } from '@/lib/server/quizzes';

export default function DirectQuizModal() {
  const { 
    directModalOpen, closeDirectModal, 
    aiQuestions, activeQuizId, resetAIQuiz
  } = useQuizStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [structuredAns, setStructuredAns] = useState('');
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState<QuizGradingResponse | null>(null);
  const [error, setError] = useState('');

  if (!aiQuestions || aiQuestions.length === 0) return null;

  const q = aiQuestions[currentIndex];
  const isFinished = gradingResult !== null;

  const handleOptionClick = (idx: number) => {
    setSelectedOption(idx);
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
  };

  const handleNext = async () => {
    const currentAnswer = q.type === 'MCQ' ? selectedOption : structuredAns;
    const updatedAnswers = { ...answers, [currentIndex]: currentAnswer ?? '' };
    setAnswers(updatedAnswers);

    const nextIdx = currentIndex + 1;
    if (nextIdx < aiQuestions.length) {
      setCurrentIndex(nextIdx);
      const prevAnswer = updatedAnswers[nextIdx];
      if (typeof prevAnswer === 'number') {
        setSelectedOption(prevAnswer);
      } else {
        setSelectedOption(null);
      }
      setStructuredAns(typeof prevAnswer === 'string' ? prevAnswer : '');
      return;
    }

    // Finished last question: submit for server-authoritative grading
    setSubmitting(true);
    setError('');

    try {
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken();

      if (!token || !activeQuizId) {
        // Fallback for unauthenticated/guest session: compute client estimate
        let estimatedScore = 0;
        const fallbackBreakdown: QuestionGradingResult[] = aiQuestions.map((ques, idx) => {
          const ans = updatedAnswers[idx];
          const hasAns = ans !== undefined && ans !== '';
          if (hasAns) estimatedScore++;
          return {
            questionIndex: idx,
            question: ques.question,
            selectedOption: ans ?? '',
            isCorrect: hasAns,
            explanation: 'Sign in to record official XP and verify your score on the leaderboard.',
          };
        });

        setGradingResult({
          quizId: activeQuizId || 'guest',
          score: estimatedScore,
          total: aiQuestions.length,
          percentage: Math.round((estimatedScore / aiQuestions.length) * 100),
          breakdown: fallbackBreakdown,
          xpAwarded: 0,
          currentXp: useGamificationStore.getState().xp,
          currentLevel: useGamificationStore.getState().level,
          levelUp: false,
        });
        return;
      }

      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quizId: activeQuizId,
          answers: updatedAnswers,
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Server rejected quiz submission');
      }

      const data = json.data as QuizGradingResponse;
      setGradingResult(data);

      // Sync state with server-awarded values
      useGamificationStore.setState({
        xp: data.currentXp,
        level: data.currentLevel,
        levelUpModalTrigger: data.levelUp,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setStructuredAns('');
    setAnswers({});
    setGradingResult(null);
    setError('');
  };

  const handleClose = () => {
    handleReset();
    resetAIQuiz();
    closeDirectModal();
  };

  if (isFinished && gradingResult) {
    return (
      <Modal isOpen={directModalOpen} onClose={handleClose} title="Official Quiz Results">
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="w-24 h-24 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl font-bold">{gradingResult.percentage}%</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Quiz Graded!</h2>
          <p className="text-slate-600 mb-4">
            Official Score: <strong>{gradingResult.score}</strong> / {gradingResult.total} correct
          </p>

          {gradingResult.xpAwarded > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-xl font-bold mb-6 border border-amber-200">
              <Award className="w-5 h-5 text-amber-500" />
              <span>+{gradingResult.xpAwarded} Verified XP Earned!</span>
            </div>
          )}

          {/* Itemized Answer Breakdown */}
          <div className="w-full text-left max-h-64 overflow-y-auto pr-1 flex flex-col gap-3 mb-6">
            {gradingResult.breakdown.map((item) => (
              <div 
                key={item.questionIndex} 
                className={`p-3 rounded-xl border text-sm ${item.isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}
              >
                <div className="flex items-start justify-between gap-2 font-semibold">
                  <span className="text-slate-800">{item.questionIndex + 1}. {item.question}</span>
                  {item.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 w-full">
            <button 
              onClick={handleReset}
              className="flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={handleClose}
              className="flex-1 py-3 bg-brand-purple text-white hover:bg-brand-purple/90 rounded-xl font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const isLastQuestion = currentIndex === aiQuestions.length - 1;
  const currentAnswerFilled = q.type === 'MCQ' ? selectedOption !== null : structuredAns.trim().length > 0;

  return (
    <Modal isOpen={directModalOpen} onClose={handleClose} title={`Question ${currentIndex + 1} of ${aiQuestions.length}`}>
      <div className="flex flex-col gap-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="text-lg font-semibold text-slate-800">
          {q.question}
        </div>

        {q.type === 'MCQ' ? (
          <div className="flex flex-col gap-3">
            {(q as MCQQuestion).options?.map((opt, idx) => {
              const isSelected = idx === selectedOption;
              let btnClass = "text-left p-4 rounded-xl border-2 transition-all ";
              if (isSelected) {
                btnClass += "border-brand-purple bg-brand-purple/5 text-brand-purple font-semibold";
              } else {
                btnClass += "border-slate-200 hover:border-brand-purple/50 bg-white text-slate-700";
              }

              return (
                <button 
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  className={btnClass}
                  type="button"
                >
                  <div className="flex justify-between items-center">
                    <span>{opt}</span>
                    {isSelected && <div className="w-3 h-3 rounded-full bg-brand-purple" />}
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
              placeholder="Type your chemical explanation or answer here..."
              className="w-full p-4 rounded-xl border border-slate-200 min-h-[120px] focus:outline-none focus:border-brand-purple"
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          {currentIndex > 0 && (
            <button
              onClick={() => {
                const prevIdx = currentIndex - 1;
                setCurrentIndex(prevIdx);
                const prevAns = answers[prevIdx];
                if (typeof prevAns === 'number') setSelectedOption(prevAns);
                else setSelectedOption(null);
                setStructuredAns(typeof prevAns === 'string' ? prevAns : '');
              }}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
            >
              Previous
            </button>
          )}

          <button 
            onClick={handleNext}
            disabled={!currentAnswerFilled || submitting}
            className="ml-auto px-6 py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-violet transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Grading...</>
            ) : (
              isLastQuestion ? 'Submit & Grade' : 'Next Question'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
