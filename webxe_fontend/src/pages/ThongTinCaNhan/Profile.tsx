import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('account');
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [draftProfile, setDraftProfile] = useState<ProfileData>(defaultProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  // Quay lại trang đã mở Profile, dùng trang chủ làm dự phòng khi không có lịch sử.
  const handleBack = () => {
    const returnPath = sessionStorage.getItem('profileReturnPath') || '/';
    sessionStorage.removeItem('profileReturnPath');
    router.push(returnPath);
  };

  // Bảo vệ route và đọc dữ liệu hồ sơ sau khi component chạy ở trình duyệt.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localStorage.getItem('auth') !== 'true') {
        router.replace('/Login/Login');
        return;
      }

      const savedProfile = localStorage.getItem('profile');
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile) as Partial<ProfileData>;
          const loadedProfile = { ...defaultProfile, ...parsedProfile };
          setProfile(loadedProfile);
          setDraftProfile(loadedProfile);
        } catch {
          setMessage('Không thể đọc thông tin tài khoản.');
        }
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  // Hiển thị tên viết tắt để avatar vẫn đẹp khi người dùng chưa có ảnh thật.
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

  // Lưu hồ sơ mới vào state và localStorage.
  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftProfile.name.trim() || !draftProfile.email.trim()) {
      showMessage('Vui lòng nhập tên và email.');
      return;
    }

    setProfile(draftProfile);
    localStorage.setItem('profile', JSON.stringify(draftProfile));
    setIsEditOpen(false);
    showMessage('Thông tin tài khoản đã được cập nhật.');
  };

  // Kiểm tra hai mật khẩu mới trước khi lưu.
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

    setPasswords({ current: '', next: '', confirm: '' });
    showMessage('Đổi mật khẩu thành công.');
  };

  // Xóa phiên đăng nhập rồi chuyển về trang Login.
  const handleLogout = () => {
    localStorage.removeItem('auth');
    router.replace('/Login/Login');
  };

  return (
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
                  <button className={styles.primaryButton} type="submit">Lưu mật khẩu</button>
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
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return <div className={styles.infoItem}><span>{label}</span><strong>{value}</strong></div>;
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className={styles.field}>{label}<input type="password" value={value} onChange={(event) => onChange(event.target.value)} placeholder="••••••••" /></label>;
}