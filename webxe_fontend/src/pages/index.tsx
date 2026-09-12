import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import styles from '@/pages/TrangChu/trangchu.module.css';
import { vehicles } from '@/TS/vehicleData';
import { newsItems } from '@/TS/newsData';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
const bannerData = {
  video: '/videos/webxe.mp4',
  title: 'SIÊU DEAL CUỐI TUẦN',
  desc: 'Giảm giá lên đến 20% cho các dòng xe',
};

const InteractiveHeroBanner: React.FC = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = React.useState(true); // Khởi tạo mặc định là true để tránh lỗi hydration và an toàn cho autoplay

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const storedMute = localStorage.getItem('banner_muted');
    
    if (storedMute !== null) {
      const shouldMute = storedMute === 'true';
      setIsMuted(shouldMute);
      video.muted = shouldMute;
      void video.play().catch(() => {
        // Nếu user lưu trạng thái bật tiếng nhưng bị trình duyệt chặn, buộc phải chuyển về tắt tiếng
        setIsMuted(true);
        video.muted = true;
        void video.play();
      });
    } else {
      // Chưa có tuỳ chọn của người dùng, thử bật tiếng
      video.muted = false;
      void video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        void video.play();
      });
    }
  }, []);

  // Đồng bộ trạng thái muted vào thẻ video mỗi khi state thay đổi
  React.useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  const handleDoubleClick = () => {
    setIsMuted((prev) => {
      const newState = !prev;
      localStorage.setItem('banner_muted', String(newState));
      return newState;
    });
  };

  return (
    <div
      className={`${styles['hero-banner']} relative w-full overflow-hidden font-sans`}
      onDoubleClick={handleDoubleClick}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={bannerData.video}
        autoPlay
        loop
        muted={isMuted}
        playsInline
      />
      {/* Lớp phủ chặn tương tác trực tiếp với video, chỉ nhận double click */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      <div className={`${styles['hero-content']} pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center`}>
        <div className={`${styles['hero-content-inner']} animate-fadeIn space-y-6 px-4`}>
          <div className="inline-block">
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">✨ Featured Offer</span>
          </div>
          <h1 className={`${styles['hero-title']} text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl`}>{bannerData.title}</h1>
          <p className={`${styles['hero-desc']} text-xl font-light text-gray-200 md:text-2xl`}>{bannerData.desc}</p>
          <button className={`${styles['hero-action']} pointer-events-auto mt-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-emerald-600 hover:to-teal-700`}>Explore Now</button>
        </div>
      </div>
      {/* Chỉ báo trạng thái âm thanh ở góc dưới phải */}
      <div className="absolute bottom-4 right-4 z-30 pointer-events-none rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-white text-sm font-medium flex items-center gap-1.5 transition-opacity duration-300">
        {isMuted ? '🔇 Tắt tiếng' : '🔊 Có tiếng'}
      </div>
    </div>
  );
};

// Dùng chung dữ liệu với trang danh sách và trang chi tiết tin tức.
const newsData = newsItems.slice(0, 5).map(({ id, title, image }) => ({ id, title, image }));

const carsData = vehicles.map(({ id, title, image, priceLabel: price }) => ({ id, title, image, price }));

type ContentItem = { id: number; title: string; image: string; price?: string };

// Small content slider component (reusable)
function ContentSlider({ items, hasPrice }: { items: ContentItem[]; hasPrice?: boolean }){
  const [startIndex, setStartIndex] = React.useState(0);
  const maxVisible = 3;

  const handleNext = () => setStartIndex(prev => (prev < items.length - maxVisible ? prev + 1 : 0));
  const handlePrev = () => setStartIndex(prev => (prev > 0 ? prev - 1 : Math.max(0, items.length - maxVisible)));

  return (
    <div className={styles['news-slider']}>
      <button className={`${styles['slider-arrow']} ${styles['left']}`} onClick={handlePrev} aria-label="prev">◀</button>
      <div className={styles['news-track']} style={{ transform: `translateX(calc(-${startIndex * (100/3)}%))` }}>
        {items.map((it, idx)=>{
          const isActive = idx >= startIndex && idx < startIndex + maxVisible;
          return (
            <Link key={it.id} href={hasPrice ? `/ChiTietXe/ChiTietXe?id=${it.id}` : `/TinTuc/ChiTietTin?id=${it.id}`} className={`${styles['news-card']} ${isActive?styles.active:''}`}>
              <div className={styles['news-img-container']}><img src={it.image} className={styles['news-img']} alt={it.title} /></div>
              <div className={styles['news-content']}>
                <h3 className={styles['news-text']}>{it.title}</h3>
                {hasPrice && <span className={styles['news-price']}>{it.price}</span>}
              </div>
            </Link>
          );
        })}
      </div>
      <button className={`${styles['slider-arrow']} ${styles['right']}`} onClick={handleNext} aria-label="next">▶</button>
    </div>
  );
}

export default function TrangChu(){
  const { user } = useAuth();


  return (
    <div className={styles['main-page']}>
      <Header />

      {/* Interactive Hero Banner */}
      <section>
        <InteractiveHeroBanner />
      </section>

      {/* Content zone */}
      <main className={styles['content-zone']}>
        <section>
          <h2 className={styles['section-title']}>Tin Tức Nổi Bật</h2>
          <ContentSlider items={newsData} />
        </section>

        <section>
          <h2 className={styles['section-title']}>CỬA HÀNG</h2>
          <ContentSlider items={carsData} hasPrice />
        </section>
      </main>

      <Footer />
      <ChatBot vehicles={vehicles} />
    </div>
  );
}
