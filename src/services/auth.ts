import { UserAccount, AccountStatus } from '../types/vocab';
import { DEFAULT_GEMINI_KEY } from './gemini';

export const ADMIN_EMAIL = 'Ngdangthien1@gmail.com';
export const ADMIN_PASSWORD = 'Neo200671@';

const STORAGE_KEYS = {
  ALL_ACCOUNTS: 'lingua_flow_all_accounts_v3',
  SESSION_USER: 'lingua_flow_session_user_v3',
};

// Admin Master Account
const MASTER_ADMIN: UserAccount = {
  id: 'admin-master',
  email: ADMIN_EMAIL.toLowerCase(),
  fullName: 'Thien Nguyen (Admin)',
  role: 'admin',
  status: 'active',
  registeredAt: '22/08/2026',
  aiKey: DEFAULT_GEMINI_KEY,
  studyGoal: 'Quản trị hệ thống LinguaFlow',
};

class AuthService {
  constructor() {
    this.ensureAdminExists();
    this.handleUrlActions();
  }

  private ensureAdminExists(): void {
    const accounts = this.getAllAccounts();
    const adminExists = accounts.some(a => a.email === ADMIN_EMAIL.toLowerCase());
    if (!adminExists) {
      accounts.unshift({ ...MASTER_ADMIN, password: ADMIN_PASSWORD } as any);
      localStorage.setItem(STORAGE_KEYS.ALL_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  /**
   * Xử lý khi Admin bấm nút duyệt từ link trong Email (ACTIVE hoặc DECLINE)
   */
  private handleUrlActions(): void {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const email = params.get('email');

      if (action && email) {
        const cleanEmail = decodeURIComponent(email).toLowerCase();
        if (action === 'approve') {
          this.updateStudentStatus(cleanEmail, 'active');
          alert(`🎉 ĐÃ DUYỆT THÀNH CÔNG TÀI KHOẢN: ${cleanEmail}\nHọc viên này đã có thể đăng nhập vào ứng dụng ngay!`);
        } else if (action === 'decline') {
          this.updateStudentStatus(cleanEmail, 'declined');
          alert(`ĐÃ TỪ CHỐI TÀI KHOẢN: ${cleanEmail}`);
        }
        // Xóa param trên URL để sạch sẽ
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.warn('URL action handling error:', e);
    }
  }

  public getAllAccounts(): Array<UserAccount & { password?: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALL_ACCOUNTS);
      if (!data) return [{ ...MASTER_ADMIN, password: ADMIN_PASSWORD } as any];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [{ ...MASTER_ADMIN, password: ADMIN_PASSWORD } as any];
    } catch (e) {
      return [{ ...MASTER_ADMIN, password: ADMIN_PASSWORD } as any];
    }
  }

  private saveAllAccounts(accounts: Array<UserAccount & { password?: string }>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts:', e);
    }
  }

  public getSessionUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION_USER);
      if (!data) return null;
      const sessionUser: UserAccount = JSON.parse(data);

      // Verify that this account still exists and is not deleted
      const accounts = this.getAllAccounts();
      const current = accounts.find(a => a.email === sessionUser.email);
      if (!current) {
        // Account was deleted by admin
        this.logout();
        return null;
      }
      return current;
    } catch (e) {
      return null;
    }
  }

  public setSessionUser(account: UserAccount | null): void {
    if (account) {
      localStorage.setItem(STORAGE_KEYS.SESSION_USER, JSON.stringify(account));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION_USER);
    }
  }

  /**
   * Đăng ký tài khoản học viên & Tự động gửi Email duyệt với 2 link ACTIVE / DECLINE tới Admin
   */
  public async register(
    fullName: string,
    email: string,
    password: string,
    studyGoal?: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanName || !password) {
      throw new Error('Vui lòng điền đầy đủ Họ và tên, Email và Mật khẩu.');
    }

    const accounts = this.getAllAccounts();
    const existing = accounts.find(a => a.email === cleanEmail);
    if (existing) {
      throw new Error('Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.');
    }

    const newStudent: UserAccount & { password?: string } = {
      id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      fullName: cleanName,
      password: password,
      role: 'student',
      status: 'pending', // Chờ Admin duyệt
      registeredAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      studyGoal: studyGoal?.trim() || 'Học từ vựng Song Ngữ Anh - Trung',
    };

    accounts.push(newStudent);
    this.saveAllAccounts(accounts);

    // Link kích hoạt và từ chối gửi trong Email của Admin
    const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://ngdangthien1-ai.github.io/Language-App/';
    const approveUrl = `${baseUrl}?action=approve&email=${encodeURIComponent(cleanEmail)}`;
    const declineUrl = `${baseUrl}?action=decline&email=${encodeURIComponent(cleanEmail)}`;

    // Gửi email HTML với 2 nút bấm tới ngdangthien1@gmail.com
    try {
      await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `🔔 [LINGUAFLOW] YÊU CẦU DUYỆT TÀI KHOẢN MỚI: ${cleanName}`,
          "Họ và Tên": cleanName,
          "Email Học Viên": cleanEmail,
          "Mục Tiêu Học Tập": newStudent.studyGoal,
          "Thời Gian Đăng Ký": newStudent.registeredAt,
          "👉 BẤM ĐỂ DUYỆT (ACTIVE)": approveUrl,
          "👉 BẤM ĐỂ TỪ CHỐI (DECLINE)": declineUrl,
          "Ghi Chú Admin": "Bạn có thể bấm trực tiếp vào link trên hoặc đăng nhập tài khoản Admin trên web để quản lý danh sách học viên.",
          _replyto: cleanEmail,
          _captcha: "false",
          _template: "table"
        })
      });
    } catch (e) {
      console.warn('Email notification error:', e);
    }

    return {
      success: true,
      message: `Đăng ký thành công! Yêu cầu của bạn đã được gửi tới Admin (${ADMIN_EMAIL}) để phê duyệt quyền truy cập.`
    };
  }

  /**
   * Đăng nhập tài khoản (Admin hoặc Học viên)
   */
  public async login(email: string, password: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();

    // Check Master Admin login
    if (cleanEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      this.setSessionUser(MASTER_ADMIN);
      return MASTER_ADMIN;
    }

    const accounts = this.getAllAccounts();
    const account = accounts.find(a => a.email === cleanEmail);

    if (!account) {
      throw new Error('Tài khoản không tồn tại. Vui lòng đăng ký tài khoản mới.');
    }

    if (account.password !== password) {
      throw new Error('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
    }

    if (account.status === 'pending') {
      throw new Error(`Tài khoản của bạn đang chờ Admin (${ADMIN_EMAIL}) phê duyệt. Vui lòng liên hệ Admin để được kích hoạt.`);
    }

    if (account.status === 'declined') {
      throw new Error('Yêu cầu đăng ký tài khoản của bạn đã bị từ chối. Vui lòng liên hệ Admin để biết thêm chi tiết.');
    }

    this.setSessionUser(account);
    return account;
  }

  public logout(): void {
    this.setSessionUser(null);
  }

  // --- ADMIN OPERATIONS ---

  public getAllStudents(): UserAccount[] {
    const accounts = this.getAllAccounts();
    return accounts.filter(a => a.role === 'student');
  }

  public updateStudentStatus(email: string, status: AccountStatus): void {
    const accounts = this.getAllAccounts();
    const target = accounts.find(a => a.email === email.toLowerCase());
    if (target) {
      target.status = status;
      this.saveAllAccounts(accounts);
    }
  }

  public deleteStudent(email: string): void {
    const cleanEmail = email.toLowerCase();
    let accounts = this.getAllAccounts();
    accounts = accounts.filter(a => a.email !== cleanEmail);
    this.saveAllAccounts(accounts);

    // Xóa kho từ vựng riêng của học viên này
    try {
      localStorage.removeItem(`lingua_flow_words_${cleanEmail}_v3`);
      localStorage.removeItem(`lingua_flow_key_${cleanEmail}_v3`);
    } catch (e) {
      // ignore
    }
  }

  public updateAccountAiKey(email: string, aiKey: string): void {
    const cleanEmail = email.toLowerCase();
    const accounts = this.getAllAccounts();
    const target = accounts.find(a => a.email === cleanEmail);
    if (target) {
      target.aiKey = aiKey.trim();
      this.saveAllAccounts(accounts);
    }

    const session = this.getSessionUser();
    if (session && session.email === cleanEmail) {
      session.aiKey = aiKey.trim();
      this.setSessionUser(session);
    }
  }

  /**
   * Tạo link Gmail / Mailto 1-Click gửi email thông báo kết quả duyệt trực tiếp từ Admin
   */
  public getNotificationMailto(studentEmail: string, fullName: string, status: AccountStatus): string {
    const isApproved = status === 'active';
    const appUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://ngdangthien1-ai.github.io/Language-App/';
    
    const subject = isApproved
      ? encodeURIComponent(`🎉 [LinguaFlow] Tài khoản học viên của bạn đã được phê duyệt thành công!`)
      : encodeURIComponent(`ℹ️ [LinguaFlow] Thông báo về yêu cầu đăng ký tài khoản`);

    const bodyText = isApproved
      ? `Chào bạn ${fullName},\n\nAdmin đã phê duyệt tài khoản học viên LinguaFlow của bạn thành công!\n\n👉 Bạn có thể truy cập vào học ngay tại đường link: ${appUrl}\n\nChúc bạn học tập hiệu quả!\nAdmin LinguaFlow (${ADMIN_EMAIL})`
      : `Chào bạn ${fullName},\n\nYêu cầu đăng ký tài khoản của bạn chưa được phê duyệt lúc này. Vui lòng liên hệ Admin qua email ${ADMIN_EMAIL} để biết thêm chi tiết.\n\nTrân trọng,\nAdmin LinguaFlow`;

    return `mailto:${studentEmail}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  }
}

export const authService = new AuthService();
