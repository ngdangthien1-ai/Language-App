import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Headphones,
  Sparkles
} from 'lucide-react';
import { VocabWord, QuizResult } from '../../types/vocab';
import { audioService } from '../../services/audio';

interface ListeningModeProps {
  words: VocabWord[];
  onFinish: (result: QuizResult) => void;
}

export const ListeningMode: React.FC<ListeningModeProps> = ({
  words,
  onFinish,
}) => {
  const [deck, setDeck] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [missedWords, setMissedWords] = useState<VocabWord[]>([]);
  const [startTime] = useState(Date.now());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    setDeck(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setMissedWords([]);
  }, [words]);

  const currentWord = deck[currentIndex];

  useEffect(() => {
    if (!currentWord) return;
    setSelectedOption(null);
    setIsAnswered(false);

    // Generate 4 options for words
    const allWords = words.map(w => w.word);
    const otherWords = allWords.filter(w => w !== currentWord.word);
    const distractors = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3);
    const generated = [currentWord.word, ...distractors].sort(() => 0.5 - Math.random());
    setOptions(generated);

    // Auto play audio
    handlePlayAudio(currentWord.word);
  }, [currentIndex, currentWord, words]);

  const handlePlayAudio = (text: string) => {
    if (!currentWord) return;
    setIsPlayingAudio(true);
    audioService.speak(text, currentWord.language, {
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSelect = (opt: string) => {
    if (isAnswered || !currentWord) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === currentWord.word) {
      setScore(prev => prev + 1);
    } else {
      setMissedWords(prev => [...prev, currentWord]);
    }
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      onFinish({
        total: deck.length,
        correct: score + (selectedOption === currentWord.word ? 1 : 0),
        incorrectWords: missedWords,
        timeSpentSeconds: totalTime,
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  if (!currentWord) return null;

  const currentPos = currentWord.posEntries[0];

  return (
    <div className="max-w-xl mx-auto w-full space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span className="flex items-center space-x-1">
          <Headphones className="w-3.5 h-3.5 text-indigo-500" />
          <span>Luyện nghe {currentIndex + 1} / {deck.length}</span>
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Điểm: {score}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border-2 border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 text-center">
        
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Nghe âm thanh và chọn từ chính xác
        </span>

        {/* Big Audio Play Button */}
        <div className="py-4">
          <button
            onClick={() => handlePlayAudio(currentWord.word)}
            className={`w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl flex flex-col items-center justify-center space-y-1 transition-all duration-300 transform active:scale-95 cursor-pointer ${
              isPlayingAudio
                ? 'bg-brand-600 text-white scale-105 shadow-xl shadow-brand-500/50 ring-4 ring-brand-300 animate-pulse'
                : 'bg-gradient-to-tr from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105'
            }`}
          >
            <Volume2 className="w-10 h-10" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isPlayingAudio ? 'Đang đọc...' : 'Nghe lại'}
            </span>
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentWord.word;

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
                onClick={() => handleSelect(opt)}
                disabled={isAnswered}
                className={`p-4 rounded-2xl border-2 text-base sm:text-lg font-bold flex items-center justify-between transition-all cursor-pointer ${
                  currentWord.language === 'zh' ? 'font-chinese' : ''
                } ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && (
                  <div>
                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : isSelected ? <XCircle className="w-5 h-5 text-rose-600" /> : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Revealed Details on Answer */}
        {isAnswered && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-3 text-left animate-slide-up">
            <div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                Phiên âm: {currentWord.phonetic} ({currentPos.posVi})
              </span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {currentPos.meaningVi}
              </p>
            </div>

            {currentPos.examples[0] && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 flex items-start justify-between gap-2 text-xs">
                <div className="flex-1 space-y-1">
                  <p className={`text-slate-900 dark:text-slate-200 ${
                    currentWord.language === 'zh' 
                      ? 'text-base font-chinese font-bold tracking-wide' 
                      : 'font-semibold'
                  }`}>
                    {currentPos.examples[0].original}
                  </p>
                  {currentWord.language === 'zh' && currentPos.examples[0].pinyin && (
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
                  className="p-1 rounded text-slate-400 hover:text-indigo-600"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{currentIndex === deck.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
