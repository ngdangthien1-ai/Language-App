import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  CheckCircle2, 
  Layers, 
  MessageSquareQuote,
  Sparkles
} from 'lucide-react';
import { VocabWord } from '../../types/vocab';
import { audioService } from '../../services/audio';

interface FlashcardModeProps {
  words: VocabWord[];
  onComplete: () => void;
  onSetMastery?: (id: string, mastery: VocabWord['mastery']) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  words,
  onComplete,
  onSetMastery,
}) => {
  const [deck, setDeck] = useState<VocabWord[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [playingAudioText, setPlayingAudioText] = useState<string | null>(null);

  const currentWord = deck[currentIndex];

  useEffect(() => {
    setDeck(words);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  // Auto-play pronunciation when moving to a new card if enabled
  useEffect(() => {
    if (currentWord && autoPlayAudio) {
      handlePlayAudio(currentWord.word);
    }
    setIsFlipped(false);
  }, [currentIndex, currentWord]);

  const handlePlayAudio = (text: string) => {
    if (!currentWord) return;
    setPlayingAudioText(text);
    audioService.speak(text, currentWord.language, {
      onEnd: () => setPlayingAudioText(null),
      onError: () => setPlayingAudioText(null),
    });
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!currentWord) return null;

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full space-y-6">
      
      {/* Progress & Card Counter */}
      <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>Thẻ {currentIndex + 1} / {deck.length}</span>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
              autoPlayAudio
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Tự đọc từ: {autoPlayAudio ? 'Bật' : 'Tắt'}</span>
          </button>

          <button
            onClick={handleShuffle}
            className="flex items-center space-x-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            title="Xáo trộn thứ tự thẻ"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Xáo trộn</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div 
        className="w-full h-[380px] sm:h-[420px] perspective-1000 cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          
          {/* FRONT SIDE */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 flex flex-col justify-between border-2 border-slate-200/80 dark:border-slate-700 shadow-xl">
            
            {/* Top info */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                currentWord.language === 'zh'
                  ? 'bg-chinese-100 text-chinese-700 dark:bg-chinese-950 dark:text-chinese-300'
                  : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
              }`}>
                {currentWord.language === 'zh' ? '🇨🇳 Tiếng Trung' : '🇬🇧 Tiếng Anh'}
              </span>

              {currentWord.level && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {currentWord.level}
                </span>
              )}
            </div>

            {/* Middle Word & Phonetics */}
            <div className="text-center space-y-4 my-auto">
              <h2 className={`text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight ${
                currentWord.language === 'zh' ? 'font-chinese' : ''
              }`}>
                {currentWord.word}
              </h2>

              <p className="text-xl font-semibold text-brand-600 dark:text-brand-400">
                {currentWord.phonetic}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio(currentWord.word);
                }}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all ${
                  playingAudioText === currentWord.word
                    ? 'bg-brand-600 text-white scale-105 shadow-md shadow-brand-500/30'
                    : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 border border-brand-200/60 dark:border-brand-900/50'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-xs font-bold">Nghe phát âm</span>
              </button>
            </div>

            {/* Bottom hint */}
            <div className="text-center text-xs font-semibold text-slate-400 flex items-center justify-center space-x-1">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm hoặc bấm vào thẻ để xem nghĩa & ví dụ</span>
            </div>

          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 sm:p-7 flex flex-col justify-between border-2 border-brand-300 dark:border-brand-800 shadow-xl overflow-y-auto">
            
            <div className="space-y-4">
              
              {/* Back header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3">
                <div>
                  <h3 className={`text-xl font-bold text-slate-900 dark:text-white ${
                    currentWord.language === 'zh' ? 'font-chinese' : ''
                  }`}>
                    {currentWord.word}
                  </h3>
                  <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                    {currentWord.phonetic}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio(currentWord.word);
                  }}
                  className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* All POS & Meanings & Examples */}
              <div className="space-y-3">
                {currentWord.posEntries.map((pos, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 text-left">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[10px]">
                        {pos.posVi} ({pos.pos})
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                      {pos.meaningVi}
                    </p>

                    {/* Example Sentence */}
                    {pos.examples && pos.examples[0] && (
                      <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 text-xs">
                        <div className="flex-1 space-y-1">
                          <p className={`text-slate-800 dark:text-slate-200 ${
                            currentWord.language === 'zh'
                              ? 'text-base font-chinese font-bold tracking-wide'
                              : 'font-semibold text-xs sm:text-sm'
                          }`}>
                            {pos.examples[0].original}
                          </p>
                          {currentWord.language === 'zh' && pos.examples[0].pinyin && (
                            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                              {pos.examples[0].pinyin}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {pos.examples[0].translation}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayAudio(pos.examples[0].original);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-brand-600"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom flip back hint */}
            <div className="pt-2 text-center text-xs font-semibold text-slate-400 flex items-center justify-center space-x-1">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm để lật lại mặt trước</span>
            </div>

          </div>

        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between w-full pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Thẻ trước</span>
        </button>

        {onSetMastery && (
          <button
            onClick={() => onSetMastery(currentWord.id, 'mastered')}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100"
            title="Đánh dấu đã thuộc từ này"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã thuộc</span>
          </button>
        )}

        <button
          onClick={handleNext}
          className="flex items-center space-x-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-brand-500/25 hover:from-brand-700 hover:to-indigo-700 cursor-pointer"
        >
          <span>{currentIndex === deck.length - 1 ? 'Hoàn thành' : 'Thẻ tiếp theo'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
