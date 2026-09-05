import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { newsItems, NewsItem } from '@/TS/newsData';
import { vehicles } from '@/TS/vehicleData';
import styles from './chiTietTin.module.css';

// Trang chi tiết đọc id bài viết từ query string của router.
export default function ChiTietTinPage() {
  const router = useRouter();
  const articleId = Number(router.query.id);
  const article = newsItems.find((item) => item.id === articleId) ?? newsItems[0];
  const relatedNews = newsItems.filter((item) => item.id !== article.id).slice(0, 6);

  return (
    <div className={`${styles.page} min-h-screen bg-black text-white`}>
      <Header />
      <main className={styles.main}>
        <div className={styles.layout}>
          <article className={styles.article}>
            <p className={styles.kicker}>{article.category}</p>
            <h1>{article.title}</h1>
            <p className={styles.lead}>{article.description}</p>
            <img src={article.image} alt={article.title} className={styles.cover} />

            {/* Nội dung mô phỏng đầy đủ cho bài viết mẫu hiện có trong dữ liệu. */}
            <div className={styles.content}>
              <p>Thị trường xe đang có nhiều thay đổi đáng chú ý khi người dùng quan tâm hơn đến thiết kế, công nghệ và khả năng vận hành. Những thông tin mới nhất đang tạo ra nhiều lựa chọn phù hợp cho từng nhu cầu sử dụng.</p>
              <h2>Những điểm đáng chú ý</h2>
              <p>{article.description} Các chuyên gia nhận định người mua nên tìm hiểu kỹ thông số, chi phí sử dụng và chính sách hậu mãi trước khi đưa ra quyết định.</p>
              <p>Việc lựa chọn một mẫu xe phù hợp không chỉ phụ thuộc vào giá bán. Khả năng tiết kiệm nhiên liệu, hệ thống an toàn và trải nghiệm thực tế cũng là những tiêu chí quan trọng cần được cân nhắc.</p>
              <h2>Lời khuyên cho người dùng</h2>
              <p>Hãy tham khảo nhiều nguồn thông tin, kiểm tra xe trực tiếp và trao đổi rõ ràng với đại lý. Một kế hoạch tài chính hợp lý sẽ giúp quá trình sở hữu xe thuận tiện và lâu dài hơn.</p>
            </div>
            <Link href="/TinTuc/TinTuc" className={styles.backButton}>← Trở về</Link>
          </article>

          <aside className={styles.sidebar}>
            <InfoPanel title="THÔNG TIN NỔI BẬT">
              <div className={styles.featuredList}>
                {newsItems.slice(0, 10).map((item) => <FeaturedItem item={item} key={item.id} />)}
              </div>
            </InfoPanel>

            <InfoPanel title="TIN BÁN XE">
              <div className={styles.vehicleList}>
                {vehicles.slice(0, 10).map((vehicle) => (
                  <Link href={`/ChiTietXe/ChiTietXe?id=${vehicle.id}`} className={styles.vehicleItem} key={vehicle.id}>
                    <img src={vehicle.image} alt={vehicle.title} />
                    <span>{vehicle.title}<small>{vehicle.priceLabel}</small></span>
                  </Link>
                ))}
              </div>
            </InfoPanel>
          </aside>
        </div>

        {/* Sáu bài liên quan được dàn thành hai hàng, mỗi hàng ba card. */}
        <section className={styles.related}>
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>GỢI Ý ĐỌC THÊM</p>
            <h2>CÓ THỂ BẠN SẼ QUAN TÂM</h2>
          </div>
          <div className={styles.relatedGrid}>
            {relatedNews.map((item) => (
              <Link href={`/TinTuc/ChiTietTin?id=${item.id}`} className={styles.relatedCard} key={item.id}>
                <img src={item.image} alt="" />
                <span>{item.category}</span>
                <h3>{item.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return <section className={styles.panel}><h2>{title}</h2>{children}</section>;
}

function FeaturedItem({ item }: { item: NewsItem }) {
  return (
    <Link href={`/TinTuc/ChiTietTin?id=${item.id}`} className={styles.featuredItem}>
      <img src={item.image} alt="" />
      <span>{item.title}</span>
    </Link>
  );
}
