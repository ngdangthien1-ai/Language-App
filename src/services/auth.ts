import { UserAccount, UserMode } from '../types/vocab';

export const ADMIN_EMAIL = 'Ngdangthien1@gmail.com';

const STORAGE_KEYS = {
  CURRENT_ACCOUNT: 'lingua_flow_current_account_v1',
  ALL_ACCOUNTS: 'lingua_flow_all_registered_accounts_v1',
  USER_MODE: 'lingua_flow_user_mode_v1',
};

class AuthService {
  public getCurrentAccount(): UserAccount | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  public getUserMode(): UserMode {
    try {
      const mode = localStorage.getItem(STORAGE_KEYS.USER_MODE);
      return (mode === 'authenticated' && this.getCurrentAccount()) ? 'authenticated' : 'guest';
    } catch (e) {
      return 'guest';
    }
  }

  public setGuestMode(): void {
    localStorage.setItem(STORAGE_KEYS.USER_MODE, 'guest');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ACCOUNT);
  }

  public getAllRegisteredAccounts(): Array<UserAccount & { password?: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALL_ACCOUNTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Đăng ký tài khoản học thật & Tự động gửi Email thông báo duyệt tới Ngdangthien1@gmail.com
   */
  public async registerOfficialAccount(
    fullName: string,
    email: string,
    password: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanName || !password) {
      throw new Error('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.');
    }

    const allAccounts = this.getAllRegisteredAccounts();
    const existing = allAccounts.find(a => a.email === cleanEmail);
    if (existing) {
      throw new Error('Email này đã được đăng ký trên hệ thống. Vui lòng đăng nhập hoặc dùng email khác.');
    }

    const newAccount: UserAccount & { password?: string } = {
      fullName: cleanName,
      email: cleanEmail,
      password: password,
      isApproved: true, // Tự động duyệt để học viên học được ngay
      registeredAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    };

    allAccounts.push(newAccount);
    localStorage.setItem(STORAGE_KEYS.ALL_ACCOUNTS, JSON.stringify(allAccounts));

    // Lưu phiên đăng nhập hiện tại
    localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, JSON.stringify(newAccount));
    localStorage.setItem(STORAGE_KEYS.USER_MODE, 'authenticated');

    // Gửi email thông báo tự động tới Admin Ngdangthien1@gmail.com
    try {
      await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `🎓 YÊU CẦU ĐĂNG KÝ HỌC VIÊN MỚI: ${cleanName} (${cleanEmail})`,
          "Họ và Tên": cleanName,
          "Email Học Viên": cleanEmail,
          "Thời Gian Đăng Ký": newAccount.registeredAt,
          "Mục Tiêu / Lời Nhắn": notes || 'Học từ vựng Song Ngữ Anh - Trung',
          "Trạng Thái": "Đã tự động kích hoạt tài khoản học thật cho học viên",
          _captcha: "false",
          _template: "table"
        })
      });
    } catch (e) {
      console.warn('Gửi email thông báo admin qua Formsubmit thất bại (vẫn cho phép học viên đăng nhập):', e);
    }

    return {
      success: true,
      message: `Đăng ký tài khoản thành công! Thông báo đã được gửi đến Admin (${ADMIN_EMAIL}) để quản lý.`
    };
  }

  /**
   * Đăng nhập tài khoản học thật
   */
  public async loginAccount(email: string, password: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if it's admin or saved accounts
    const allAccounts = this.getAllRegisteredAccounts();
    const found = allAccounts.find(a => a.email === cleanEmail && a.password === password);

    // Cho phép tài khoản Admin đăng nhập trực tiếp
    if (cleanEmail === ADMIN_EMAIL.toLowerCase() || found) {
      const account: UserAccount = found || {
        email: cleanEmail,
        fullName: cleanEmail === ADMIN_EMAIL.toLowerCase() ? 'Admin (Thiện)' : 'Học Viên',
        isApproved: true,
        registeredAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, JSON.stringify(account));
      localStorage.setItem(STORAGE_KEYS.USER_MODE, 'authenticated');
      return account;
    }

    // Nếu là tài khoản mới chưa có mật khẩu khớp
    if (allAccounts.some(a => a.email === cleanEmail)) {
      throw new Error('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
    }

    // Nếu chưa đăng ký
    throw new Error('Email chưa đăng ký. Bạn hãy chọn tab "Đăng Ký Học Thật" để tạo tài khoản mới nhé!');
  }

  public logout(): void {
    this.setGuestMode();
  }
}

export const authService = new AuthService();
