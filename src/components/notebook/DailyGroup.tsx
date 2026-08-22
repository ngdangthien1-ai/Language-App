import React, { useState } from 'react';
import { Calendar, GraduationCap, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { DailyVocabGroup, VocabWord } from '../../types/vocab';
import { WordCard } from './WordCard';

interface DailyGroupProps {
  group: DailyVocabGroup;
  onToggleStar: (id: string) => void;
  onSetMastery: (id: string, mastery: VocabWord['mastery']) => void;
  onDelete: (id: string) => void;
  onOpenQuizForDate: (date: string, words: VocabWord[]) => void;
}

export const DailyGroup: React.FC<DailyGroupProps> = ({
  group,
  onToggleStar,
  onSetMastery,
  onDelete,
  onOpenQuizForDate,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-4">
      
      {/* Date Header Sticky / Section Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
        
        {/* Left: Date info & count */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-900/40">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {group.formattedDate}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Đã ghi chú <span className="font-bold text-brand-600 dark:text-brand-400">{group.words.length} từ</span>
            </p>
          </div>
        </div>

        {/* Right: Actions (Quiz for this day & collapse) */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          
          <button
            onClick={() => onOpenQuizForDate(group.date, group.words)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-indigo-500/20 hover:shadow-md transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Luyện Quiz Ngày Này ({group.words.length})</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isOpen ? 'Thu gọn ngày này' : 'Mở rộng ngày này'}
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Words Grid / List */}
      {isOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
          {group.words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onToggleStar={onToggleStar}
              onSetMastery={onSetMastery}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
};
