import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/pages/TrangChu/trangchu.module.css';
import { useAutoSlider } from '@/TS/sliderLogic';
import { vehicles } from '@/TS/vehicleData';
import { newsItems } from '@/TS/newsData';
import Link from 'next/link';

// Sample data for banners, news, and cars
const bannerData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1503376712344-652d0f440f5a?auto=format&fit=crop&w=1920&q=80', title: 'SIÊU DEAL CUỐI TUẦN', desc: 'Giảm giá lên đến 20% cho các dòng xe' },
  { id: 2, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=80', title: 'MERCEDES AMG G63', desc: 'Trải nghiệm đỉnh cao cùng ông vua địa hình.' },
  { id: 3, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1920&q=80', title: 'KHÁM PHÁ DÒNG XE MỚI', desc: 'Dòng xe máy tiết kiệm xăng nhất năm 2026.' }
];

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
  const { currentIndex, nextSlide, prevSlide } = useAutoSlider(bannerData.length, 5000);

  return (
    <div className={styles['main-page']}>
      <Header />

      {/* Banner */}
      <section className={styles['banner-wrapper']}>
        <button className={`${styles['arrow-btn']} ${styles['left']}`} onClick={prevSlide}>◀</button>
        <div className={styles['banner-track']} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {bannerData.map(b => (
            <div key={b.id} className={styles['banner-slide']}>
              <img src={b.image} className={styles['banner-img']} alt={b.title} />
              <div className={styles['banner-overlay']}>
                <h1 className={styles['banner-title']}><span>{b.title.split(' ')[0]}</span> {b.title.substring(b.title.indexOf(' ')+1)}</h1>
                <p className={styles['banner-desc']}>{b.desc}</p>
                <button className={styles['banner-btn']}>XEM CHI TIẾT</button>
              </div>
            </div>
          ))}
        </div>
        <button className={`${styles['arrow-btn']} ${styles['right']}`} onClick={nextSlide}>▶</button>
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
    </div>
  );
}
