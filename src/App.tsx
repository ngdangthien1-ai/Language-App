import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  GraduationCap,
  Layers,
  Heart,
  Globe2,
  Trash2,
  Crown,
  Send,
  ShieldCheck
} from 'lucide-react';
import { VocabWord, Language, AppSettings, DailyVocabGroup, UserAccount, UserMode } from './types/vocab';
import { storageService } from './services/storage';
import { lookupWordWithGemini } from './services/gemini';
import { authService, ADMIN_EMAIL } from './services/auth';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { QuickSearchBar } from './components/lookup/QuickSearchBar';
import { WordPreviewCard } from './components/lookup/WordPreviewCard';
import { DailyGroup } from './components/notebook/DailyGroup';
import { FilterBar } from './components/notebook/FilterBar';
import { QuizModal } from './components/quiz/QuizModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { RegistrationModal } from './components/auth/RegistrationModal';
import { getTodayDateString } from './utils/dates';

export const App: React.FC = () => {
  // State
  const [words, setWords] = useState<VocabWord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [currentLangFilter, setCurrentLangFilter] = useState<'all' | Language>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [masteryFilter, setMasteryFilter] = useState<'all' | VocabWord['mastery']>('all');
  const [starredOnly, setStarredOnly] = useState(false);

  // User Mode & Auth State (Học Thử vs Đăng Ký Học Thật)
  const [userMode, setUserMode] = useState<UserMode>(authService.getUserMode());
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(authService.getCurrentAccount());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // AI Lookup State
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [previewWord, setPreviewWord] = useState<VocabWord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [quizState, setQuizState] = useState<{
    isOpen: boolean;
    title: string;
    words: VocabWord[];
  }>({
    isOpen: false,
    title: '',
    words: [],
  });

  const searchSectionRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load words from storage on mount
  useEffect(() => {
    const loadedWords = storageService.getWords();
    setWords(loadedWords);
  }, []);

  // Sync Dark Mode class on <html>
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleToggleDarkMode = () => {
    const updated = { ...settings, darkMode: !settings.darkMode };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    showToast('Đã lưu cấu hình cài đặt!', 'success');
  };

  // Perform AI Lookup
  const handlePerformLookup = async (inputWord: string, targetLang?: Language) => {
    setIsSearchingAI(true);
    try {
      const result = await lookupWordWithGemini(inputWord, targetLang, settings.geminiApiKey);
      setPreviewWord(result);
    } catch (err: any) {
      console.error('Lookup failed:', err);
      showToast(err.message || 'Không thể tra cứu từ này. Vui lòng kiểm tra lại mạng hoặc API Key.', 'error');
    } finally {
      setIsSearchingAI(false);
    }
  };

  // Word CRUD
  const handleSaveWord = (wordToSave: VocabWord) => {
    const updated = storageService.addWord(wordToSave);
    setWords(updated);
    showToast(`Đã lưu "${wordToSave.word}" vào sổ tay hôm nay!`, 'success');
  };

  const handleToggleStar = (id: string) => {
    const updated = storageService.toggleStar(id);
    setWords(updated);
  };

  const handleSetMastery = (id: string, mastery: VocabWord['mastery']) => {
    const updated = storageService.setMastery(id, mastery);
    setWords(updated);
  };

  const handleDeleteWord = (id: string) => {
    const updated = storageService.deleteWord(id);
    setWords(updated);
    showToast('Đã xóa từ khỏi sổ tay.', 'success');
  };

  // Open Quiz
  const handleOpenGlobalQuiz = () => {
    const targetPool = filteredWords.length > 0 ? filteredWords : words;
    if (targetPool.length === 0) {
      showToast('Sổ tay chưa có từ vựng nào để luyện quiz.', 'error');
      return;
    }
    setQuizState({
      isOpen: true,
      title: currentLangFilter === 'en' ? 'Luyện Quiz Tiếng Anh' : currentLangFilter === 'zh' ? 'Luyện Quiz Tiếng Trung' : 'Luyện Quiz Tổng Hợp',
      words: targetPool,
    });
  };

  const handleOpenDateQuiz = (dateStr: string, dateWords: VocabWord[]) => {
    setQuizState({
      isOpen: true,
      title: `Luyện Quiz Ngày ${dateStr}`,
      words: dateWords,
    });
  };

  // Scroll to search on mobile
  const handleMobileOpenSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) input.focus();
  };

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      // Language filter
      if (currentLangFilter !== 'all' && w.language !== currentLangFilter) {
        return false;
      }

      // Mastery filter
      if (masteryFilter !== 'all' && w.mastery !== masteryFilter) {
        return false;
      }

      // Starred filter
      if (starredOnly && !w.isStarred) {
        return false;
      }

      // Search query in word, phonetic, meanings, examples
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchWord = w.word.toLowerCase().includes(q);
        const matchPhonetic = w.phonetic?.toLowerCase().includes(q);
        const matchPOS = w.posEntries.some(
          (p) =>
            p.meaningVi.toLowerCase().includes(q) ||
            p.posVi.toLowerCase().includes(q) ||
            p.examples.some((eg) => eg.original.toLowerCase().includes(q) || eg.translation.toLowerCase().includes(q))
        );
        return matchWord || matchPhonetic || matchPOS;
      }

      return true;
    });
  }, [words, currentLangFilter, masteryFilter, starredOnly, searchQuery]);

  // Group filtered words by date
  const dailyGroups: DailyVocabGroup[] = useMemo(() => {
    return storageService.getGroupedByDate(filteredWords);
  }, [filteredWords]);

  const todayDateStr = getTodayDateString();
  const todayWordsCount = useMemo(() => {
    return words.filter((w) => w.dateAdded === todayDateStr).length;
  }, [words, todayDateStr]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white transition-colors duration-200 pb-20 md:pb-0">
      
      {/* Top Header */}
      <Header
        currentLangFilter={currentLangFilter}
        onSelectLangFilter={setCurrentLangFilter}
        darkMode={settings.darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGlobalQuiz={handleOpenGlobalQuiz}
        onOpenAuth={() => setIsAuthOpen(true)}
        userMode={userMode}
        currentAccount={currentAccount}
        todayCount={todayWordsCount}
        totalCount={words.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Trial Mode Welcome Banner (If guest) */}
        {userMode === 'guest' && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm animate-fade-in">
            <div className="flex items-center space-x-2.5 text-amber-900 dark:text-amber-200">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 animate-bounce" />
              <span>
                Bạn đang ở <strong>Chế độ Học Thử Miễn Phí</strong>. Đăng ký tài khoản học thật để được Admin ({ADMIN_EMAIL}) duyệt quyền đồng bộ đa thiết bị!
              </span>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 whitespace-nowrap cursor-pointer transition-transform active:scale-95"
            >
              👑 Đăng Ký Học Thật Ngay
            </button>
          </div>
        )}

        {/* Hero & Quick AI Search Bar */}
        <section ref={searchSectionRef} className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span>Phân tích tự động đa từ loại & Phiên âm chuẩn xác bởi Gemini AI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Ghi Chú Từ Vựng Thông Minh
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Chỉ cần nhập từ — hệ thống tự động bóc tách phiên âm, đa loại từ, dịch nghĩa tiếng Việt, câu ví dụ và phát âm chuẩn bản xứ.
          </p>

          {/* Quick Search Input */}
          <div className="pt-2">
            <QuickSearchBar
              onSearch={handlePerformLookup}
              isLoading={isSearchingAI}
              activeLangWorkspace={currentLangFilter}
            />
          </div>
        </section>

        {/* Notebook Section */}
        <section className="space-y-6 pt-4">
          
          {/* Section Header & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                <span>Sổ Tay Từ Vựng Theo Ngày</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hiển thị {filteredWords.length} / {words.length} từ đã lưu {currentAccount && `• 🟢 ${currentAccount.fullName || currentAccount.email}`}
              </p>
            </div>

            {/* Quick action: Global Quiz */}
            {filteredWords.length > 0 && (
              <button
                onClick={handleOpenGlobalQuiz}
                className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Luyện Quiz bộ từ này ({filteredWords.length})</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            masteryFilter={masteryFilter}
            onMasteryFilterChange={setMasteryFilter}
            starredOnly={starredOnly}
            onToggleStarredOnly={() => setStarredOnly(!starredOnly)}
            totalFilteredWords={filteredWords.length}
          />

          {/* Daily Groups List */}
          {dailyGroups.length > 0 ? (
            <div className="space-y-8">
              {dailyGroups.map((group) => (
                <DailyGroup
                  key={group.date}
                  group={group}
                  onToggleStar={handleToggleStar}
                  onSetMastery={handleSetMastery}
                  onDelete={handleDeleteWord}
                  onOpenQuizForDate={handleOpenDateQuiz}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Không tìm thấy từ vựng nào</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {searchQuery || masteryFilter !== 'all' || starredOnly
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                    : 'Hãy nhập một từ tiếng Anh hoặc tiếng Trung ở khung tìm kiếm phía trên để bắt đầu ghi chú!'}
                </p>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* Footer (Desktop) */}
      <footer className="hidden md:block mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 LinguaFlow — Sổ Tay Từ Vựng Song Ngữ Thông Minh & Quiz Hàng Ngày</p>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{userMode === 'authenticated' ? 'Đã kích hoạt Tài khoản Học Thật' : 'Chế độ Học Thử Miễn Phí'}</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-brand-600 dark:text-brand-400">Admin: {ADMIN_EMAIL}</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab="notebook"
        currentLang={currentLangFilter}
        onLanguageChange={setCurrentLangFilter}
        onOpenSearch={handleMobileOpenSearch}
        onOpenQuiz={handleOpenGlobalQuiz}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        userMode={userMode}
        currentAccount={currentAccount}
        wordCount={words.length}
      />

      {/* Word Preview Drawer/Modal */}
      {previewWord && (
        <WordPreviewCard
          word={previewWord}
          onSave={handleSaveWord}
          onClose={() => setPreviewWord(null)}
          isAlreadySaved={words.some((w) => w.word.toLowerCase() === previewWord.word.toLowerCase())}
        />
      )}

      {/* Quiz Modal */}
      {quizState.isOpen && (
        <QuizModal
          title={quizState.title}
          words={quizState.words}
          onClose={() => setQuizState({ isOpen: false, title: '', words: [] })}
          onSetMastery={handleSetMastery}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
          onDataImported={() => setWords(storageService.getWords())}
        />
      )}

      {/* Registration & Mode Modal */}
      <RegistrationModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        userMode={userMode}
        currentAccount={currentAccount}
        onModeChange={(mode, account) => {
          setUserMode(mode);
          setCurrentAccount(account);
          if (account) {
            showToast(`Đã kích hoạt chế độ Học Thật cho: ${account.fullName || account.email}`, 'success');
          } else {
            showToast('Đang ở chế độ Học Thử', 'success');
          }
        }}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-slide-up max-w-sm">
          <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700 backdrop-blur-md'
              : 'bg-rose-900/90 text-white border-rose-700 backdrop-blur-md'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
