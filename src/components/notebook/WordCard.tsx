import React, { useState } from 'react';
import { 
  Volume2, 
  Star, 
  Trash2, 
  Layers, 
  MessageSquareQuote, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { VocabWord, PartOfSpeechEntry } from '../../types/vocab';
import { audioService } from '../../services/audio';

interface WordCardProps {
  word: VocabWord;
  onToggleStar: (id: string) => void;
  onSetMastery: (id: string, mastery: VocabWord['mastery']) => void;
  onDelete: (id: string) => void;
  onEdit?: (word: VocabWord) => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  onToggleStar,
  onSetMastery,
  onDelete,
}) => {
  const [activePosIndex, setActivePosIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const activePos: PartOfSpeechEntry = word.posEntries[activePosIndex] || word.posEntries[0];

  const handlePlayAudio = (text: string) => {
    setIsPlayingAudio(text);
    audioService.speak(text, word.language, {
      onEnd: () => setIsPlayingAudio(null),
      onError: () => setIsPlayingAudio(null),
    });
  };

  const handleCopyWord = () => {
    const textToCopy = `${word.word} [${word.phonetic}] - ${word.posEntries.map(p => `${p.posVi}: ${p.meaningVi}`).join(' | ')}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      
      {/* Card Header */}
      <div className="p-4 sm:p-5 pb-3">
        
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex-1">
            
            {/* Badges row */}
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-2">
              <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                word.language === 'zh'
                  ? 'bg-chinese-100 text-chinese-700 dark:bg-chinese-950 dark:text-chinese-300'
                  : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
              }`}>
                {word.language === 'zh' ? '🇨🇳 Trung' : '🇬🇧 Anh'}
              </span>

              {word.level && (
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                  {word.level}
                </span>
              )}

              {/* Mastery Badge */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    const nextMastery = word.mastery === 'new' ? 'learning' : word.mastery === 'learning' ? 'mastered' : 'new';
                    onSetMastery(word.id, nextMastery);
                  }}
                  className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 transition-colors cursor-pointer ${
                    word.mastery === 'mastered'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : word.mastery === 'learning'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                  title="Bấm để đổi trạng thái thuộc từ"
                >
                  {word.mastery === 'mastered' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Đã thuộc</span>
                    </>
                  ) : word.mastery === 'learning' ? (
                    <>
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>Đang học</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-slate-500" />
                      <span>Mới thêm</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Word & Phonetic & Main Audio */}
            <div className="flex items-baseline flex-wrap gap-2.5">
              <h3 className={`text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white ${
                word.language === 'zh' ? 'font-chinese' : ''
              }`}>
                {word.word}
              </h3>

              <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-lg border border-brand-200/40 dark:border-brand-900/40">
                {activePos?.phonetic || word.phonetic}
              </span>

              {/* Audio button for Word */}
              <button
                onClick={() => handlePlayAudio(word.word)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isPlayingAudio === word.word
                    ? 'bg-brand-600 text-white scale-110 shadow-sm'
                    : 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800'
                }`}
                title="Nghe phát âm từ vựng"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Quick Actions (Star, Copy, Delete) */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onToggleStar(word.id)}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                word.isStarred
                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={word.isStarred ? 'Bỏ đánh dấu quan trọng' : 'Đánh dấu từ quan trọng'}
            >
              <Star className={`w-4 h-4 ${word.isStarred ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleCopyWord}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sao chép từ vựng & nghĩa"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onDelete(word.id)}
              className="p-1.5 rounded-xl text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Xóa từ này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Multi-POS Switcher Tabs (If multiple POS) */}
        {word.posEntries.length > 1 && (
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center mr-1">
              <Layers className="w-3 h-3 mr-1" />
              Từ loại:
            </span>
            {word.posEntries.map((pos, idx) => (
              <button
                key={pos.id}
                onClick={() => setActivePosIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePosIndex === idx
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {pos.posVi} ({pos.pos})
              </button>
            ))}
          </div>
        )}

      </div>

      {/* POS Meaning & Examples Section */}
      {activePos && isExpanded && (
        <div className="px-4 sm:px-5 pb-4 pt-1 space-y-3 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80">
          
          {/* Meaning box */}
          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
              <span>{activePos.posVi}</span>
              {activePos.phonetic && activePos.phonetic !== word.phonetic && (
                <span className="text-slate-400">({activePos.phonetic})</span>
              )}
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {activePos.meaningVi}
            </p>
          </div>

          {/* Example Sentences */}
          {activePos.examples && activePos.examples.length > 0 && (
            <div className="space-y-2">
              {activePos.examples.map((eg, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-start justify-between gap-2 text-xs sm:text-sm"
                >
                  <div className="flex-1 space-y-1">
                    {/* Original Sentence - Chữ Hán to rõ ràng */}
                    <p className={`text-slate-800 dark:text-slate-200 ${
                      word.language === 'zh' 
                        ? 'text-base sm:text-lg font-chinese font-bold tracking-wide leading-relaxed' 
                        : 'font-semibold text-xs sm:text-sm'
                    }`}>
                      {eg.original}
                    </p>

                    {/* Chinese Pinyin - Nằm dưới câu ví dụ chữ Hán */}
                    {word.language === 'zh' && eg.pinyin && (
                      <p className="text-xs sm:text-sm text-brand-600 dark:text-brand-400 font-medium tracking-wide">
                        {eg.pinyin}
                      </p>
                    )}

                    {/* Vietnamese Translation - Nhỏ gọn */}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {eg.translation}
                    </p>
                  </div>

                  {/* Audio button for example sentence */}
                  <button
                    onClick={() => handlePlayAudio(eg.original)}
                    className={`p-1.5 rounded-lg flex-shrink-0 transition-all cursor-pointer ${
                      isPlayingAudio === eg.original
                        ? 'bg-brand-600 text-white scale-105 shadow-xs'
                        : 'text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title="Nghe câu ví dụ"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Collocations */}
          {activePos.collocations && activePos.collocations.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cụm từ:</span>
              {activePos.collocations.map((col, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {col}
                </span>
              ))}
            </div>
          )}

          {/* User note (if any) */}
          {word.userNotes && (
            <div className="p-2 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold">Ghi chú:</span> {word.userNotes}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
