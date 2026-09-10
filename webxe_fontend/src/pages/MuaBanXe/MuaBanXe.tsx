import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Vehicle } from '@/TS/vehicleData';
import { BACKEND_URL } from '@/services/api';
import styles from './muaBanXe.module.css';

type FilterKey = 'type' | 'fuel' | 'brand' | 'price';
type FilterState = Record<FilterKey, string[]>;

const priceOptions = ['15 triệu – <30 triệu VNĐ', '>30 triệu – <60 triệu VNĐ', '>60 triệu – <180 triệu VNĐ', '>180 triệu – <350 triệu VNĐ', '>350 triệu – <500 triệu VNĐ', '>500 triệu – <750 triệu VNĐ', '>750 triệu – <950 triệu VNĐ', '>950 triệu VNĐ'];

const filterLabels: Record<FilterKey, string> = { type: 'LOẠI XE', fuel: 'LOẠI NHIÊN LIỆU', brand: 'HÃNG', price: 'GIÁ TIỀN' };
const priceRanges = [[15000000, 30000000], [30000000, 60000000], [60000000, 180000000], [180000000, 350000000], [350000000, 500000000], [500000000, 750000000], [750000000, 950000000], [950000000, Infinity]];

function matchesPrice(price: number, option: string) {
  const range = priceRanges[priceOptions.indexOf(option)];
  return range ? price >= range[0] && price < range[1] : false;
}

type ApiVehicle = { MaXe: number; MaHang: number; MaLoai: number; TenXe?: string | null; Gia?: number | string | null; LoaiNhienLieu?: string | null; NhienLieu?: string | null; Fuel?: string | null };
type ApiVehicleImage = { MaXe: number; DuongDanAnh?: string | null; LaAnhChinh?: boolean | number | null };
type ApiBrand = { MaHang: number; TenHang: string };
type ApiType = { MaLoai: number; TenLoai: string };
type VehicleResponse = { Xe?: ApiVehicle[]; HinhAnhXe?: ApiVehicleImage[]; HangXe?: ApiBrand[]; LoaiXe?: ApiType[] };

function normalizeVehicleType(value: string): Vehicle['type'] {
  const type = value.toLowerCase();
  if (type.includes('côn') || type.includes('moto') || type.includes('mô tô')) return 'Xe moto';
  if (type.includes('ga') || type.includes('máy')) return 'Xe máy';
  if (type.includes('hơi') || type.includes('ô tô')) return 'Ô tô';
  return undefined;
}

function normalizeFuel(value?: string | null): NonNullable<Vehicle['fuel']> | undefined {
  const fuel = value?.toLowerCase() ?? '';
  if (!fuel) return undefined;
  if (fuel.includes('điện') || fuel.includes('electric')) return 'Điện';
  if (fuel.includes('hybrid')) return 'Hybrid';
  if (fuel.includes('diesel') || fuel.includes('dầu')) return 'Dầu diesel';
  if (fuel.includes('xăng') || fuel.includes('gasoline')) return 'Xăng';
  return undefined;
}

function mapApiVehicles(data: VehicleResponse): Vehicle[] {
  const brands = new Map((data.HangXe ?? []).map((brand) => [brand.MaHang, brand.TenHang]));
  const types = new Map((data.LoaiXe ?? []).map((type) => [type.MaLoai, type.TenLoai]));
  const images = new Map<number, ApiVehicleImage[]>();
  (data.HinhAnhXe ?? []).forEach((image) => {
    if (!image.DuongDanAnh?.trim()) return;
    images.set(image.MaXe, [...(images.get(image.MaXe) ?? []), image]);
  });

  return (data.Xe ?? []).flatMap((vehicle) => {
    const title = vehicle.TenXe?.trim();
    const price = Number(vehicle.Gia);
    if (!title || !Number.isFinite(price) || price <= 0) return [];
    const fuel = vehicle.LoaiNhienLieu ?? vehicle.NhienLieu ?? vehicle.Fuel;
    const vehicleImages = images.get(vehicle.MaXe) ?? [];
    const mainImage = vehicleImages.find((image) => image.LaAnhChinh === true || image.LaAnhChinh === 1)?.DuongDanAnh ?? vehicleImages[0]?.DuongDanAnh;
    return [{
      id: vehicle.MaXe,
      title,
      price,
      priceLabel: `${price.toLocaleString('vi-VN')} VNĐ`,
      image: mainImage || '',
      type: normalizeVehicleType(types.get(vehicle.MaLoai) ?? ''),
      fuel: normalizeFuel(fuel),
      brand: brands.get(vehicle.MaHang),
    }];
  });
}

function matchesFilters(vehicle: Vehicle, filters: FilterState) {
  return (!filters.type.length || (vehicle.type ? filters.type.includes(vehicle.type) : false))
    && (!filters.fuel.length || (vehicle.fuel ? filters.fuel.includes(vehicle.fuel) : false))
    && (!filters.brand.length || (vehicle.brand ? filters.brand.includes(vehicle.brand) : false))
    && (!filters.price.length || filters.price.some((range) => matchesPrice(vehicle.price, range)));
}

export default function MuaBanXePage() {
  const router = useRouter();
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [filters, setFilters] = useState<FilterState>({ type: [], fuel: [], brand: [], price: [] });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Đồng bộ loại xe trên URL với bộ lọc để các icon trên Header mở đúng danh sách.
  useEffect(() => {
    if (!router.isReady) return;

    const queryType = router.query.type;
    const selectedType = Array.isArray(queryType) ? queryType[0] : queryType;
    const validTypes: NonNullable<Vehicle['type']>[] = ['Ô tô', 'Xe máy', 'Xe moto'];
    const typeFilter = selectedType && validTypes.includes(selectedType as NonNullable<Vehicle['type']>)
      ? [selectedType as NonNullable<Vehicle['type']>]
      : [];

    setFilters((current) => ({ ...current, type: typeFilter }));
    setOpenFilter(typeFilter.length ? 'type' : null);
  }, [router.isReady, router.query.type]);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${BACKEND_URL}/api/data/json`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Không thể tải dữ liệu xe');
        const data = await response.json() as VehicleResponse;
        if (!Array.isArray(data.Xe)) throw new Error('API không trả về danh sách xe');
        return data;
      })
      .then((data) => setVehicles(mapApiVehicles(data)))
      .catch(() => setError('Không thể tải danh sách xe từ máy chủ. Vui lòng thử lại sau.'))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  const filterOptions = useMemo<Record<FilterKey, string[]>>(() => ({
    type: [...new Set(vehicles.map((vehicle) => vehicle.type).filter((type): type is NonNullable<Vehicle['type']> => Boolean(type)))],
    fuel: [...new Set(vehicles.map((vehicle) => vehicle.fuel).filter((fuel): fuel is NonNullable<Vehicle['fuel']> => Boolean(fuel)))],
    brand: [...new Set(vehicles.map((vehicle) => vehicle.brand).filter((brand): brand is string => Boolean(brand)))],
    price: priceOptions.filter((option) => vehicles.some((vehicle) => matchesPrice(vehicle.price, option))),
  }), [vehicles]);
  const filteredVehicles = useMemo(() => vehicles.filter((vehicle) => matchesFilters(vehicle, filters)), [filters, vehicles]);
  const popularVehicles = [...vehicles].sort((a, b) => b.price - a.price);

  const toggleOption = (key: FilterKey, option: string) => {
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(option) ? current[key].filter((value) => value !== option) : [...current[key], option],
    }));
  };

  return (
    <div className={`${styles.page} font-sans`}>
      <Header />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>MARKETPLACE</p>
          <h1 className={styles.title}>Mua bán xe</h1>
          <p className={styles.subtitle}>Khám phá những mẫu xe nổi bật, giá tốt và được kiểm duyệt bởi Team Bất Ổn.</p>
        </div>
        <div className={styles.layout}>
          <div className={styles.sidebarColumn}>
            <aside className={`${styles.panel} ${styles.filterPanel}`} aria-label="Bộ lọc xe">
              <h2 className={styles.filterTitle}>BỘ LỌC TÌM KIẾM</h2>
              {(Object.keys(filterOptions) as FilterKey[]).map((key) => (
                <div className={styles.filterGroup} key={key}>
                  <button type="button" className={styles.filterButton} onClick={() => setOpenFilter(openFilter === key ? null : key)} aria-expanded={openFilter === key}>
                    {filterLabels[key]} <span>{openFilter === key ? '−' : '+'}</span>
                  </button>
                  {openFilter === key && (
                    <div className={styles.filterOptions}>
                      {filterOptions[key].map((option) => (
                        <label className={styles.option} key={option}>
                          <input type="checkbox" checked={filters[key].includes(option)} onChange={() => toggleOption(key, option)} />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </aside>

            <aside className={`${styles.panel} ${styles.popularPanel}`} aria-label="Xe bán chạy nhất">
              <h2 className={styles.popularTitle}>TOP 10 XE BÁN CHẠY NHẤT</h2>
              <div className={styles.popularList}>{popularVehicles.slice(0, 10).map((vehicle) => (
                <Link href={`/ChiTietXe/ChiTietXe?id=${vehicle.id}`} className={`${styles.popularItem} ${!vehicle.image ? styles.popularItemNoImage : ''}`} key={vehicle.id}>
                              {vehicle.image && <img className={styles.popularImage} src={vehicle.image} alt={vehicle.title} />}
                  <div><h3 className={styles.popularName}>{vehicle.title}</h3><p className={styles.popularPrice}>{vehicle.priceLabel}</p></div>
                </Link>
              ))}</div>
            </aside>
          </div>

          <section aria-label="Danh sách xe bán">
            <div className={styles.resultsHeader}>
              <h2>Xe đang bán</h2><span className={styles.count}>{filteredVehicles.length} sản phẩm</span>
            </div>
            {loading ? <div className={`${styles.panel} ${styles.empty}`}>Đang tải danh sách xe...</div> : error ? <div className={`${styles.panel} ${styles.empty}`}>{error}<button type="button" className={styles.retryButton} onClick={() => setReloadKey((key) => key + 1)}>Thử lại</button></div> : filteredVehicles.length ? (
              <div className={`${styles.panel} ${styles.vehiclePanel}`}>
                <div className={styles.vehicleList}>{filteredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
              </div>
            ) : <div className={`${styles.panel} ${styles.empty}`}>Không tìm thấy xe phù hợp với bộ lọc.</div>}
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link href={`/ChiTietXe/ChiTietXe?id=${vehicle.id}`} className={`${styles.card} ${!vehicle.image ? styles.cardNoImage : ''}`}>
      {vehicle.image && <img className={styles.image} src={vehicle.image} alt={vehicle.title} />}
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{vehicle.title}</h3>
        <div className={styles.meta}>{vehicle.type && <span>{vehicle.type}</span>}{vehicle.fuel && <span>{vehicle.fuel}</span>}{vehicle.brand && <span>{vehicle.brand}</span>}</div>
        <p className={styles.price}>{vehicle.priceLabel}</p>
      </div>
    </Link>
  );
}