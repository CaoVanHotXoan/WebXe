import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Vehicle, vehicles } from '@/TS/vehicleData';
import { newsItems } from '@/TS/newsData';
import styles from './chiTietXe.module.css';

type SliderItem = { title: string; image: string; href: string };

function ContentSlider({ items }: { items: SliderItem[] }) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleItems = 2;
  const maxIndex = Math.max(0, items.length - visibleItems);

  return (
    <div className={styles.slider}>
      <button type="button" className={`${styles.sliderArrow} ${styles.sliderLeft}`} onClick={() => setStartIndex((index) => (index > 0 ? index - 1 : maxIndex))} aria-label="Tin trước">‹</button>
      <div className={styles.sliderViewport}>
        <div className={styles.sliderTrack} style={{ transform: `translateX(-${startIndex * (100 / visibleItems)}%)` }}>
          {items.map((item) => <Link href={item.href} className={styles.newsLink} key={item.title}><img className={styles.newsImage} src={item.image} alt={item.title} /><h3>{item.title}</h3></Link>)}
        </div>
      </div>
      <button type="button" className={`${styles.sliderArrow} ${styles.sliderRight}`} onClick={() => setStartIndex((index) => (index < maxIndex ? index + 1 : 0))} aria-label="Tin tiếp theo">›</button>
    </div>
  );
}

function getSpecs(vehicle: Vehicle) {
  return vehicle.type === 'Ô tô'
    ? [['Dung tích xi-lanh/Pin', vehicle.fuel === 'Điện' ? '82 kWh' : '2.0L'], ['Công suất tối đa', '245 HP'], ['Mô-men xoắn', '370 Nm'], ['Trọng lượng', '1.650 kg'], ['Dung tích bình xăng/Pin', vehicle.fuel === 'Điện' ? '82 kWh' : '60 L'], ['Hộp số', 'Tự động 8 cấp'], ['Hệ thống phanh', 'Đĩa ABS 4 bánh'], ['Mức tiêu hao nhiên liệu', vehicle.fuel === 'Điện' ? '16 kWh/100 km' : '7.5 L/100 km']]
    : [['Dung tích xi-lanh/Pin', vehicle.fuel === 'Điện' ? '5.5 kWh' : '650 cc'], ['Công suất tối đa', '68 HP'], ['Mô-men xoắn', '63 Nm'], ['Trọng lượng', '215 kg'], ['Dung tích bình xăng/Pin', vehicle.fuel === 'Điện' ? '5.5 kWh' : '17 L'], ['Hộp số', '6 cấp'], ['Hệ thống phanh', 'ABS 2 kênh'], ['Mức tiêu hao nhiên liệu', vehicle.fuel === 'Điện' ? '4 kWh/100 km' : '4.8 L/100 km']];
}

export default function ChiTietXePage() {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [showZaloQr, setShowZaloQr] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const vehicleId = Number(router.query.id);
  const vehicle = vehicles.find((item) => item.id === vehicleId) ?? vehicles[0];
  const vehicleImages = Array.from({ length: 10 }, (_, index) => `${vehicle.image}&ixid=gallery-${index}`);
  const specs = getSpecs(vehicle);
  const popularVehicles = [...vehicles].sort((a, b) => b.price - a.price).slice(0, 10);

  if (!router.isReady) return null;

  return (
    <div className={`${styles.page} font-sans`}>
      <Header />
      <main className={styles.main}>
        <p className={styles.breadcrumb}><Link href="/MuaBanXe/MuaBanXe" className={styles.backLink}>Mua bán xe</Link> / Chi tiết xe</p>
        <section className={styles.hero}>
          <div className={styles.imagePanel}>
            <div className={styles.gallery}>
              <img className={styles.mainImage} src={vehicleImages[imageIndex]} alt={`${vehicle.title} - ảnh ${imageIndex + 1}`} />
              <button type="button" className={`${styles.galleryArrow} ${styles.galleryLeft}`} onClick={() => setImageIndex((index) => (index > 0 ? index - 1 : vehicleImages.length - 1))} aria-label="Ảnh trước">‹</button>
              <button type="button" className={`${styles.galleryArrow} ${styles.galleryRight}`} onClick={() => setImageIndex((index) => (index < vehicleImages.length - 1 ? index + 1 : 0))} aria-label="Ảnh tiếp theo">›</button>
              <div className={styles.imageCounter}>{imageIndex + 1} / {vehicleImages.length}</div>
            </div>
            <div className={styles.thumbnailCarousel}>
              <button
                type="button"
                className={styles.thumbnailArrow}
                onClick={() => thumbnailsRef.current?.scrollBy({ left: -260, behavior: 'smooth' })}
                aria-label="Cuộn thumbnail sang trái"
              >
                ‹
              </button>
              <div className={styles.thumbnails} ref={thumbnailsRef} aria-label="Chọn ảnh xe">
                {vehicleImages.map((image, index) => (
                  <button
                    type="button"
                    className={`${styles.thumbnail} ${index === imageIndex ? styles.thumbnailActive : ''}`}
                    onClick={() => {
                      setImageIndex(index);
                      thumbnailsRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }}
                    key={image}
                    aria-label={`Xem ảnh ${index + 1}`}
                    aria-current={index === imageIndex ? 'true' : undefined}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.thumbnailArrow}
                onClick={() => thumbnailsRef.current?.scrollBy({ left: 260, behavior: 'smooth' })}
                aria-label="Cuộn thumbnail sang phải"
              >
                ›
              </button>
            </div>
          </div>
          <div className={styles.detailsPanel}>
            <p className={styles.eyebrow}>THÔNG TIN XE</p><h1 className={styles.title}>{vehicle.title}</h1><p className={styles.price}>{vehicle.priceLabel}</p>
            <div className={styles.summary}><div className={styles.summaryRow}><span>Hãng xe</span><strong>{vehicle.brand}</strong></div><div className={styles.summaryRow}><span>Dòng xe</span><strong>{vehicle.type}</strong></div><div className={styles.summaryRow}><span>Kiểu dáng</span><strong>{vehicle.type === 'Ô tô' ? 'Sedan / SUV' : 'Thể thao'}</strong></div></div>
            <h2 className={styles.specTitle}>THÔNG SỐ KỸ THUẬT</h2><div className={styles.specs}>{specs.map(([label, value]) => <div className={styles.spec} key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
            <div className={styles.actions}>
              {showPhone ? <a className={styles.actionPrimary} href="tel:0987654321">0987 654 321</a> : <button type="button" className={styles.actionPrimary} onClick={() => setShowPhone(true)}>Gọi cửa hàng</button>}
              <button type="button" className={styles.actionSecondary} onClick={() => setShowZaloQr(true)}>Nhắn cửa hàng</button>
            </div>
          </div>
        </section>
        <section className={styles.description}><h2 className={styles.sectionTitle}>Mô tả xe</h2><p>{vehicle.title} là lựa chọn nổi bật trong phân khúc, kết hợp thiết kế hiện đại, khả năng vận hành mạnh mẽ và trang bị an toàn tiện nghi. Xe được kiểm tra kỹ trước khi đăng bán, hỗ trợ tư vấn và lái thử tại cửa hàng.</p></section>
        <div className={styles.bottom}><section className={styles.newsSection}><h2 className={styles.sectionTitle}>TIN TỨC NỔI BẬT</h2><ContentSlider items={newsItems.slice(0, 10).map((item) => ({ title: item.title, image: item.image, href: `/TinTuc/ChiTietTin?id=${item.id}` }))} /><h2 className={styles.sectionTitle}>TIN BÁN XE</h2><ContentSlider items={vehicles.slice(0, 10).map((item) => ({ title: item.title, image: item.image, href: `/ChiTietXe/ChiTietXe?id=${item.id}` }))} /></section>
          <aside className={styles.popularPanel}><h2 className={styles.sectionTitle}>TOP 10 XE BÁN CHẠY</h2><div className={styles.popularList}>{popularVehicles.map((item) => <Link href={`/ChiTietXe/ChiTietXe?id=${item.id}`} className={styles.popularItem} key={item.id}><img src={item.image} alt={item.title} /><div><h3>{item.title}</h3><p>{item.priceLabel}</p></div></Link>)}</div></aside>
        </div>
      </main>
      {showZaloQr && (
        <div className={styles.qrBackdrop} role="dialog" aria-modal="true" aria-labelledby="zalo-qr-title" onClick={() => setShowZaloQr(false)}>
          <div className={styles.qrModal} onClick={(event) => event.stopPropagation()}>
            <button type="button" className={styles.qrClose} onClick={() => setShowZaloQr(false)} aria-label="Đóng mã QR">×</button>
            <h2 id="zalo-qr-title">Quét mã Zalo cửa hàng</h2>
            <p>Mở ứng dụng Zalo và quét mã để nhắn tin cho cửa hàng.</p>
            <img className={styles.qrImage} src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ" alt="Mã QR liên kết YouTube" />
            <strong>0987 654 321</strong>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}