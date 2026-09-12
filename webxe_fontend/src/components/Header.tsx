import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { vehicles } from '@/TS/vehicleData';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const suggestions = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return [];
    return vehicles.filter((vehicle) => vehicle.title.toLowerCase().includes(normalizedTerm)).slice(0, 6);
  }, [searchTerm]);

  return (
    <header className="header-container">
      {/* Header Top: Logo, Search, Icons, Profile */}
      <div className="header-top">
        {/* Nút hamburger chỉ hiển thị trên mobile để mở menu dọc. */}
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Logo */}
        <Link href="/" className="logo-text" style={{ textDecoration: 'none' }}>
          TEAM BẤT ỔN
        </Link>

        {/* Khung giữa: Thanh tìm kiếm & Icons xe */}
        <div className="header-middle">
          {/* Ô tìm kiếm dạng thu gọn (hiện ra khi di chuột) */}
          <div className="search-container">
            <input
              type="search"
              className="search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Tìm kiếm xe"
              aria-controls="vehicle-search-suggestions"
            />
            <button className="search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            {searchTerm.trim() && (
              <div className="search-suggestions" id="vehicle-search-suggestions">
                {suggestions.length ? suggestions.map((vehicle) => (
                  <Link
                    href={`/ChiTietXe/ChiTietXe?id=${vehicle.id}`}
                    className="search-suggestion"
                    key={vehicle.id}
                    onClick={() => setSearchTerm('')}
                  >
                    <span className="search-suggestion-name">{vehicle.title}</span>
                    <img src={vehicle.image} alt="" className="search-suggestion-image" />
                  </Link>
                )) : <p className="search-empty">Không tìm thấy xe phù hợp.</p>}
              </div>
            )}
          </div>

          {/* Các Icon phương tiện */}
          <div className="vehicle-icons">
            {/* Mỗi icon truyền loại xe sang trang mua bán để lọc sẵn danh sách. */}
            <Link href="/MuaBanXe/MuaBanXe?type=%C3%94%20t%C3%B4" className="vehicle-item" aria-label="Xem xe ô tô">
              <svg className="vehicle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21v-3.6a2.8 2.8 0 0 1 2.2-2.7l7.1-1.6 5.4-6.1A4.2 4.2 0 0 1 22 5.6h18.2a5.2 5.2 0 0 1 3.8 1.6l5.4 5.9 7 1.6a2.8 2.8 0 0 1 2.2 2.7V21H4Z"/><path d="m16 12.8 4.6-4.5a3 3 0 0 1 2-.8h16.2a3.7 3.7 0 0 1 2.7 1.1l4.4 4.2H16Z"/><path d="M31.8 7.5v5.3M11 16.2h5m32 0h5M21 17h22"/><path d="M6 20h7m38 0h7"/><circle cx="16" cy="21" r="4.5" fill="currentColor"/><circle cx="48" cy="21" r="4.5" fill="currentColor"/><circle cx="16" cy="21" r="1.7" fill="white" stroke="none"/><circle cx="48" cy="21" r="1.7" fill="white" stroke="none"/><path d="M8 16.5h3M53 16.5h3"/></svg>
              <span className="vehicle-name">Ô tô</span>
            </Link>
            <Link href="/MuaBanXe/MuaBanXe?type=Xe%20m%C3%A1y" className="vehicle-item" aria-label="Xem xe máy">
              <svg className="vehicle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="22" r="5"/><circle cx="54" cy="22" r="5"/><circle cx="10" cy="22" r="1.5"/><circle cx="54" cy="22" r="1.5"/><path d="M10 22h12l7.2-11h10l14.8 11M22 22 15.5 11h10.2l7.5 11"/><path d="M29.2 11h-7.5l-3.2-4h10.4l4.2 4"/><path d="m39.2 11 3.2-5.5h5.2M42.4 5.5l3 3M31 11l-2.5 8h10.2l3.4-8"/><path d="M31.4 14.2h7.8M38.7 19H47l4.5 3M18 22h-5M55 22h5"/></svg>
              <span className="vehicle-name">Xe máy</span>
            </Link>
            <Link href="/MuaBanXe/MuaBanXe?type=Xe%20moto" className="vehicle-item" aria-label="Xem xe mô tô">
              <svg className="vehicle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="22" r="5"/><circle cx="55" cy="22" r="5"/><circle cx="9" cy="22" r="1.5"/><circle cx="55" cy="22" r="1.5"/><path d="M9 22h13l6.5-12h10l16.5 12M22 22l5-11h12l8 11"/><path d="M27 11h-8l-4 5.5M34.5 10l4.5-5h7l2.5 3.5M39 5l3 3"/><path d="m27 11 6.2-3 9.5 2.2-3.2 7.3H27"/><path d="M30 13.2h9M39.5 17.5l5 4.5M14 22h-7M58 22h4"/><path d="M48 18h7l4 2.2"/></svg>
              <span className="vehicle-name">Mô tô</span>
            </Link>
          </div>
        </div>

        {/* Icon Tài khoản & Giỏ hàng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {cartCount > 0 && (
            <span style={{ background: '#e53e3e', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {cartCount}
            </span>
          )}
          <button className="profile-icon" onClick={() => {
            if (isAuthenticated) {
              sessionStorage.setItem('profileReturnPath', router.asPath);
              router.push('/ThongTinCaNhan/Profile');
            } else {
              router.push('/Login/Login');
            }
          }} aria-label="profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          {isAdmin && (
            <Link href="/DatabaseDashboard/DatabaseDashboard" className="admin-dashboard-link" aria-label="Mở trang quản trị dữ liệu">
              ⚙
            </Link>
          )}
        </div>
      </div>

      {/* Thanh Menu dưới */}
      <nav className={`header-nav ${isMenuOpen ? 'header-nav-open' : ''}`}>
        <div className="nav-item">
          <Link href="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Trang Chủ</Link>
        </div>
        <div className="nav-item">
          <Link href="/MuaBanXe/MuaBanXe" className="nav-link" onClick={() => setIsMenuOpen(false)}>CỬA HÀNG</Link>
        </div>
        <div className="nav-item">
          <Link href="/TinTuc/TinTuc" className="nav-link" onClick={() => setIsMenuOpen(false)}>Tin tức</Link>
        </div>
        <div className="nav-item">
          <Link href="/Information_AboutUs/AboutUs" className="nav-link" onClick={() => setIsMenuOpen(false)}>Information</Link>
          <div className="dropdown-menu">
            <Link href="/Information_AboutUs/AboutUs" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>About Us</Link>
          </div>
        </div>
        <div className="nav-item">
          <Link href="/LienHe/LienHe" className="nav-link" onClick={() => setIsMenuOpen(false)}>Liên Hệ</Link>
        </div>
      </nav>
    </header>
  );
}
