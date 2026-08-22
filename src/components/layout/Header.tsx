import React from 'react';
import { 
  Languages, 
  Moon, 
  Sun, 
  Settings, 
  Sparkles, 
  GraduationCap, 
  Crown,
  LogOut,
  Key,
  ShieldCheck,
  Users
} from 'lucide-react';
import { Language, UserAccount } from '../../types/vocab';

interface HeaderProps {
  currentLangFilter: 'all' | Language;
  onSelectLangFilter: (lang: 'all' | Language) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenGlobalQuiz: () => void;
  onOpenAdminDashboard: () => void;
  onOpenKeyActivation: () => void;
  onLogout: () => void;
  currentUser: UserAccount;
  todayCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLangFilter,
  onSelectLangFilter,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenGlobalQuiz,
  onOpenAdminDashboard,
  onOpenKeyActivation,
  onLogout,
  currentUser,
  todayCount,
  totalCount,
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-600 dark:from-white dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  LinguaFlow
                </span>
                
                {/* Role Badge */}
                {isAdmin ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>Admin Master</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Học Viên</span>
                  </span>
                )}
              </div>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium">
                {currentUser.fullName || currentUser.email}
              </p>
            </div>
          </div>

          {/* Center Language Workspace Switcher (Desktop) */}
          <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => onSelectLangFilter('all')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentLangFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Languages className="w-4 h-4 text-indigo-500" />
              <span>Tất cả</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => onSelectLangFilter('en')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentLangFilter === 'en'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            >
              <span className="text-sm">🇬🇧</span>
              <span>Tiếng Anh</span>
            </button>

            <button
              onClick={() => onSelectLangFilter('zh')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentLangFilter === 'zh'
                  ? 'bg-chinese-600 text-white shadow-sm shadow-chinese-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-chinese-600 dark:hover:text-chinese-400'
              }`}
            >
              <span className="text-sm">🇨🇳</span>
              <span>Tiếng Trung</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Admin Master Dashboard Button */}
            {isAdmin && (
              <button
                onClick={onOpenAdminDashboard}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-orange-500/20 cursor-pointer"
                title="Mở Bảng Quản Trị Học Viên"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Quản Trị Học Viên</span>
              </button>
            )}

            {/* Key AI Button */}
            <button
              onClick={onOpenKeyActivation}
              className="flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Đổi Key AI"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Key AI</span>
            </button>

            {/* Global Quiz Button */}
            <button
              onClick={onOpenGlobalQuiz}
              disabled={totalCount === 0}
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Luyện tập trắc nghiệm & Flashcard"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Luyện Quiz</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>
        </div>

        {/* Mobile Language Switcher Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800/60">
          <button
            onClick={() => onSelectLangFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              currentLangFilter === 'all'
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'text-slate-500'
            }`}
          >
            Tất cả ({totalCount})
          </button>
          <button
            onClick={() => onSelectLangFilter('en')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              currentLangFilter === 'en'
                ? 'bg-brand-600 text-white'
                : 'text-slate-500'
            }`}
          >
            🇬🇧 Tiếng Anh
          </button>
          <button
            onClick={() => onSelectLangFilter('zh')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              currentLangFilter === 'zh'
                ? 'bg-chinese-600 text-white'
                : 'text-slate-500'
            }`}
          >
            🇨🇳 Tiếng Trung
          </button>
        </div>

      </div>
    </header>
  );
};
