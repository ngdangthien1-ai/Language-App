import React from 'react';
import { 
  BookOpen, 
  Search, 
  GraduationCap, 
  Crown, 
  Key,
  LogOut,
  Users
} from 'lucide-react';
import { Language, UserAccount } from '../../types/vocab';

interface BottomNavProps {
  activeTab: 'notebook' | 'search';
  currentLang: 'all' | Language;
  onLanguageChange: (lang: 'all' | Language) => void;
  onOpenSearch: () => void;
  onOpenQuiz: () => void;
  onOpenAdminDashboard: () => void;
  onOpenKeyActivation: () => void;
  onLogout: () => void;
  currentUser: UserAccount;
  wordCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentLang,
  onLanguageChange,
  onOpenSearch,
  onOpenQuiz,
  onOpenAdminDashboard,
  onOpenKeyActivation,
  onLogout,
  currentUser,
  wordCount,
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 px-3 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {/* Notebook / Language Switcher */}
        <button
          onClick={() => {
            if (currentLang === 'all') onLanguageChange('en');
            else if (currentLang === 'en') onLanguageChange('zh');
            else onLanguageChange('all');
          }}
          className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <div className="relative">
            <BookOpen className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 text-[9px] px-1 py-0.2 rounded-full bg-brand-500 text-white font-bold">
              {currentLang === 'all' ? 'Tất' : currentLang === 'en' ? 'EN' : 'ZH'}
            </span>
          </div>
          <span className="text-[10px] font-bold mt-1">Sổ tay</span>
        </button>

        {/* Quick Search Floating Button (Hero) */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/35 active:scale-95 transition-transform">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 mt-1">Tra từ AI</span>
        </button>

        {/* Quiz Button */}
        <button
          onClick={onOpenQuiz}
          disabled={wordCount === 0}
          className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors disabled:opacity-40"
        >
          <div className="relative">
            <GraduationCap className="w-5 h-5" />
            {wordCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            )}
          </div>
          <span className="text-[10px] font-bold mt-1">Luyện Quiz</span>
        </button>

        {/* Admin Dashboard or Key AI */}
        {isAdmin ? (
          <button
            onClick={onOpenAdminDashboard}
            className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-amber-600 dark:text-amber-400"
          >
            <Users className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-bold mt-1">Quản trị</span>
          </button>
        ) : (
          <button
            onClick={onOpenKeyActivation}
            className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-amber-500"
          >
            <Key className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-bold mt-1">Key AI</span>
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Đăng xuất</span>
        </button>

      </div>
    </div>
  );
};
