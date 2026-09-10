import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BACKEND_URL } from '@/services/api';
import styles from './profile.module.css';

type ActiveTab = 'account' | 'notifications' | 'password';

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const defaultProfile: ProfileData = {
  name: 'Người dùng',
  email: '',
  phone: '',
  address: 'Chưa cập nhật',
};

const menuItems: { id: ActiveTab; label: string; icon: string }[] = [
  { id: 'account', label: 'Thông tin tài khoản', icon: '◉' },
  { id: 'notifications', label: 'Thông báo', icon: '♢' },
  { id: 'password', label: 'Đổi mật khẩu', icon: '▣' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, logoutUser, updateProfileState, status } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('account');
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [draftProfile, setDraftProfile] = useState<ProfileData>(defaultProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordStep, setPasswordStep] = useState<'form' | 'otp'>('form');
  const [passwordOtp, setPasswordOtp] = useState('');

  // Quay lại trang đã mở Profile
  const handleBack = () => {
    const returnPath = typeof window !== 'undefined' ? (sessionStorage.getItem('profileReturnPath') || '/') : '/';
    if (typeof window !== 'undefined') sessionStorage.removeItem('profileReturnPath');
    router.push(returnPath);
  };

  // Synchronize profile state with domain AuthContext
  useEffect(() => {
    if (status === 'loading') return;
    if (user) {
      const merged: ProfileData = {
        name: user.name || user.username || defaultProfile.name,
        email: user.email || defaultProfile.email,
        phone: user.phone || defaultProfile.phone,
        address: user.address || defaultProfile.address,
      };
      setProfile(merged);
      setDraftProfile(merged);
    }
  }, [user, status]);

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'U';

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3500);
  };

  // Lưu hồ sơ mới vào domain state và safe storage
  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftProfile.name.trim() || !draftProfile.email.trim()) {
      showMessage('Vui lòng nhập tên và email.');
      return;
    }

    setProfile(draftProfile);
    updateProfileState({
      ...user,
      name: draftProfile.name,
      email: draftProfile.email,
      phone: draftProfile.phone,
      address: draftProfile.address,
    });
    setIsEditOpen(false);
    showMessage('Thông tin tài khoản đã được cập nhật.');
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      showMessage('Vui lòng nhập đầy đủ thông tin mật khẩu.');
      return;
    }
    if (passwords.next.length < 6) {
      showMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      showMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!token) {
      showMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    const submitPasswordChange = async () => {
      try {
        const endpoint = passwordStep === 'form' ? '/password/change/request-otp' : '/password/change';
        const body = passwordStep === 'form'
          ? undefined
          : JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next, otp: passwordOtp });
        const response = await fetch(`${BACKEND_URL}/api/auth${endpoint}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
          body,
        });
        const data = await response.json() as { message?: string };
        if (!response.ok) throw new Error(data.message || 'Không thể xử lý yêu cầu.');
        if (passwordStep === 'form') {
          setPasswordStep('otp');
          showMessage(data.message || 'Mã xác nhận đã được gửi đến Gmail.');
        } else {
          setPasswords({ current: '', next: '', confirm: '' });
          setPasswordOtp('');
          setPasswordStep('form');
          showMessage(data.message || 'Đổi mật khẩu thành công.');
        }
      } catch (requestError) {
        showMessage(requestError instanceof Error ? requestError.message : 'Không thể kết nối máy chủ.');
      }
    };
    void submitPasswordChange();
  };

  // Xóa phiên đăng nhập bằng domain logoutUser
  const handleLogout = () => {
    logoutUser();
    router.replace('/Login/Login');
  };

  return (
    <ProtectedRoute>
      <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button type="button" className={styles.backButton} onClick={handleBack} aria-label="Quay lại trang trước">
            ←
          </button>
          <div>
            <p className={styles.eyebrow}>TÀI KHOẢN CỦA BẠN</p>
            <h1>Thông tin cá nhân</h1>
          </div>
          <button className={styles.logoutTop} onClick={handleLogout}>Đăng xuất</button>
        </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.userCard}>
              <div className={styles.avatar}>{initials}</div>
              <div>
                <p className={styles.userName}>{profile.name}</p>
                <p className={styles.userEmail}>{profile.email || 'Chưa cập nhật email'}</p>
              </div>
            </div>

            <nav className={styles.menu} aria-label="Danh mục tài khoản">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.menuItem} ${activeTab === item.id ? styles.menuItemActive : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
                  {item.label}
                  <span className={styles.menuArrow}>→</span>
                </button>
              ))}
            </nav>
            <p className={styles.sidebarNote}>Quản lý thông tin và bảo mật tài khoản của bạn.</p>
          </aside>

          <section className={styles.content}>
            {message && <div className={styles.toast} role="status">{message}</div>}

            {activeTab === 'account' && (
              <div className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div>
                    <p className={styles.eyebrow}>HỒ SƠ</p>
                    <h2>Thông tin tài khoản</h2>
                  </div>
                  <span className={styles.status}>● Đang hoạt động</span>
                </div>
                <div className={styles.profileHero}>
                  <div className={styles.largeAvatar}>{initials}</div>
                  <div>
                    <h3>{profile.name}</h3>
                    <p>Thành viên WebXe</p>
                  </div>
                </div>
                <div className={styles.infoGrid}>
                  <InfoItem label="Họ và tên" value={profile.name} />
                  <InfoItem label="Email" value={profile.email || 'Chưa cập nhật'} />
                  <InfoItem label="Số điện thoại" value={profile.phone || 'Chưa cập nhật'} />
                  <InfoItem label="Địa chỉ" value={profile.address} />
                </div>
                <div className={styles.actions}>
                  <button className={styles.primaryButton} onClick={() => { setDraftProfile(profile); setIsEditOpen(true); }}>
                    Cập nhật thông tin
                  </button>
                  <button className={styles.secondaryButton} onClick={handleLogout}>Đăng xuất</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div><p className={styles.eyebrow}>TIN MỚI</p><h2>Thông báo</h2></div>
                  <span className={styles.badge}>0 mới</span>
                </div>
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>♢</span>
                  <h3>Chưa có thông báo</h3>
                  <p>Các cập nhật mới về tài khoản và đơn hàng sẽ xuất hiện tại đây.</p>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div><p className={styles.eyebrow}>BẢO MẬT</p><h2>Đổi mật khẩu</h2></div>
                </div>
                <p className={styles.description}>Sử dụng mật khẩu mạnh và không chia sẻ mật khẩu với người khác.</p>
                <form className={styles.form} onSubmit={handlePasswordSubmit}>
                  <PasswordField label="Mật khẩu hiện tại" value={passwords.current} onChange={(value) => setPasswords({ ...passwords, current: value })} />
                  <PasswordField label="Mật khẩu mới" value={passwords.next} onChange={(value) => setPasswords({ ...passwords, next: value })} />
                  <PasswordField label="Xác nhận mật khẩu mới" value={passwords.confirm} onChange={(value) => setPasswords({ ...passwords, confirm: value })} />
                  {passwordStep === 'otp' && <PasswordField label="Mã xác nhận Gmail" value={passwordOtp} onChange={setPasswordOtp} />}
                  <button className={styles.primaryButton} type="submit">{passwordStep === 'otp' ? 'Xác nhận và lưu' : 'Gửi mã xác nhận'}</button>
                </form>
              </div>
            )}
          </section>
        </div>
      </div>

      {isEditOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsEditOpen(false); }}>
          <form className={styles.modal} onSubmit={handleProfileSubmit}>
            <div className={styles.modalHeading}><div><p className={styles.eyebrow}>HỒ SƠ</p><h2>Cập nhật thông tin</h2></div><button type="button" className={styles.closeButton} onClick={() => setIsEditOpen(false)}>×</button></div>
            <label className={styles.field}>Tên<input value={draftProfile.name} onChange={(event) => setDraftProfile({ ...draftProfile, name: event.target.value })} /></label>
            <label className={styles.field}>Email<input type="email" value={draftProfile.email} onChange={(event) => setDraftProfile({ ...draftProfile, email: event.target.value })} /></label>
            <label className={styles.field}>Số điện thoại<input value={draftProfile.phone} onChange={(event) => setDraftProfile({ ...draftProfile, phone: event.target.value })} /></label>
            <label className={styles.field}>Địa chỉ<input value={draftProfile.address} onChange={(event) => setDraftProfile({ ...draftProfile, address: event.target.value })} /></label>
            <button className={styles.primaryButton} type="submit">LƯU THÔNG TIN</button>
          </form>
        </div>
      )}
    </main>
    </ProtectedRoute>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return <div className={styles.infoItem}><span>{label}</span><strong>{value}</strong></div>;
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className={styles.field}>{label}<input type="password" value={value} onChange={(event) => onChange(event.target.value)} placeholder="••••••••" /></label>;
}