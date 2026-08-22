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
  Sparkles
} from 'lucide-react';
import { authService, ADMIN_EMAIL } from '../../services/auth';
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
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const refreshList = () => {
    setStudents(authService.getAllStudents());
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatusChange = (email: string, newStatus: AccountStatus) => {
    authService.updateStudentStatus(email, newStatus);
    refreshList();
    showToast(
      newStatus === 'active' 
        ? `Đã DUYỆT (Active) tài khoản: ${email}` 
        : `Đã TỪ CHỐI (Decline) tài khoản: ${email}`,
      'success'
    );
  };

  const handleDelete = (email: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn tài khoản học viên: "${name}" (${email})? Học viên này sẽ bị tước quyền truy cập ngay lập tức!`)) {
      authService.deleteStudent(email);
      refreshList();
      showToast(`Đã xóa vĩnh viễn học viên: ${email}`, 'error');
    }
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
                Phê duyệt, quản trị quyền truy cập và xóa tài khoản học viên LinguaFlow
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
                {filteredStudents.map((student) => (
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
                        
                        {student.status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(student.email, 'active')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                            title="Duyệt cho học viên vào học"
                          >
                            Duyệt
                          </button>
                        )}

                        {student.status !== 'declined' && (
                          <button
                            onClick={() => handleStatusChange(student.email, 'declined')}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                            title="Từ chối yêu cầu"
                          >
                            Từ chối
                          </button>
                        )}

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
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs sm:text-sm">
              Không tìm thấy học viên nào khớp với tìm kiếm.
            </div>
          )}
        </div>

        {/* Toast Alert */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold text-white ${
              toast.type === 'success' ? 'bg-emerald-800 border-emerald-600' : 'bg-rose-800 border-rose-600'
            }`}>
              {toast.text}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
