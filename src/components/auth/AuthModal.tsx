import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Database,
  Smartphone,
  Laptop
} from 'lucide-react';
import { supabaseService } from '../../services/supabase';
import { storageService } from '../../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'signup' | 'config'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Supabase Custom Config
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseService.getConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(supabaseService.getConfig().anonKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setMessage({ text: 'Vui lòng nhập đầy đủ Email và Mật khẩu.', type: 'error' });
      return;
    }

    if (!supabaseService.isReady()) {
      setMode('config');
      setMessage({ text: 'Vui lòng cấu hình URL và Anon Key của Supabase để bắt đầu đồng bộ đám mây.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { user, error } = await supabaseService.signUp(email.trim(), password.trim());
        if (error) throw error;
        setMessage({ text: 'Đăng ký thành công! Hãy kiểm tra email hoặc đăng nhập ngay.', type: 'success' });
        setMode('signin');
      } else {
        const { user, error } = await supabaseService.signIn(email.trim(), password.trim());
        if (error) throw error;
        setMessage({ text: 'Đăng nhập thành công! Đang đồng bộ dữ liệu đám mây...', type: 'success' });
        
        // Auto-sync local words to cloud
        if (user) {
          const localWords = storageService.getWords();
          if (localWords.length > 0) {
            await supabaseService.syncLocalWordsToCloud(localWords, user.id);
          }
        }

        setTimeout(() => {
          onAuthSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Thao tác thất bại. Vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabaseService.signOut();
    setLoading(false);
    onAuthSuccess();
    onClose();
  };

  const handleSaveConfig = () => {
    supabaseService.saveConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseKey.trim(),
    });
    setMessage({ text: 'Đã lưu cấu hình kết nối Supabase Cloud!', type: 'success' });
    setMode('signin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentUser ? 'Tài Khoản & Đồng Bộ' : 'Đồng Bộ Đa Thiết Bị'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser ? 'Học tập liên tục trên mọi thiết bị' : 'Đồng bộ từ vựng giữa máy tính & điện thoại'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Benefits Banner (When not logged in) */}
        {!currentUser && mode !== 'config' && (
          <div className="p-3.5 bg-brand-50/80 dark:bg-brand-950/40 rounded-2xl border border-brand-200/70 dark:border-brand-900/50 flex items-center justify-between text-xs font-semibold text-brand-800 dark:text-brand-300">
            <div className="flex items-center space-x-2">
              <Laptop className="w-4 h-4 text-brand-600" />
              <span>Máy tính</span>
              <span className="text-slate-400">⇄</span>
              <Smartphone className="w-4 h-4 text-brand-600" />
              <span>Điện thoại</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-200/60 dark:bg-brand-900/60 font-bold">
              Realtime Sync
            </span>
          </div>
        )}

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đang đồng bộ Đám mây (Cloud Active)</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {currentUser.email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mọi từ vựng bạn thêm hoặc học thuộc sẽ tự động xuất hiện trên tất cả các thiết bị đăng nhập tài khoản này.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        ) : mode === 'config' ? (
          /* Supabase Config Form */
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Supabase Anon Public Key
              </label>
              <input
                type="text"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tạo tài khoản mới
              </button>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mật khẩu (tối thiểu 6 ký tự)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Message Alert */}
            {message && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 animate-fade-in ${
                message.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập & Bật Đồng Bộ</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Tạo Tài Khoản Đồng Bộ</span>
                </>
              )}
            </button>

            {/* Cloud Config Link */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setMode('config')}
                className="text-[11px] font-semibold text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center space-x-1"
              >
                <Database className="w-3 h-3" />
                <span>Cấu hình kết nối Supabase Cloud Database</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
