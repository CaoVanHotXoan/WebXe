import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './login.module.css';

// Khai báo các chế độ của Form
type FormMode = 'login' | 'register' | 'forgot_password';

export default function LoginPage() {
  const router = useRouter();
  // Trạng thái lưu chế độ hiện tại (đăng nhập, đăng ký, quên mật khẩu)
  const [mode, setMode] = useState<FormMode>('login');

  // Trạng thái lưu trữ giá trị nhập vào
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Trạng thái lưu lỗi
  const [error, setError] = useState('');
  // Trạng thái thông báo thành công
  const [successMsg, setSuccessMsg] = useState('');

  // Hàm chuyển đổi chế độ Form và reset state
  const switchMode = (newMode: FormMode) => {
    setMode(newMode);
    setAccount('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
  };

  // Hàm kiểm tra tính hợp lệ của dữ liệu đầu vào
  const validateForm = () => {
    setError('');
    setSuccessMsg('');

    // Kiểm tra tài khoản: số điện thoại hoặc email Gmail hợp lệ.
    const normalizedAccount = account.trim();
    const isPhone = /^\d+$/.test(normalizedAccount);
    if (!normalizedAccount) {
      setError('Vui lòng nhập email hoặc số điện thoại');
      return false;
    }
    if (isPhone && normalizedAccount.length < 10) {
      setError('Số điện thoại phải có ít nhất 10 chữ số');
      return false;
    }
    if (!isPhone && !/^[^\s@]+@gmail\.com$/i.test(normalizedAccount)) {
      setError('Email phải có định dạng và kết thúc bằng @gmail.com');
      return false;
    }

    // Nếu không phải quên mật khẩu thì kiểm tra mật khẩu
    if (mode !== 'forgot_password') {
      if (!password) {
        setError('Vui lòng nhập mật khẩu');
        return false;
      }
      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return false;
      }

      // Kiểm tra xác nhận mật khẩu khi đăng ký
      if (mode === 'register' && password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return false;
      }
    }

    return true;
  };

  // Hàm xử lý Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Giả lập chức năng xử lý
    if (mode === 'login') {
      // Logic đăng nhập: đặt flag auth và profile demo, chuyển về TrangChu
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', 'true');
        const isPhone = /^\d+$/.test(account);
        const profile = {
          name: isPhone ? ('Người dùng ' + account.slice(-4)) : account.split('@')[0] || account,
          phone: isPhone ? account : '',
          email: isPhone ? '' : account,
        };
        try { localStorage.setItem('profile', JSON.stringify(profile)); } catch {}
      }
      setSuccessMsg('Đăng nhập thành công!');
      // Trang chủ được định tuyến từ src/pages/index.tsx nên URL là "/".
      router.replace('/');
    } else if (mode === 'register') {
      // Logic đăng ký
      setSuccessMsg('Tạo tài khoản thành công! Vui lòng đăng nhập.');
      setTimeout(() => switchMode('login'), 2000); // Chuyển về màn hình đăng nhập sau 2s
    } else if (mode === 'forgot_password') {
      // Logic đổi mật khẩu
      setSuccessMsg('Đã gửi yêu cầu đổi mật khẩu đến ' + account);
    }
  };

  return (
    <div className={styles['login-container']}>
      {/* Khung layout đăng nhập (bán trong suốt, hiệu ứng kính) */}
      <div className={styles['glass-panel']}>
        <h2 className={styles['title']}>
          {mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : 'Khôi phục'}
        </h2>

        {/* Hiển thị thông báo thành công */}
        {successMsg && (
          <div className={styles['success-message']}>
            <svg style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Input Email / Số điện thoại */}
          <div className={styles['input-group']}>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="Email hoặc Số điện thoại..."
              className={styles['input-field']}
            />
            {/* SVG Icon User */}
            <svg className={styles['input-icon']} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>

          {/* Input Mật khẩu (ẩn nếu ở chế độ quên mật khẩu) */}
          {mode !== 'forgot_password' && (
            <div className={styles['input-group']}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu..."
                className={styles['input-field']}
              />
              {/* SVG Icon Lock */}
              <svg className={styles['input-icon']} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          )}

          {/* Input Xác nhận mật khẩu (chỉ hiển thị khi đăng ký) */}
          {mode === 'register' && (
            <div className={styles['input-group']}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu..."
                className={styles['input-field']}
              />
              {/* SVG Icon Shield */}
              <svg className={styles['input-icon']} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
          )}

          {/* Hiển thị lỗi */}
          {error && (
            <div className={styles['error-text']}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}

          {/* Điều hướng "Quên mật khẩu" */}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: '0.5rem', marginBottom: '1rem' }}>
              <button 
                type="button" 
                onClick={() => switchMode('forgot_password')}
                className={styles['forgot-password-link']}
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          {/* Nút Submit chính */}
          <button type="submit" className={styles['action-btn']}>
            {mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký ngay' : 'Gửi yêu cầu'}
          </button>
        </form>

        {/* Chuyển đổi giữa Đăng nhập / Đăng ký */}
        <div className={styles['switch-mode-text']}>
          {mode === 'login' ? (
            <>
              Chưa có tài khoản? 
              <button 
                type="button"
                onClick={() => switchMode('register')}
                className={styles['switch-mode-btn']}
              >
                Đăng ký
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản? 
              <button 
                type="button"
                onClick={() => switchMode('login')}
                className={styles['switch-mode-btn']}
              >
                Quay lại
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
