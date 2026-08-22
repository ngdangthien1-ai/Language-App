import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  GraduationCap,
  Send,
  Laptop,
  Smartphone,
  Crown
} from 'lucide-react';
import { authService, ADMIN_EMAIL } from '../../services/auth';
import { UserAccount, UserMode } from '../../types/vocab';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userMode: UserMode;
  currentAccount: UserAccount | null;
  onModeChange: (mode: UserMode, account: UserAccount | null) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  userMode,
  currentAccount,
  onModeChange,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'trial' | 'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleStartTrial = () => {
    authService.setGuestMode();
    onModeChange('guest', null);
    onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlertMsg(null);

    try {
      const res = await authService.registerOfficialAccount(fullName, email, password, notes);
      setAlertMsg({ text: res.message, type: 'success' });
      const newAcc = authService.getCurrentAccount();
      onModeChange('authenticated', newAcc);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setAlertMsg({ text: err.message || 'Đăng ký thất bại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlertMsg(null);

    try {
      const acc = await authService.loginAccount(email, password);
      setAlertMsg({ text: `Chào mừng ${acc.fullName || acc.email} trở lại!`, type: 'success' });
      onModeChange('authenticated', acc);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setAlertMsg({ text: err.message || 'Đăng nhập thất bại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    onModeChange('guest', null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Crown className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {currentAccount ? 'Tài Khoản Học Viên' : 'Chế Độ Học Tập'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentAccount ? `Đang học thật (${currentAccount.email})` : 'Chọn Học Thử Miễn Phí hoặc Đăng Ký Học Thật'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* If already logged in */}
        {currentAccount ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tài Khoản Học Thật Chính Thức</span>
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                  Đã duyệt bởi {ADMIN_EMAIL}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-base font-extrabold text-slate-900 dark:text-white">
                  {currentAccount.fullName || 'Học Viên'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                  {currentAccount.email}
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <span>Trạng thái: 🟢 Đồng bộ Đa thiết bị</span>
                <span>Từ: {currentAccount.registeredAt}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất & Chuyển sang Học Thử</span>
            </button>
          </div>
        ) : (
          /* Tabs: Học Thử vs Đăng Ký vs Đăng Nhập */
          <div className="space-y-5">
            
            {/* Tab Buttons */}
            <div className="grid grid-cols-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                👑 Đăng Ký Học Thật
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trial')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                  activeTab === 'trial'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                🎓 Học Thử
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                🔑 Đăng Nhập
              </button>
            </div>

            {/* TAB 1: ĐĂNG KÝ HỌC THẬT (GỬI DUYỆT ADMIN) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Send className="w-3.5 h-3.5 text-amber-600" />
                    <span>Duyệt tự động & Gửi thông báo tới Admin</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Khi đăng ký, thông tin của bạn sẽ được gửi tới Admin <strong>{ADMIN_EMAIL}</strong> để duyệt quyền đồng bộ giữa Điện thoại và Máy tính.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Họ và Tên của bạn
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email của bạn
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email-cua-ban@gmail.com"
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mật khẩu (để đăng nhập lại trên các thiết bị)
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mục tiêu học tập (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ví dụ: Ôn thi HSK 4, IELTS 7.0, giao tiếp công việc..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {alertMsg && (
                  <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 animate-fade-in ${
                    alertMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300'
                  }`}>
                    {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{alertMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi yêu cầu duyệt tới Admin...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Đăng Ký & Gửi Duyệt Tài Khoản Học Thật</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: HỌC THỬ MIỄN PHÍ */}
            {activeTab === 'trial' && (
              <div className="space-y-4 text-center">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Trải Nghiệm Học Thử Nhanh
                  </h3>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 text-left px-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Tra từ song ngữ Anh - Trung bằng Gemini AI</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Tự động bóc tách đa từ loại, phiên âm IPA & Pinyin</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Luyện tập 4 chế độ Quiz & Flashcard thông minh</span>
                    </li>
                    <li className="flex items-center space-x-2 text-slate-400">
                      <span>• Dữ liệu lưu tạm trên máy này (Chưa đồng bộ sang máy khác)</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleStartTrial}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Bắt Đầu Học Thử Ngay</span>
                </button>
              </div>
            )}

            {/* TAB 3: ĐĂNG NHẬP */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
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
                      placeholder="email-cua-ban@gmail.com"
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {alertMsg && (
                  <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 animate-fade-in ${
                    alertMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300'
                  }`}>
                    {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{alertMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Đăng Nhập Tài Khoản Học Thật</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
