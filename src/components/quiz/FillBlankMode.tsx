import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  FileEdit,
  Sparkles 
} from 'lucide-react';
import { VocabWord, QuizResult } from '../../types/vocab';
import { audioService } from '../../services/audio';

interface FillBlankModeProps {
  words: VocabWord[];
  onFinish: (result: QuizResult) => void;
}

interface BlankQuestion {
  word: VocabWord;
  maskedSentence: string;
  originalSentence: string;
  pinyin?: string;
  translation: string;
  options: string[];
}

export const FillBlankMode: React.FC<FillBlankModeProps> = ({
  words,
  onFinish,
}) => {
  const [questions, setQuestions] = useState<BlankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [missedWords, setMissedWords] = useState<VocabWord[]>([]);
  const [startTime] = useState(Date.now());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const allWordNames = words.map(w => w.word);

    // Filter words that have examples
    const validWords = words.filter(w => w.posEntries.some(p => p.examples && p.examples.length > 0));
    const targetPool = validWords.length > 0 ? validWords : words;

    const generated: BlankQuestion[] = targetPool.map(w => {
      const pos = w.posEntries.find(p => p.examples && p.examples.length > 0) || w.posEntries[0];
      const example = pos.examples?.[0] || {
        original: `${w.word} is an important word.`,
        translation: `${w.word} là một từ quan trọng.`
      };

      // Mask the word in sentence (case-insensitive replace)
      const regex = new RegExp(`(${w.word}|${w.word.toLowerCase()})`, 'gi');
      const masked = example.original.replace(regex, '【 ______ 】');

      // 4 choices
      const otherWords = allWordNames.filter(name => name !== w.word);
      const distractors = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [w.word, ...distractors].sort(() => 0.5 - Math.random());

      return {
        word: w,
        maskedSentence: masked === example.original ? `【 ______ 】: ${example.original}` : masked,
        originalSentence: example.original,
        pinyin: example.pinyin,
        translation: example.translation,
        options,
      };
    });

    setQuestions(generated.sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);
    setScore(0);
    setMissedWords([]);
  }, [words]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
  }, [currentIndex, currentQ]);

  const handlePlayAudio = (text: string) => {
    if (!currentQ) return;
    setIsPlayingAudio(true);
    audioService.speak(text, currentQ.word.language, {
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSelect = (opt: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === currentQ.word.word) {
      setScore(prev => prev + 1);
    } else {
      setMissedWords(prev => [...prev, currentQ.word]);
    }

    // Play the complete sentence audio when answered
    handlePlayAudio(currentQ.originalSentence);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      onFinish({
        total: questions.length,
        correct: score + (selectedOption === currentQ.word.word ? 1 : 0),
        incorrectWords: missedWords,
        timeSpentSeconds: totalTime,
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  if (!currentQ) return null;

  return (
    <div className="max-w-xl mx-auto w-full space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span className="flex items-center space-x-1">
          <FileEdit className="w-3.5 h-3.5 text-brand-500" />
          <span>Điền từ vào câu {currentIndex + 1} / {questions.length}</span>
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Điểm: {score}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-brand-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border-2 border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">
          Chọn từ thích hợp để điền vào chỗ trống
        </span>

        {/* Masked Sentence Box */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-center space-y-2">
          <p className={`font-bold text-slate-900 dark:text-white leading-relaxed ${
            currentQ.word.language === 'zh' 
              ? 'text-xl sm:text-2xl font-chinese tracking-wide' 
              : 'text-lg sm:text-xl'
          }`}>
            {isAnswered ? currentQ.originalSentence : currentQ.maskedSentence}
          </p>

          {currentQ.word.language === 'zh' && currentQ.pinyin && isAnswered && (
            <p className="text-xs sm:text-sm text-brand-600 dark:text-brand-400 font-medium tracking-wide">
              {currentQ.pinyin}
            </p>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dịch: {currentQ.translation}
          </p>

          {isAnswered && (
            <button
              onClick={() => handlePlayAudio(currentQ.originalSentence)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-900"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe đọc toàn bộ câu</span>
            </button>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentQ.word.word;

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
                className={`p-3.5 rounded-2xl border-2 text-base font-bold flex items-center justify-between transition-all cursor-pointer ${
                  currentQ.word.language === 'zh' ? 'font-chinese' : ''
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

        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer animate-slide-up"
          >
            <span>{currentIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

      </div>

    </div>
  );
};
