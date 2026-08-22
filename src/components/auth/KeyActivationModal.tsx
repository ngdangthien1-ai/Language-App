import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { authService, ADMIN_EMAIL } from '../../services/auth';
import { UserAccount } from '../../types/vocab';
import { DEFAULT_GEMINI_KEY } from '../../services/gemini';

interface KeyActivationModalProps {
  isOpen: boolean;
  user: UserAccount;
  onActivated: (updatedUser: UserAccount) => void;
}

export const KeyActivationModal: React.FC<KeyActivationModalProps> = ({
  isOpen,
  user,
  onActivated,
}) => {
  if (!isOpen) return null;

  // Pre-fill with default key if admin or available
  const [aiKey, setAiKey] = useState(user.aiKey || (user.role === 'admin' ? DEFAULT_GEMINI_KEY : ''));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = aiKey.trim();

    if (!cleanKey) {
      setError('Vui lòng nhập Key AI của bạn để tiếp tục.');
      return;
    }

    authService.updateAccountAiKey(user.email, cleanKey);
    const updated = authService.getSessionUser();
    if (updated) {
      onActivated(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/25">
            <Key className="w-7 h-7 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Kích Hoạt Key AI
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Xin chào <strong>{user.fullName || user.email}</strong>! Vui lòng kích hoạt Key AI để bắt đầu sử dụng sổ tay.
          </p>
        </div>

        {/* Info Guide */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Bạn chưa có Key AI kích hoạt?</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Hãy liên hệ trực tiếp Quản Trị Viên qua email: <strong className="text-amber-900 dark:text-amber-100">{ADMIN_EMAIL}</strong> hoặc tin nhắn Zalo để được cấp Key AI riêng cho tài khoản của bạn.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Mã Key AI của bạn
            </label>
            <input
              type="text"
              value={aiKey}
              onChange={(e) => { setAiKey(e.target.value); setError(null); }}
              placeholder="Dán mã Key AI vào đây..."
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <span>Kích Hoạt Key AI & Vào Học Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
