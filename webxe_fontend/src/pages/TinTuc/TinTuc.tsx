import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { newsCategories, newsItems, videos, NewsItem } from '@/TS/newsData';
import { vehicles } from '@/TS/vehicleData';
import styles from './tinTuc.module.css';

const INITIAL_COUNT = 6;
const LOAD_STEP = 3;

export default function TinTucPage() {
  const [category, setCategory] = useState(newsCategories[0]);
  const [count, setCount] = useState(INITIAL_COUNT);
  const articles = useMemo(() => newsItems.filter((item) => item.category === category), [category]);
  const visibleArticles = articles.slice(0, count);

  const selectCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    setCount(INITIAL_COUNT);
  };

  return (
    <div className={`${styles.page} min-h-screen bg-black text-white`}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>TEAM BẤT ỔN / NEWSROOM</p>
          <h1 className={styles.title}>Tin tức xe</h1>
          <p className={styles.subtitle}>Cập nhật nhanh những câu chuyện mới nhất trong thế giới ô tô và xe máy.</p>
        </section>

        <nav className={styles.categories} aria-label="Phân loại tin tức">
          {newsCategories.map((item) => (
            <button
              type="button"
              key={item}
              className={`${styles.categoryButton} ${category === item ? styles.activeCategory : ''}`}
              onClick={() => selectCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className={styles.layout}>
          <section aria-label={`Danh sách ${category}`}>
            <div className={styles.heading}>
              <div>
                <p className={styles.kicker}>MỚI NHẤT</p>
                <h2>{category}</h2>
              </div>
              <span>{articles.length} bài viết</span>
            </div>
            <div className={styles.articleList}>
              {visibleArticles.map((article) => <ArticleCard article={article} key={article.id} />)}
            </div>
            {count < articles.length && (
              <button type="button" className={styles.loadMore} onClick={() => setCount((value) => Math.min(value + LOAD_STEP, articles.length))}>
                Xem thêm
              </button>
            )}
          </section>

          <aside className={styles.sidebar}>
            <section className={styles.panel}>
              <div className={styles.heading}><h2>Top 10 xe bán chạy</h2><span>01—10</span></div>
              <div className={styles.popularList}>
                {vehicles.slice(0, 10).map((vehicle, index) => (
                  <Link href={`/ChiTietXe/ChiTietXe?id=${vehicle.id}`} className={styles.popularItem} key={vehicle.id}>
                    <b>{String(index + 1).padStart(2, '0')}</b>
                    <img src={vehicle.image} alt={vehicle.title} />
                    <span>{vehicle.title}</span>
                  </Link>
                ))}
              </div>
            </section>
            <section className={styles.panel}>
              <div className={styles.heading}><h2>Video nổi bật</h2><span>WATCH</span></div>
              <div className={styles.videoList}>
                {videos.map((video) => (
                  <a href={video.url} target="_blank" rel="noreferrer" className={styles.videoItem} key={video.id}>
                    <div className={styles.videoThumb}><span>▶</span></div>
                    <span>{video.title}</span>
                  </a>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ArticleCard({ article }: { article: NewsItem }) {
  return (
    <article className={styles.article}>
      <img src={article.image} alt="" />
      <div>
        <p className={styles.kicker}>{article.category}</p>
        <h3><Link href={`/TinTuc/ChiTietTin?id=${article.id}`}>{article.title}</Link></h3>
        <p className={styles.description}>{article.description}</p>
        <Link href={`/TinTuc/ChiTietTin?id=${article.id}`} className={styles.readMore}>Đọc bài <span>→</span></Link>
      </div>
    </article>
  );
}
