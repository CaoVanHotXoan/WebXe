import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import styles from '@/pages/TrangChu/trangchu.module.css';
import { useAutoSlider } from '@/TS/sliderLogic';
import { vehicles } from '@/TS/vehicleData';
import { newsItems } from '@/TS/newsData';
import Link from 'next/link';
import gsap from 'gsap';

<<<<<<< Updated upstream
// Register GSAP plugins
gsap.registerPlugin();
=======
const InteractiveHeroBanner: React.FC = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = React.useState(true); // Khởi tạo mặc định là true để tránh lỗi hydration và an toàn cho autoplay
>>>>>>> Stashed changes

// Sample data for banners, news, and cars
const bannerData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1503376712344-652d0f440f5a?auto=format&fit=crop&w=1920&q=80', video: '/videos/webxe.mp4', title: 'SIÊU DEAL CUỐI TUẦN', desc: 'Giảm giá lên đến 20% cho các dòng xe' },
  { id: 2, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=80', title: 'MERCEDES AMG G63', desc: 'Trải nghiệm đỉnh cao cùng ông vua địa hình.' },
  { id: 3, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1920&q=80', title: 'KHÁM PHÁ DÒNG XE MỚI', desc: 'Dòng xe máy tiết kiệm xăng nhất năm 2026.' }
];

<<<<<<< Updated upstream
// Interactive Hero Banner Component with GSAP Morphing
const InteractiveHeroBanner: React.FC<{ slides: typeof bannerData }> = ({ slides }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isAutoplay, setIsAutoplay] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const thumbnailRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const morphTimelineRef = React.useRef<gsap.core.Timeline | null>(null);

  // Content morph-out animation
  const morphOutContent = React.useCallback(() => {
    if (!contentRef.current) return;
    
    return gsap.to(contentRef.current, {
      opacity: 0,
      y: -30,
      duration: 0.4,
      ease: 'power2.inOut',
    });
  }, []);

  // Content morph-in animation
  const morphInContent = React.useCallback(() => {
    if (!contentRef.current) return;
    
    contentRef.current.style.opacity = '0';
    contentRef.current.style.transform = 'translateY(-30px)';
    
    return gsap.to(contentRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      delay: 0.2,
    });
  }, []);

  // Smooth background image transition
  const morphBackgroundImage = React.useCallback((newIndex: number) => {
    if (!containerRef.current) return Promise.resolve();

    return new Promise((resolve) => {
      // Create overlay for smooth image transition
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        inset: 0;
        background-image: url('${slides[newIndex].image}');
        background-size: cover;
        background-position: center;
        opacity: 0;
        z-index: 5;
        pointer-events: none;
      `;
      containerRef.current?.appendChild(overlay);

      // Animate overlay in
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.backgroundImage = `url('${slides[newIndex].image}')`;
            overlay.remove();
          }
          resolve(null);
        },
      });
    });
  }, [slides]);

  // Thumbnail morphing animation
  const morphFromThumbnail = React.useCallback((index: number) => {
    if (!thumbnailRefs.current[index] || !containerRef.current) return Promise.resolve();

    return new Promise((resolve) => {
      const thumbnail = thumbnailRefs.current[index];
      if (!thumbnail) {
        resolve(null);
        return;
      }

      const thumbnailRect = thumbnail.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();

      // Create morph element
      const morphElement = document.createElement('div');
      morphElement.style.cssText = `
        position: fixed;
        top: ${thumbnailRect.top}px;
        left: ${thumbnailRect.left}px;
        width: ${thumbnailRect.width}px;
        height: ${thumbnailRect.height}px;
        background-image: url('${slides[index].image}');
        background-size: cover;
        background-position: center;
        border-radius: 8px;
        z-index: 25;
        pointer-events: none;
        will-change: transform, border-radius;
      `;
      document.body.appendChild(morphElement);

      // Animate morph
      gsap.to(morphElement, {
        top: containerRect.top,
        left: containerRect.left,
        width: containerRect.width,
        height: containerRect.height,
        borderRadius: '0px',
        duration: 0.7,
        ease: 'power4.inOut',
        onComplete: () => {
          morphElement.remove();
          resolve(null);
        },
      });
    });
  }, [slides]);

  const handleSlideChange = React.useCallback(async (newIndex: number) => {
    // Cancel ongoing animation
    if (morphTimelineRef.current) {
      morphTimelineRef.current.kill();
    }

    // Morph out content
    await morphOutContent();

    // Change background and morph
    await morphBackgroundImage(newIndex);

    // Morph in new content
    await morphInContent();

    setActiveIndex(newIndex);
  }, [morphOutContent, morphBackgroundImage, morphInContent]);

  const handleNext = React.useCallback(() => {
    const newIndex = (activeIndex + 1) % slides.length;
    handleSlideChange(newIndex);
    setProgress(0);
    setIsAutoplay(true);
  }, [activeIndex, slides.length, handleSlideChange]);

  const handlePrev = React.useCallback(() => {
    const newIndex = (activeIndex - 1 + slides.length) % slides.length;
    handleSlideChange(newIndex);
    setProgress(0);
    setIsAutoplay(true);
  }, [activeIndex, slides.length, handleSlideChange]);

  const handleThumbnailClick = React.useCallback((index: number) => {
    if (index !== activeIndex) {
      // Trigger morph from thumbnail
      morphFromThumbnail(index).then(() => {
        handleSlideChange(index);
      });
    }
    setProgress(0);
    setIsAutoplay(true);
  }, [activeIndex, morphFromThumbnail, handleSlideChange]);

  // Auto-play logic
  React.useEffect(() => {
    if (!isAutoplay) return;

    const startTime = Date.now();
    const duration = 5000;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress((elapsed % duration) / duration);
    }, 16);

    timerRef.current = setTimeout(() => {
      handleNext();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [activeIndex, isAutoplay, handleNext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles['hero-banner']} relative w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden font-sans`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        backgroundImage: `url('${slides[activeIndex].image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0s ease-in-out',
      }}
    >
      {slides[activeIndex].video && (
        /* Video chạy nền không âm thanh để không làm gián đoạn trải nghiệm. */
        <video
          key={slides[activeIndex].video}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={slides[activeIndex].video}
          poster={slides[activeIndex].image}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 z-10" />

      {/* Main content - animated text */}
      <div 
        ref={contentRef}
        className={`${styles['hero-content']} absolute inset-0 flex flex-col items-center justify-center z-20 text-center`}
      >
        <div className={`${styles['hero-content-inner']} space-y-6 max-w-4xl px-4 animate-fadeIn`}>
=======
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
>>>>>>> Stashed changes
          <div className="inline-block">
            <span className="text-sm font-semibold tracking-widest text-emerald-400 uppercase">
              ✨ Featured Offer
            </span>
          </div>
          <h1 className={`${styles['hero-title']} text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight`}>
            {slides[activeIndex].title}
          </h1>
          <p className={`${styles['hero-desc']} text-xl md:text-2xl text-gray-200 font-light`}>
            {slides[activeIndex].desc}
          </p>
          <button className={`${styles['hero-action']} mt-8 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-full hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:scale-105`}>
            Explore Now
          </button>
        </div>
      </div>
<<<<<<< Updated upstream

      {/* Thumbnail cards - bottom right */}
      <div className={`${styles['hero-thumbnails']} absolute bottom-8 right-8 z-30 flex gap-3 md:gap-4`}>
        {slides.map((slide, idx) => (
          <button
            ref={(el) => {
              thumbnailRefs.current[idx] = el;
            }}
            key={idx}
            onClick={() => handleThumbnailClick(idx)}
            className={`
              relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer
              transition-all duration-300 transform hover:scale-110
              ${idx === activeIndex ? 'ring-2 ring-emerald-400 scale-110' : 'opacity-60 hover:opacity-100'}
              backdrop-blur-sm border border-white/20
            `}
            style={{
              backgroundImage: `url('${slide.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              willChange: 'transform',
            }}
          >
            {idx === activeIndex && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-1">
                <span className="text-xs font-bold text-white">{idx + 1}/{slides.length}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Controls - bottom left glassmorphism buttons */}
      <div className={`${styles['hero-controls']} absolute bottom-8 left-8 z-30 flex gap-4`}>
        <button
          onClick={handlePrev}
          className="p-3 md:p-4 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
          aria-label="Previous"
          title="Previous (← arrow)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setIsAutoplay(!isAutoplay)}
          className="p-3 md:p-4 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
          aria-label="Toggle autoplay"
          title="Toggle autoplay"
        >
          {isAutoplay ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          onClick={handleNext}
          className="p-3 md:p-4 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
          aria-label="Next"
          title="Next (→ arrow)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-75"
          style={{ width: `${(progress) * 100}%` }}
        />
      </div>

      {/* Slide counter */}
      <div className={`${styles['hero-counter']} absolute top-8 right-8 z-30 text-white/80 text-sm font-mono tracking-wider`}>
        {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
=======
      {/* Chỉ báo trạng thái âm thanh ở góc dưới phải */}
      <div className="absolute bottom-4 right-4 z-30 pointer-events-none rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-white text-sm font-medium flex items-center gap-1.5 transition-opacity duration-300">
        {isMuted ? '🔇 Tắt tiếng' : '🔊 Có tiếng'}
>>>>>>> Stashed changes
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
  return (
    <div className={styles['main-page']}>
      <Header />

      {/* Interactive Hero Banner */}
      <section>
        <InteractiveHeroBanner slides={bannerData} />
      </section>

      {/* Content zone */}
      <main className={styles['content-zone']}>
        <section>
          <h2 className={styles['section-title']}>Tin Tức Nổi Bật</h2>
          <ContentSlider items={newsData} />
        </section>

        <section>
          <h2 className={styles['section-title']}>Tin Bán Xe</h2>
          <ContentSlider items={carsData} hasPrice />
        </section>
      </main>

      <Footer />
      <ChatBot vehicles={vehicles} />
    </div>
  );
}
