import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/Home.module.css";

type Product = {
  MaXe: number;
  TenXe: string;
  Gia: number;
  HinhAnh?: string;
  MauSac?: string;
  NamSanXuat?: number;
  MoTa?: string;
  SoLuong?: number;
};

type ApiResponse = {
  Xe?: Product[];
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80",
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3002/api/data/json")
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        const xe = Array.isArray(data?.Xe) ? data.Xe : [];
        setProducts(xe);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const catalog = useMemo(() => {
    if (!products.length) return [];
    return products.slice(0, 8).map((product, index) => ({
      ...product,
      image:
        product.HinhAnh || fallbackImages[index % fallbackImages.length],
      discount: index % 3 === 0 ? 15 : index % 3 === 1 ? 9 : 10,
    }));
  }, [products]);

  return (
    <>
      <Head>
        <title>WebXe | Laptop MSI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.pageShell}>
        <header className={styles.topBar}>
          <h1 className={styles.heading}>
            LAPTOP MSI CHÍNH HÃNG
            <span> ({products.length || 0} sản phẩm)</span>
          </h1>

          <div className={styles.filterGroup}>
            <div className={styles.filterSelect}>
              <span>Phân khúc giá</span>
              <span className={styles.selectArrow}>⌄</span>
            </div>
            <div className={styles.filterSelect}>
              <span>Thương hiệu</span>
              <span className={styles.selectArrow}>⌄</span>
            </div>
            <div className={styles.filterSelect}>
              <span>Sắp xếp theo</span>
              <span className={styles.selectArrow}>⌄</span>
            </div>
            <button type="button" className={styles.viewButton} aria-label="Toggle view">
              ☰
            </button>
          </div>
        </header>

        <main className={styles.productArea}>
          {loading ? (
            <div className={styles.loading}>Đang tải sản phẩm...</div>
          ) : catalog.length === 0 ? (
            <div className={styles.empty}>Không có sản phẩm nào.</div>
          ) : (
            <div className={styles.productGrid}>
              {catalog.map((product, index) => (
                <article
                  key={product.MaXe}
                  className={`${styles.productCard} ${index === 3 ? styles.highlightCard : ""}`}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.discountTag}>Giảm {product.discount}%</span>
                    <div className={styles.badgeWrap}>
                      <span className={styles.productBrand}>MTB.HVN</span>
                    </div>
                  </div>

                  <div className={styles.imageWrap}>
                    <img src={product.image} alt={product.TenXe} className={styles.productImage} />
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.productName}>{product.TenXe}</div>
                    <div className={styles.metaLine}>
                      <span>CPU</span>
                      <span>SSD</span>
                    </div>
                    <div className={styles.priceRow}>
                      <strong>{formatPrice(product.Gia)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
