import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Volume2, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Crown,
  Layers,
  Send,
  Zap,
  Globe2,
  Check
} from 'lucide-react';
import { authService, ADMIN_EMAIL } from '../../services/auth';
import { UserAccount } from '../../types/vocab';

interface LandingPageProps {
  onLoginSuccess: (account: UserAccount) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGoal, setRegGoal] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const account = await authService.login(loginEmail, loginPassword);
      setMessage({ text: `Đăng nhập thành công! Chào mừng ${account.fullName || account.email}.`, type: 'success' });
      setTimeout(() => {
        onLoginSuccess(account);
      }, 800);
    } catch (err: any) {
      setMessage({ text: err.message || 'Đăng nhập thất bại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await authService.register(regName, regEmail, regPassword, regGoal);
      setMessage({ 
        text: `Đăng ký thành công! Yêu cầu duyệt đã được gửi trực tiếp tới Admin (${ADMIN_EMAIL}). Bạn sẽ nhận được email khi Admin kích hoạt.`, 
        type: 'success' 
      });
      // Reset form
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegGoal('');
    } catch (err: any) {
      setMessage({ text: err.message || 'Đăng ký thất bại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      
      {/* Background Decorative Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
                LinguaFlow
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-950 text-brand-300 border border-brand-800">
                AI Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Sổ tay từ vựng Song Ngữ Thông Minh (Anh - Trung)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setActiveTab(activeTab === 'login' ? 'register' : 'login');
              setMessage(null);
            }}
            className="text-xs sm:text-sm font-bold px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all cursor-pointer"
          >
            {activeTab === 'login' ? 'Đăng ký tài khoản mới' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </header>

      {/* Main Hero & Auth Section */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Column: Product Showcase */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-800 text-brand-300 text-xs font-bold shadow-inner">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Hệ Thống Học Tập Private Có Kiểm Soát</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Ghi Chú & Luyện Từ Vựng <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Song Ngữ Chuẩn AI
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Chỉ cần nhập từ — hệ thống tự động bóc tách phiên âm IPA / Pinyin, đa loại từ, nghĩa tiếng Việt, câu ví dụ và phát âm chuẩn bản xứ. Lưu trữ sổ tay cá nhân hóa theo từng ngày.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg mx-auto lg:mx-0 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-brand-950 text-brand-400 border border-brand-900">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">Nhận diện Đa từ loại (Noun / Verb / Adj)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-900">
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">Phát âm Bản xứ Studio (Anh & Trung)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-900">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">Sổ tay lưu trữ theo ngày thông minh</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-900">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">4 Chế độ Quiz Flashcard 3D tương tác</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center lg:justify-start space-x-4 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Duyệt tài khoản qua Admin</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Gắn Key AI riêng biệt</span>
            </div>
          </div>

        </div>

        {/* Right Column: Auth Form Card */}
        <div className="w-full max-w-md">
          <div className="relative bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            {/* Form Mode Selector */}
            <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setMessage(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setMessage(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đăng Ký Tài Khoản
              </button>
            </div>

            {/* Alert Message */}
            {message && (
              <div className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start space-x-3 animate-fade-in ${
                message.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-800 text-rose-300'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                )}
                <span className="leading-relaxed">{message.text}</span>
              </div>
            )}

            {/* FORM 1: LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="email-cua-ban@gmail.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng Nhập Vào Học</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-brand-400 font-bold hover:underline"
                  >
                    Đăng ký để được Admin duyệt
                  </button>
                </p>
              </form>
            )}

            {/* FORM 2: REGISTER */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                
                <div className="p-3 bg-amber-950/50 rounded-2xl border border-amber-900/60 text-xs text-amber-300 flex items-start space-x-2.5">
                  <Send className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Khi đăng ký, thông tin của bạn sẽ được gửi tới Admin (<strong>{ADMIN_EMAIL}</strong>) để duyệt cấp quyền vào học.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Họ và Tên</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="email-cua-ban@gmail.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Mật khẩu (tối thiểu 6 ký tự)</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Mục tiêu học tập (Tùy chọn)</label>
                  <input
                    type="text"
                    value={regGoal}
                    onChange={(e) => setRegGoal(e.target.value)}
                    placeholder="Ví dụ: Ôn thi HSK 4, IELTS 7.0, giao tiếp..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi thông báo tới Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi Yêu Cầu Đăng Ký Học Viên</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Đã có tài khoản được duyệt?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-brand-400 font-bold hover:underline"
                  >
                    Đăng nhập tại đây
                  </button>
                </p>
              </form>
            )}

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 LinguaFlow — Hệ Thống Học Từ Vựng Song Ngữ Thông Minh</p>
          <p>
            Liên hệ Quản Trị Viên: <a href={`mailto:${ADMIN_EMAIL}`} className="text-brand-400 font-bold hover:underline">{ADMIN_EMAIL}</a>
          </p>
        </div>
      </footer>

    </div>
  );
};
