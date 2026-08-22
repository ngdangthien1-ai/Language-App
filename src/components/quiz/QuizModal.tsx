import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Layers, 
  CheckSquare, 
  Headphones, 
  FileEdit,
  GraduationCap
} from 'lucide-react';
import { VocabWord, QuizMode, QuizResult } from '../../types/vocab';
import { FlashcardMode } from './FlashcardMode';
import { MultipleChoiceMode } from './MultipleChoiceMode';
import { ListeningMode } from './ListeningMode';
import { FillBlankMode } from './FillBlankMode';
import { QuizSummary } from './QuizSummary';

interface QuizModalProps {
  title?: string;
  words: VocabWord[];
  onClose: () => void;
  onSetMastery?: (id: string, mastery: VocabWord['mastery']) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  title = 'Ôn Luyện Từ Vựng',
  words,
  onClose,
  onSetMastery,
}) => {
  const [activeMode, setActiveMode] = useState<QuizMode>('flashcard');
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [currentDeck, setCurrentDeck] = useState<VocabWord[]>(words);

  const handleFinishQuiz = (result: QuizResult) => {
    setQuizResult(result);
  };

  const handleRestart = () => {
    setQuizResult(null);
    setCurrentDeck(words);
  };

  const handleReviewMissed = (missed: VocabWord[]) => {
    setCurrentDeck(missed);
    setQuizResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-50 dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 my-6 p-4 sm:p-7 overflow-hidden">
        
        {/* Modal Top Nav */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {currentDeck.length} từ vựng trong bộ đề
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

        </div>

        {/* Mode Selector Tabs (If not in summary mode) */}
        {!quizResult && (
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm overflow-x-auto">
            
            <button
              onClick={() => {
                setActiveMode('flashcard');
                setQuizResult(null);
              }}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeMode === 'flashcard'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-brand-600'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Flashcard 3D</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('multiple_choice');
                setQuizResult(null);
              }}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeMode === 'multiple_choice'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Trắc nghiệm 4 đáp án</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('listening');
                setQuizResult(null);
              }}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeMode === 'listening'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>Luyện nghe</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('fill_blank');
                setQuizResult(null);
              }}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeMode === 'fill_blank'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              <span>Điền từ câu ví dụ</span>
            </button>

          </div>
        )}

        {/* Render Modes */}
        <div>
          {quizResult ? (
            <QuizSummary
              result={quizResult}
              onRestart={handleRestart}
              onClose={onClose}
              onReviewMissed={handleReviewMissed}
            />
          ) : activeMode === 'flashcard' ? (
            <FlashcardMode
              words={currentDeck}
              onComplete={() => {
                setQuizResult({
                  total: currentDeck.length,
                  correct: currentDeck.length,
                  incorrectWords: [],
                  timeSpentSeconds: 45,
                  date: new Date().toISOString().split('T')[0],
                });
              }}
              onSetMastery={onSetMastery}
            />
          ) : activeMode === 'multiple_choice' ? (
            <MultipleChoiceMode
              words={currentDeck}
              onFinish={handleFinishQuiz}
            />
          ) : activeMode === 'listening' ? (
            <ListeningMode
              words={currentDeck}
              onFinish={handleFinishQuiz}
            />
          ) : (
            <FillBlankMode
              words={currentDeck}
              onFinish={handleFinishQuiz}
            />
          )}
        </div>

      </div>
    </div>
  );
};
