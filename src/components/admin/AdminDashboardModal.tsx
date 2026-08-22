import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  UserX, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Clock, 
  Mail, 
  Key,
  Crown,
  Sparkles,
  Send,
  UserPlus,
  Copy,
  ExternalLink
} from 'lucide-react';
import { authService, ADMIN_EMAIL, MASTER_UNLOCK_CODE } from '../../services/auth';
import { UserAccount, AccountStatus } from '../../types/vocab';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [students, setStudents] = useState<UserAccount[]>(authService.getAllStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error'; mailtoUrl?: string; copyLink?: string } | null>(null);

  // Manual Add Student form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addGoal, setAddGoal] = useState('');

  const refreshList = () => {
    setStudents(authService.getAllStudents());
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success', mailtoUrl?: string, copyLink?: string) => {
    setToast({ text, type, mailtoUrl, copyLink });
    setTimeout(() => setToast(null), 10000);
  };

  const handleStatusChange = (student: UserAccount, newStatus: AccountStatus) => {
    authService.updateStudentStatus(student.email, newStatus);
    refreshList();

    const mailtoUrl = authService.getNotificationMailto(student.email, student.fullName, newStatus);
    const actLink = authService.getStudentActivationLink(student.email, student.fullName);

    showToast(
      newStatus === 'active' 
        ? `Đã DUYỆT (Active) thành công cho: ${student.fullName} (${student.email})!` 
        : `Đã TỪ CHỐI (Decline) tài khoản: ${student.email}`,
      'success',
      mailtoUrl,
      actLink
    );
  };

  const handleDelete = (email: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn tài khoản học viên: "${name}" (${email})? Học viên này sẽ bị tước quyền truy cập ngay lập tức!`)) {
      authService.deleteStudent(email);
      refreshList();
      showToast(`Đã xóa vĩnh viễn học viên: ${email}`, 'error');
    }
  };

  const handleManualAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim() || !addName.trim()) return;

    const student = authService.upsertStudent(addEmail, addName, '123456', addGoal || 'Song ngữ Anh - Trung', 'active');
    refreshList();
    setShowAddForm(false);
    setAddName('');
    setAddEmail('');
    setAddGoal('');

    const mailtoUrl = authService.getNotificationMailto(student.email, student.fullName, 'active');
    const actLink = authService.getStudentActivationLink(student.email, student.fullName);

    showToast(`Đã thêm & DUYỆT NGAY học viên: ${student.email}`, 'success', mailtoUrl, actLink);
  };

  const handleCopyLink = (email: string, name: string) => {
    const link = authService.getStudentActivationLink(email, name);
    navigator.clipboard.writeText(link);
    showToast(`Đã copy link kích hoạt của ${email} vào Clipboard! Bạn có thể gửi link này cho học viên.`, 'success');
  };

  const filteredStudents = students.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return s.email.toLowerCase().includes(q) || (s.fullName && s.fullName.toLowerCase().includes(q));
  });

  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'active').length;
  const pendingCount = students.filter(s => s.status === 'pending').length;
  const declinedCount = students.filter(s => s.status === 'declined').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Bảng Quản Trị Học Viên
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Admin: {ADMIN_EMAIL}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mã mở khóa nhanh: <code className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">{MASTER_UNLOCK_CODE}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Thêm Học Viên Trực Tiếp</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Manual Add Student Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleManualAddStudent} className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 dark:text-brand-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thêm & Duyệt Ngay Học Viên Mới (Không cần chờ đăng ký)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Họ và Tên học viên..."
                required
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="email-hoc-vien@gmail.com"
                required
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="text"
                value={addGoal}
                onChange={(e) => setAddGoal(e.target.value)}
                placeholder="Mục tiêu học (Tùy chọn)..."
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Thêm & Kích Hoạt Cho Học Viên Này Ngay
            </button>
          </form>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>Tổng học viên</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <UserCheck className="w-4 h-4" />
              <span>Đang hoạt động</span>
            </div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{activeCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Clock className="w-4 h-4" />
              <span>Chờ duyệt</span>
            </div>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{pendingCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-1">
            <div className="flex items-center space-x-1.5 text-rose-700 dark:text-rose-300 text-xs font-bold">
              <UserX className="w-4 h-4" />
              <span>Đã từ chối</span>
            </div>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-300">{declinedCount}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm học viên theo email hoặc họ tên..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Students Table */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          {filteredStudents.length > 0 ? (
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Học Viên</th>
                  <th className="p-3.5 hidden sm:table-cell">Mục Tiêu Học</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-right">Thao Tác Quản Trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((student) => {
                  const mailtoLink = authService.getNotificationMailto(student.email, student.fullName, student.status);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      
                      {/* Name & Email */}
                      <td className="p-3.5">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {student.email}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Đăng ký: {student.registeredAt}
                          </p>
                        </div>
                      </td>

                      {/* Study Goal */}
                      <td className="p-3.5 hidden sm:table-cell text-slate-600 dark:text-slate-300">
                        {student.studyGoal || 'Học từ vựng song ngữ'}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5">
                        {student.status === 'active' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đang học (Active)</span>
                          </span>
                        ) : student.status === 'pending' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs">
                            <Clock className="w-3 h-3" />
                            <span>Chờ duyệt</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs">
                            <UserX className="w-3 h-3" />
                            <span>Từ chối</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* Approve Button */}
                          {student.status !== 'active' && (
                            <button
                              onClick={() => handleStatusChange(student, 'active')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                              title="Duyệt cho học viên vào học"
                            >
                              Duyệt
                            </button>
                          )}

                          {/* Decline Button */}
                          {student.status !== 'declined' && (
                            <button
                              onClick={() => handleStatusChange(student, 'declined')}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                              title="Từ chối yêu cầu"
                            >
                              Từ chối
                            </button>
                          )}

                          {/* Copy Activation Link Button */}
                          <button
                            onClick={() => handleCopyLink(student.email, student.fullName)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-slate-600 dark:text-slate-300 hover:text-amber-700 transition-colors cursor-pointer"
                            title="Copy link kích hoạt gửi riêng cho học viên"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Direct Email Notify Button */}
                          <a
                            href={mailtoLink}
                            className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition-colors"
                            title="Gửi email thông báo kết quả trực tiếp cho học viên này"
                          >
                            <Mail className="w-4 h-4" />
                          </a>

                          {/* Delete Account Button */}
                          <button
                            onClick={() => handleDelete(student.email, student.fullName)}
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                            title="Xóa vĩnh viễn tài khoản học viên"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs sm:text-sm space-y-2">
              <p>Chưa có học viên nào trong danh sách trên thiết bị này.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-xs font-bold text-brand-500 hover:underline"
              >
                + Bấm vào đây để Thêm & Kích hoạt học viên ngay
              </button>
            </div>
          )}
        </div>

        {/* Toast Alert with Copy Link and 1-Click Send Mail */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-md">
            <div className="p-4 rounded-2xl shadow-2xl border text-xs sm:text-sm font-bold bg-slate-900 text-white border-slate-700 space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{toast.text}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-end space-x-2">
                {toast.copyLink && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(toast.copyLink!);
                      alert('Đã copy link kích hoạt gửi học viên!');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>
                )}
                {toast.mailtoUrl && (
                  <a
                    href={toast.mailtoUrl}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:opacity-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>📧 Gửi Mail (1-Click)</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
