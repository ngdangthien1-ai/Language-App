import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Volume2, 
  Flame,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { QuizResult, VocabWord } from '../../types/vocab';
import { audioService } from '../../services/audio';

interface QuizSummaryProps {
  result: QuizResult;
  onRestart: () => void;
  onClose: () => void;
  onReviewMissed?: (words: VocabWord[]) => void;
}

export const QuizSummary: React.FC<QuizSummaryProps> = ({
  result,
  onRestart,
  onClose,
  onReviewMissed,
}) => {
  const percentage = Math.round((result.correct / (result.total || 1)) * 100);

  useEffect(() => {
    // Fire confetti if scored 70% or above
    if (percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [percentage]);

  const handlePlayWord = (word: VocabWord) => {
    audioService.speak(word.word, word.language);
  };

  return (
    <div className="max-w-xl mx-auto w-full space-y-6 text-center animate-fade-in">
      
      {/* Trophy Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Trophy Icon with glowing ring */}
        <div className="relative inline-block">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 animate-bounce">
            <Trophy className="w-12 h-12" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-amber-400 animate-spin" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {percentage === 100
              ? 'Xuất Sắc! Hoàn Hảo! 🌟'
              : percentage >= 80
              ? 'Rất Tuyệt Vời! 🎉'
              : percentage >= 50
              ? 'Khá Tốt! Cố Lên! 💪'
              : 'Hãy Tiếp Tục Ôn Luyện Nhé! 📚'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bạn đã hoàn thành bài kiểm tra từ vựng
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Chính xác</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {percentage}%
            </p>
          </div>

          <div className="space-y-1 border-x border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Đúng / Tổng</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {result.correct}/{result.total}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Thời gian</span>
            <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {result.timeSpentSeconds}s
            </p>
          </div>
        </div>

        {/* List of Missed Words to review */}
        {result.incorrectWords && result.incorrectWords.length > 0 && (
          <div className="text-left space-y-3 pt-2">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center">
              <XCircle className="w-4 h-4 mr-1.5" />
              Các từ cần ôn lại ({result.incorrectWords.length}):
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {result.incorrectWords.map((word) => (
                <div 
                  key={word.id} 
                  className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white">{word.word}</span>
                      <span className="text-slate-400">({word.phonetic})</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      {word.posEntries[0]?.meaningVi}
                    </p>
                  </div>

                  <button
                    onClick={() => handlePlayWord(word)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          
          <button
            onClick={onRestart}
            className="w-full sm:flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Luyện tập lại</span>
          </button>

          {result.incorrectWords.length > 0 && onReviewMissed && (
            <button
              onClick={() => onReviewMissed(result.incorrectWords)}
              className="w-full sm:flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-500/25 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Chỉ ôn từ sai ({result.incorrectWords.length})</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Trở về sổ tay</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>

    </div>
  );
};
