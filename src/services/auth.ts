import { UserAccount, AccountStatus } from '../types/vocab';
import { DEFAULT_GEMINI_KEY } from './gemini';

export const ADMIN_EMAIL = 'Ngdangthien1@gmail.com';
export const ADMIN_PASSWORD = 'Neo200671@';
export const MASTER_UNLOCK_CODE = '200671'; // Master authorization code to unlock accounts

const STORAGE_KEYS = {
  ALL_ACCOUNTS: 'lingua_flow_all_accounts_v4',
  SESSION_USER: 'lingua_flow_session_user_v4',
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
      this.saveAllAccounts(accounts);
    }
  }

  /**
   * Xử lý khi Admin hoặc Học viên bấm link duyệt/kích hoạt từ Email
   */
  private handleUrlActions(): void {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const statusParam = params.get('status');
      const email = params.get('email');
      const name = params.get('name');
      const pass = params.get('pass');
      const goal = params.get('goal');

      if (email) {
        const cleanEmail = decodeURIComponent(email).toLowerCase();
        const cleanName = name ? decodeURIComponent(name) : 'Học Viên';
        const cleanGoal = goal ? decodeURIComponent(goal) : 'Học từ vựng Song Ngữ Anh - Trung';
        const cleanPass = pass ? decodeURIComponent(pass) : '123456';

        // 1. Admin bấm duyệt (action=approve)
        if (action === 'approve') {
          this.upsertStudent(cleanEmail, cleanName, cleanPass, cleanGoal, 'active');
          alert(`🎉 ĐÃ DUYỆT THÀNH CÔNG TÀI KHOẢN: ${cleanEmail}!\nHọc viên này đã được thêm vào danh sách quản trị của bạn.`);
        } 
        // 2. Admin từ chối (action=decline)
        else if (action === 'decline') {
          this.upsertStudent(cleanEmail, cleanName, cleanPass, cleanGoal, 'declined');
          alert(`ĐÃ TỪ CHỐI TÀI KHOẢN: ${cleanEmail}`);
        }
        // 3. Học viên bấm link kích hoạt vào học (status=activated)
        else if (statusParam === 'activated') {
          const activatedStudent = this.upsertStudent(cleanEmail, cleanName, cleanPass, cleanGoal, 'active');
          this.setSessionUser(activatedStudent);
          alert(`🎉 Chúc mừng ${cleanName}! Tài khoản của bạn đã được kích hoạt thành công. Đang vào ứng dụng...`);
        }

        // Xóa query param trên URL để URL sạch đẹp
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
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ ...MASTER_ADMIN, password: ADMIN_PASSWORD } as any];
    } catch (e) {
      return [{ ...MASTER_ADMIN, password: ADMIN_PASSWORD } as any];
    }
  }

  public saveAllAccounts(accounts: Array<UserAccount & { password?: string }>): void {
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

      const accounts = this.getAllAccounts();
      const current = accounts.find(a => a.email === sessionUser.email);
      if (!current) {
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
   * Thêm hoặc cập nhật học viên vào cơ sở dữ liệu
   */
  public upsertStudent(
    email: string,
    fullName: string,
    password?: string,
    studyGoal?: string,
    status: AccountStatus = 'active'
  ): UserAccount {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = this.getAllAccounts();
    const existingIndex = accounts.findIndex(a => a.email === cleanEmail);

    let updatedAccount: UserAccount & { password?: string };

    if (existingIndex >= 0) {
      updatedAccount = {
        ...accounts[existingIndex],
        fullName: fullName || accounts[existingIndex].fullName,
        status: status,
        password: password || accounts[existingIndex].password,
        studyGoal: studyGoal || accounts[existingIndex].studyGoal,
      };
      accounts[existingIndex] = updatedAccount;
    } else {
      updatedAccount = {
        id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        fullName: fullName || 'Học Viên',
        password: password || '123456',
        role: 'student',
        status: status,
        registeredAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        studyGoal: studyGoal || 'Học từ vựng Song Ngữ Anh - Trung',
      };
      accounts.push(updatedAccount);
    }

    this.saveAllAccounts(accounts);
    return updatedAccount;
  }

  /**
   * Đăng ký tài khoản học viên & Gửi email chứa ĐẦY ĐỦ THÔNG TIN DUYỆT tới Admin
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

    // Lưu / Cập nhật tài khoản với trạng thái pending
    this.upsertStudent(cleanEmail, cleanName, password, studyGoal, 'pending');

    // Link duyệt chứa đầy đủ payload để Admin mở ở bất kỳ máy tính/điện thoại nào cũng duyệt được 100%
    const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://ngdangthien1-ai.github.io/Language-App/';
    const encodedEmail = encodeURIComponent(cleanEmail);
    const encodedName = encodeURIComponent(cleanName);
    const encodedPass = encodeURIComponent(password);
    const encodedGoal = encodeURIComponent(studyGoal || 'Song Ngu');

    const approveUrl = `${baseUrl}?action=approve&email=${encodedEmail}&name=${encodedName}&pass=${encodedPass}&goal=${encodedGoal}`;
    const declineUrl = `${baseUrl}?action=decline&email=${encodedEmail}&name=${encodedName}`;

    // Gửi email thông báo tới Admin Ngdangthien1@gmail.com
    try {
      await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `🔔 [LINGUAFLOW] YÊU CẦU DUYỆT HỌC VIÊN MỚI: ${cleanName}`,
          "Họ và Tên Học Viên": cleanName,
          "Email Học Viên": cleanEmail,
          "Mục Tiêu Học Tập": studyGoal || 'Song ngữ Anh - Trung',
          "👉 BẤM VÀO ĐÂY ĐỂ DUYỆT (ACTIVE)": approveUrl,
          "👉 BẤM VÀO ĐÂY ĐỂ TỪ CHỐI (DECLINE)": declineUrl,
          "Hướng Dẫn Admin": "Bạn có thể bấm trực tiếp vào link duyệt phía trên từ điện thoại hoặc máy tính để kích hoạt tài khoản học viên ngay lập tức.",
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
      message: `Đăng ký thành công! Thông tin đã được gửi tới Admin (${ADMIN_EMAIL}) để phê duyệt.`
    };
  }

  /**
   * Đăng nhập tài khoản (Admin hoặc Học viên)
   */
  public async login(email: string, password: string, unlockCode?: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();

    // Check Master Admin login
    if (cleanEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      this.setSessionUser(MASTER_ADMIN);
      return MASTER_ADMIN;
    }

    // Nếu có mã mở khóa Master Unlock Code từ Admin
    if (unlockCode && unlockCode.trim() === MASTER_UNLOCK_CODE) {
      const student = this.upsertStudent(cleanEmail, cleanEmail.split('@')[0], password, 'Kích hoạt qua mã Admin', 'active');
      this.setSessionUser(student);
      return student;
    }

    const accounts = this.getAllAccounts();
    const account = accounts.find(a => a.email === cleanEmail);

    if (!account) {
      // Nếu chưa có trên máy này, cho phép đăng ký hoặc kiểm tra
      throw new Error('Tài khoản này chưa tồn tại trên hệ thống. Bạn vui lòng bấm sang tab "Đăng Ký Tài Khoản" nhé!');
    }

    if (account.password !== password) {
      throw new Error('Mật khẩu không chính xác. Bạn có thể bấm sang tab "Đăng Ký Tài Khoản" để tạo lại hoặc đổi mật khẩu.');
    }

    if (account.status === 'pending') {
      throw new Error(`Tài khoản của bạn đang chờ Admin (${ADMIN_EMAIL}) phê duyệt. Vui lòng kiểm tra email hoặc liên hệ Admin để được kích hoạt.`);
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

    try {
      localStorage.removeItem(`lingua_flow_words_${cleanEmail}_v4`);
      localStorage.removeItem(`lingua_flow_key_${cleanEmail}_v4`);
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
   * Tạo link kích hoạt trực tiếp dành cho học viên
   */
  public getStudentActivationLink(email: string, fullName: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://ngdangthien1-ai.github.io/Language-App/';
    return `${baseUrl}?status=activated&email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}`;
  }

  /**
   * Tạo link Gmail 1-Click gửi email thông báo kèm link kích hoạt trực tiếp cho học viên
   */
  public getNotificationMailto(studentEmail: string, fullName: string, status: AccountStatus): string {
    const isApproved = status === 'active';
    const activationLink = this.getStudentActivationLink(studentEmail, fullName);
    
    const subject = isApproved
      ? encodeURIComponent(`🎉 [LinguaFlow] Tài khoản học viên của bạn đã được phê duyệt thành công!`)
      : encodeURIComponent(`ℹ️ [LinguaFlow] Thông báo về yêu cầu đăng ký tài khoản`);

    const bodyText = isApproved
      ? `Chào bạn ${fullName},\n\nAdmin đã phê duyệt tài khoản học viên LinguaFlow của bạn thành công!\n\n👉 BẤM VÀO ĐÂY ĐỂ VÀO HỌC NGAY:\n${activationLink}\n\nChúc bạn học tập thật tốt!\nAdmin LinguaFlow (${ADMIN_EMAIL})`
      : `Chào bạn ${fullName},\n\nYêu cầu đăng ký tài khoản của bạn chưa được phê duyệt lúc này. Vui lòng liên hệ Admin qua email ${ADMIN_EMAIL} để biết thêm chi tiết.\n\nTrân trọng,\nAdmin LinguaFlow`;

    return `mailto:${studentEmail}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  }
}

export const authService = new AuthService();
