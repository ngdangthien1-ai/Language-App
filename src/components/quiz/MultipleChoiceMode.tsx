import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  MessageSquareQuote
} from 'lucide-react';
import { VocabWord, QuizResult } from '../../types/vocab';
import { audioService } from '../../services/audio';

interface MultipleChoiceModeProps {
  words: VocabWord[];
  onFinish: (result: QuizResult) => void;
}

interface QuestionItem {
  word: VocabWord;
  correctAnswer: string;
  options: string[];
  type: 'word_to_meaning' | 'meaning_to_word';
}

export const MultipleChoiceMode: React.FC<MultipleChoiceModeProps> = ({
  words,
  onFinish,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [missedWords, setMissedWords] = useState<VocabWord[]>([]);
  const [startTime] = useState(Date.now());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Generate questions from words pool
  useEffect(() => {
    if (!words || words.length === 0) return;

    // All possible meanings pool for distractors
    const allMeanings = words.flatMap(w => w.posEntries.map(p => `${p.meaningVi} (${p.posVi})`));
    const allWordNames = words.map(w => w.word);

    const generated: QuestionItem[] = words.map((w, idx) => {
      const isWordToMeaning = idx % 2 === 0 || words.length < 4;
      const primaryPos = w.posEntries[0];
      const correctMeaning = `${primaryPos.meaningVi} (${primaryPos.posVi})`;

      if (isWordToMeaning) {
        // Distractors from other words
        const otherMeanings = allMeanings.filter(m => m !== correctMeaning);
        const shuffledOthers = [...otherMeanings].sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [correctMeaning, ...shuffledOthers].sort(() => 0.5 - Math.random());

        return {
          word: w,
          correctAnswer: correctMeaning,
          options,
          type: 'word_to_meaning',
        };
      } else {
        // Meaning to Word
        const otherWords = allWordNames.filter(name => name !== w.word);
        const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [w.word, ...shuffledOthers].sort(() => 0.5 - Math.random());

        return {
          word: w,
          correctAnswer: w.word,
          options,
          type: 'meaning_to_word',
        };
      }
    });

    // Shuffle questions
    setQuestions(generated.sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);
    setScore(0);
    setMissedWords([]);
  }, [words]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    
    // Auto-play audio when question opens
    if (currentQ) {
      handlePlayAudio(currentQ.word.word);
    }
  }, [currentIndex, currentQ]);

  const handlePlayAudio = (text: string) => {
    if (!currentQ) return;
    setIsPlayingAudio(true);
    audioService.speak(text, currentQ.word.language, {
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      setMissedWords(prev => [...prev, currentQ.word]);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished quiz
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      onFinish({
        total: questions.length,
        correct: score + (selectedOption === currentQ.correctAnswer ? 1 : 0),
        incorrectWords: missedWords,
        timeSpentSeconds: totalTime,
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  if (!currentQ) return null;

  const currentPos = currentQ.word.posEntries[0];

  return (
    <div className="max-w-xl mx-auto w-full space-y-6 animate-fade-in">
      
      {/* Quiz Progress Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Điểm: {score}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border-2 border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
        
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            currentQ.word.language === 'zh'
              ? 'bg-chinese-100 text-chinese-700 dark:bg-chinese-950 dark:text-chinese-300'
              : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
          }`}>
            {currentQ.word.language === 'zh' ? '🇨🇳 Tiếng Trung' : '🇬🇧 Tiếng Anh'}
          </span>

          <span className="text-xs font-medium text-slate-400">
            {currentQ.type === 'word_to_meaning' ? 'Chọn nghĩa tiếng Việt đúng' : 'Chọn từ vựng tương ứng'}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="text-center py-3 space-y-2">
          {currentQ.type === 'word_to_meaning' ? (
            <>
              <h2 className={`text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white ${
                currentQ.word.language === 'zh' ? 'font-chinese' : ''
              }`}>
                {currentQ.word.word}
              </h2>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {currentQ.word.phonetic}
                </span>
                <button
                  onClick={() => handlePlayAudio(currentQ.word.word)}
                  className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-400 uppercase">Nghĩa tiếng Việt:</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {currentPos.meaningVi}
              </h2>
              <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                Loại từ: {currentPos.posVi}
              </span>
            </>
          )}
        </div>

        {/* 4 Choices Grid */}
        <div className="grid grid-cols-1 gap-2.5 pt-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;
            
            let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700';

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-200 font-bold';
              } else {
                btnStyle = 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/40 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={`w-full p-3.5 rounded-2xl border-2 text-left text-sm sm:text-base font-semibold flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation Drawer (Appears after answer) */}
        {isAnswered && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-3 animate-slide-up">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Giải thích chi tiết & Câu ví dụ
              </span>

              <button
                onClick={() => handlePlayAudio(currentQ.word.word)}
                className="flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe từ ({currentQ.word.phonetic})</span>
              </button>
            </div>

            {/* Example with Audio in Quiz */}
            {currentPos.examples && currentPos.examples[0] && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 flex items-start justify-between gap-3 text-xs">
                <div className="flex-1 space-y-1">
                  <p className={`text-slate-900 dark:text-white ${
                    currentQ.word.language === 'zh' 
                      ? 'text-base font-chinese font-bold tracking-wide' 
                      : 'font-semibold'
                  }`}>
                    {currentPos.examples[0].original}
                  </p>
                  {currentQ.word.language === 'zh' && currentPos.examples[0].pinyin && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {currentPos.examples[0].pinyin}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentPos.examples[0].translation}
                  </p>
                </div>

                <button
                  onClick={() => handlePlayAudio(currentPos.examples[0].original)}
                  className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                  title="Nghe câu ví dụ"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={handleNextQuestion}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{currentIndex === questions.length - 1 ? 'Xem kết quả bài quiz' : 'Câu tiếp theo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

      </div>

    </div>
  );
};
