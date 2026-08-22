import React from 'react';
import { Search, Star, Filter, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { VocabWord } from '../../types/vocab';

interface FilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  masteryFilter: 'all' | VocabWord['mastery'];
  onMasteryFilterChange: (mastery: 'all' | VocabWord['mastery']) => void;
  starredOnly: boolean;
  onToggleStarredOnly: () => void;
  totalFilteredWords: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  masteryFilter,
  onMasteryFilterChange,
  starredOnly,
  onToggleStarredOnly,
  totalFilteredWords,
}) => {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-sm space-y-3">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search in Saved Words */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Tìm trong sổ tay..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchQueryChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
          
          {/* Mastery filter buttons */}
          <button
            onClick={() => onMasteryFilterChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              masteryFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>

          <button
            onClick={() => onMasteryFilterChange('new')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
              masteryFilter === 'new'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Mới thêm</span>
          </button>

          <button
            onClick={() => onMasteryFilterChange('learning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
              masteryFilter === 'learning'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Đang học</span>
          </button>

          <button
            onClick={() => onMasteryFilterChange('mastered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
              masteryFilter === 'mastered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã thuộc</span>
          </button>

          {/* Starred filter button */}
          <button
            onClick={onToggleStarredOnly}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
              starredOnly
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
            title="Chỉ hiển thị các từ được gắn sao quan trọng"
          >
            <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-white' : ''}`} />
            <span>Quan trọng</span>
          </button>

        </div>

      </div>

    </div>
  );
};
