import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Loader2, Globe, CornerDownLeft, X } from 'lucide-react';
import { Language } from '../../types/vocab';
import { detectLanguage } from '../../services/gemini';

interface QuickSearchBarProps {
  onSearch: (word: string, targetLang?: Language) => void;
  isLoading: boolean;
  activeLangWorkspace: 'all' | Language;
}

export const QuickSearchBar: React.FC<QuickSearchBarProps> = ({
  onSearch,
  isLoading,
  activeLangWorkspace,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [selectedLang, setSelectedLang] = useState<'auto' | Language>('auto');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync workspace change
  useEffect(() => {
    if (activeLangWorkspace !== 'all') {
      setSelectedLang(activeLangWorkspace);
    } else {
      setSelectedLang('auto');
    }
  }, [activeLangWorkspace]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed || isLoading) return;

    const targetLang = selectedLang === 'auto' ? undefined : selectedLang;
    onSearch(trimmed, targetLang);
  };

  const quickSamples = [
    { word: 'present', lang: 'en', desc: 'Verb / Noun / Adj' },
    { word: 'strike', lang: 'en', desc: 'Động từ / Danh từ' },
    { word: '方便', lang: 'zh', desc: 'fāngbiàn - Thuận tiện' },
    { word: '对', lang: 'zh', desc: 'duì - Đúng / Đối với' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      <div className="relative group">
        
        {/* Ambient Glow Background Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-chinese-500 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition duration-500 group-focus-within:opacity-60" />

        {/* Search Card Container */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-3 shadow-xl">
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
            
            {/* Left Input Section */}
            <div className="relative flex-1 w-full flex items-center pl-3">
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Nhập từ vựng tiếng Anh hoặc tiếng Trung (vd: conduct, present, 方便, 行)..."
                disabled={isLoading}
                className="w-full bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base sm:text-lg font-medium focus:ring-0 focus:outline-none py-2"
              />
              
              {inputVal && !isLoading && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Language Target Pill Selector & Submit Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 pt-2 sm:pt-0">
              
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSelectedLang('auto')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedLang === 'auto'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Tự nhận diện
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang('en')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedLang === 'en'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-brand-600'
                  }`}
                >
                  🇬🇧 EN
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang('zh')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedLang === 'zh'
                      ? 'bg-chinese-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-chinese-600'
                  }`}
                >
                  🇨🇳 ZH
                </button>
              </div>

              {/* Submit / AI Lookup Button */}
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>AI Đang Phân Tích...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Tra & Bóc Tách</span>
                    <span className="hidden lg:inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-white/20 ml-1">
                      <CornerDownLeft className="w-3 h-3" />
                    </span>
                  </>
                )}
              </button>

            </div>

          </form>

        </div>

      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex items-center flex-wrap gap-2 mt-3 px-2">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center">
          <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
          Từ mẫu hay:
        </span>
        {quickSamples.map((sample) => (
          <button
            key={sample.word}
            onClick={() => {
              setInputVal(sample.word);
              setSelectedLang(sample.lang as Language);
              onSearch(sample.word, sample.lang as Language);
            }}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <span className="font-bold">{sample.word}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">({sample.desc})</span>
          </button>
        ))}
      </div>

    </div>
  );
};
