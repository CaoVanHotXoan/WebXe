import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { vehicles } from '@/TS/vehicleData';

export default function Header() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const suggestions = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return [];
    return vehicles.filter((vehicle) => vehicle.title.toLowerCase().includes(normalizedTerm)).slice(0, 6);
  }, [searchTerm]);

  return (
    <header className="header-container">
      {/* Header Top: Logo, Search, Icons, Profile */}
      <div className="header-top">
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
            <div className="vehicle-item">
              <svg className="vehicle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M5 8v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
              <span className="vehicle-name">Ô tô</span>
            </div>
            <div className="vehicle-item">
              <svg className="vehicle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M5 15h14"/><path d="M12 15V9a3 3 0 0 1 3-3h2"/><path d="M12 9H8a2 2 0 0 0-2 2v4"/></svg>
              <span className="vehicle-name">Xe máy</span>
            </div>
            <div className="vehicle-item">
              <svg className="vehicle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 14h12"/><path d="M14 14l-2-6h-3l-2 6"/><path d="M10 8V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"/></svg>
              <span className="vehicle-name">Mô tô</span>
            </div>
          </div>
        </div>

        {/* Icon Tài khoản: điều hướng tới /ThongTinCaNhan nếu đã đăng nhập, ngược lại tới /Login/login */}
        <button className="profile-icon" onClick={() => {
          const auth = typeof window !== 'undefined' ? localStorage.getItem('auth') : null;
          if (auth === 'true') {
            // Lưu trang hiện tại để nút quay lại trong Profile trở về đúng ngữ cảnh.
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
      </div>

      {/* Thanh Menu dưới */}
      <nav className="header-nav">
        <div className="nav-item">
          <Link href="/" className="nav-link">Trang Chủ</Link>
        </div>
        <div className="nav-item">
          <Link href="/MuaBanXe/MuaBanXe" className="nav-link">Mua Bán</Link>
        </div>
        <div className="nav-item">
          <Link href="/TinTuc/TinTuc" className="nav-link">Tin tức</Link>
        </div>
        <div className="nav-item">
          <Link href="#" className="nav-link">Information</Link>
          {/* Dropdown Ẩn */}
          <div className="dropdown-menu">
            <Link href="/Information_AboutUs/AboutUs" className="dropdown-item">About Us</Link>
          </div>
        </div>
        <div className="nav-item">
          <Link href="/LienHe/LienHe" className="nav-link">Liên Hệ</Link>
        </div>
      </nav>
    </header>
  );
}
