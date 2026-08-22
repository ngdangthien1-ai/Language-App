import React, { useState } from 'react';
import { 
  Volume2, 
  BookmarkCheck, 
  X, 
  Sparkles, 
  Layers, 
  MessageSquareQuote, 
  Hash, 
  Check, 
  Share2, 
  Flame,
  Globe2,
  Tag
} from 'lucide-react';
import { VocabWord, Language, PartOfSpeechEntry } from '../../types/vocab';
import { audioService } from '../../services/audio';

interface WordPreviewCardProps {
  word: VocabWord | null;
  onSave: (word: VocabWord) => void;
  onClose: () => void;
  isAlreadySaved?: boolean;
}

export const WordPreviewCard: React.FC<WordPreviewCardProps> = ({
  word,
  onSave,
  onClose,
  isAlreadySaved = false,
}) => {
  if (!word) return null;

  const [activePosIndex, setActivePosIndex] = useState<number>(0);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [userNote, setUserNote] = useState<string>(word.userNotes || '');
  const [isSavedAnimation, setIsSavedAnimation] = useState(false);

  const activePos: PartOfSpeechEntry = word.posEntries[activePosIndex] || word.posEntries[0];

  const handlePlayWordAudio = (text: string, phoneticText?: string) => {
    setPlayingText(text);
    audioService.speak(text, word.language, {
      onEnd: () => setPlayingText(null),
      onError: () => setPlayingText(null),
    });
  };

  const handlePlaySentenceAudio = (sentence: string) => {
    setPlayingText(sentence);
    audioService.speak(sentence, word.language, {
      onEnd: () => setPlayingText(null),
      onError: () => setPlayingText(null),
    });
  };

  const handleSave = () => {
    const updated = {
      ...word,
      userNotes: userNote.trim() ? userNote.trim() : undefined,
    };
    setIsSavedAnimation(true);
    setTimeout(() => {
      onSave(updated);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 my-8 overflow-hidden transition-all">
        
        {/* Top Header Banner */}
        <div className={`p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800 ${
          word.language === 'zh'
            ? 'bg-gradient-to-r from-chinese-50 via-rose-50/50 to-white dark:from-chinese-950/40 dark:via-slate-900 dark:to-slate-900'
            : 'bg-gradient-to-r from-brand-50 via-blue-50/50 to-white dark:from-brand-950/40 dark:via-slate-900 dark:to-slate-900'
        }`}>
          
          <div className="flex items-start justify-between">
            <div>
              {/* Badges: Language & Level */}
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                  word.language === 'zh'
                    ? 'bg-chinese-100 text-chinese-700 dark:bg-chinese-900/60 dark:text-chinese-300'
                    : 'bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300'
                }`}>
                  <span>{word.language === 'zh' ? '🇨🇳 Tiếng Trung' : '🇬🇧 Tiếng Anh'}</span>
                </span>
                
                {word.level && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                    {word.level}
                  </span>
                )}

                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Phân tích bởi Gemini AI
                </span>
              </div>

              {/* Main Word Display */}
              <div className="flex items-baseline space-x-3">
                <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white ${
                  word.language === 'zh' ? 'font-chinese' : ''
                }`}>
                  {word.word}
                </h2>

                {word.hanziTraditional && word.hanziTraditional !== word.word && (
                  <span className="text-sm font-chinese text-slate-400 dark:text-slate-500">
                    (Phồn thể: {word.hanziTraditional})
                  </span>
                )}
              </div>

              {/* Phonetic & Audio */}
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-base font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/60 px-3 py-1 rounded-xl border border-brand-200/50 dark:border-brand-900/40">
                  {activePos?.phonetic || word.phonetic}
                </span>

                <button
                  onClick={() => handlePlayWordAudio(word.word)}
                  className={`p-2 rounded-xl transition-all ${
                    playingText === word.word
                      ? 'bg-brand-600 text-white scale-110 shadow-md shadow-brand-500/40'
                      : 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                  title="Nghe phát âm từ vựng"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

        </div>

        {/* Multi-POS Tabs Selector */}
        {word.posEntries.length > 1 && (
          <div className="px-6 pt-4 pb-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center mr-1">
                <Layers className="w-3.5 h-3.5 mr-1" />
                {word.posEntries.length} Loại từ:
              </span>
              {word.posEntries.map((pos, idx) => (
                <button
                  key={pos.id}
                  onClick={() => setActivePosIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activePosIndex === idx
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {pos.posVi} ({pos.pos})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* POS Details Body */}
        <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
          
          {/* Vietnamese Meaning Box */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
              <span>Nghĩa tiếng Việt</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-[10px]">
                {activePos.posVi}
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-emerald-100 leading-snug">
              {activePos.meaningVi}
            </p>
          </div>

          {/* Examples Section */}
          {activePos.examples && activePos.examples.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center mb-3">
                <MessageSquareQuote className="w-4 h-4 mr-1.5 text-indigo-500" />
                Câu ví dụ thực tế ({activePos.examples.length})
              </h4>
              
              <div className="space-y-3">
                {activePos.examples.map((eg, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        
                        {/* Original Sentence - Chữ Hán to rõ ràng */}
                        <p className={`text-slate-900 dark:text-slate-100 ${
                          word.language === 'zh' 
                            ? 'text-lg sm:text-xl font-chinese font-bold tracking-wide leading-relaxed' 
                            : 'text-sm sm:text-base font-semibold'
                        }`}>
                          {eg.original}
                        </p>

                        {/* Chinese pinyin for example - Nằm ngay dưới chữ Hán */}
                        {word.language === 'zh' && eg.pinyin && (
                          <p className="text-xs sm:text-sm text-brand-600 dark:text-brand-400 font-medium tracking-wide">
                            {eg.pinyin}
                          </p>
                        )}

                        {/* Vietnamese Translation - Nhỏ gọn, tinh tế */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                          {eg.translation}
                        </p>
                      </div>

                      {/* Audio Button for this example sentence */}
                      <button
                        onClick={() => handlePlaySentenceAudio(eg.original)}
                        className={`p-2 rounded-xl flex-shrink-0 transition-all ${
                          playingText === eg.original
                            ? 'bg-brand-600 text-white scale-110 shadow-md shadow-brand-500/30'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-700'
                        }`}
                        title="Nghe đọc câu ví dụ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collocations & Synonyms */}
          {((activePos.collocations && activePos.collocations.length > 0) || (activePos.synonyms && activePos.synonyms.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {activePos.collocations && activePos.collocations.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Cụm từ / Đi kèm
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePos.collocations.map((col, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 font-medium">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activePos.synonyms && activePos.synonyms.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Từ đồng nghĩa
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePos.synonyms.map((syn, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 font-medium">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Note Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Ghi chú thêm của bạn (tùy chọn)
            </label>
            <input
              type="text"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="VD: Cần lưu ý cách dùng trong văn viết..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all transform active:scale-95 cursor-pointer ${
              isSavedAnimation
                ? 'bg-emerald-600 shadow-emerald-500/40 scale-105'
                : word.language === 'zh'
                ? 'bg-gradient-to-r from-chinese-600 to-rose-600 hover:from-chinese-700 hover:to-rose-700 shadow-chinese-500/25'
                : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-brand-500/25'
            }`}
          >
            {isSavedAnimation ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>Đã lưu vào sổ tay!</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>{isAlreadySaved ? 'Cập nhật sổ tay' : 'Lưu vào Sổ tay hôm nay'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
