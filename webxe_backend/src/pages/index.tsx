import Head from "next/head";
import { useMemo, useState } from "react";
import styles from "@/styles/Home.module.css";

type TableItem = {
  id: string;
  name: string;
  description: string;
  columns: string[];
  records: Array<Record<string, string | number | null>>;
};

const tables: TableItem[] = [
  {
    id: "VaiTro",
    name: "VaiTro",
    description: "Quản lý các vai trò người dùng trong hệ thống.",
    columns: ["MaVaiTro", "TenVaiTro"],
    records: [
      { MaVaiTro: 1, TenVaiTro: "Admin" },
      { MaVaiTro: 2, TenVaiTro: "Khách hàng" },
    ],
  },
  {
    id: "NguoiDung",
    name: "NguoiDung",
    description: "Thông tin tài khoản đăng nhập và hồ sơ người dùng.",
    columns: ["MaNguoiDung", "MaVaiTro", "TenDangNhap", "MatKhau", "HoTen", "Email", "SoDienThoai"],
    records: [
      { MaNguoiDung: 1, MaVaiTro: 1, TenDangNhap: "admin", MatKhau: "123456", HoTen: "Quản trị viên", Email: "admin@gmail.com", SoDienThoai: "0900000001" },
      { MaNguoiDung: 2, MaVaiTro: 2, TenDangNhap: "khach01", MatKhau: "123456", HoTen: "Nguyễn Văn A", Email: "a@gmail.com", SoDienThoai: "0912345678" },
    ],
  },
  {
    id: "HangXe",
    name: "HangXe",
    description: "Danh sách các hãng xe trong hệ thống.",
    columns: ["MaHang", "TenHang", "Logo"],
    records: [
      { MaHang: 1, TenHang: "Toyota", Logo: "/images/toyota.png" },
      { MaHang: 2, TenHang: "Honda", Logo: "/images/honda.png" },
    ],
  },
  {
    id: "LoaiXe",
    name: "LoaiXe",
    description: "Phân loại xe theo nhóm sản phẩm.",
    columns: ["MaLoai", "TenLoai"],
    records: [
      { MaLoai: 1, TenLoai: "Sedan" },
      { MaLoai: 2, TenLoai: "SUV" },
    ],
  },
  {
    id: "Xe",
    name: "Xe",
    description: "Thông tin chi tiết các xe hiện có trong kho.",
    columns: ["MaXe", "MaHang", "MaLoai", "TenXe", "Gia", "NamSanXuat", "MauSac", "SoLuong"],
    records: [
      { MaXe: 1, MaHang: 1, MaLoai: 1, TenXe: "Toyota Vios", Gia: 620000000, NamSanXuat: 2024, MauSac: "Trắng", SoLuong: 10 },
      { MaXe: 2, MaHang: 2, MaLoai: 2, TenXe: "Honda CR-V", Gia: 980000000, NamSanXuat: 2023, MauSac: "Đen", SoLuong: 6 },
    ],
  },
  {
    id: "GioHang",
    name: "GioHang",
    description: "Giỏ hàng của người dùng theo từng tài khoản.",
    columns: ["MaGioHang", "MaNguoiDung", "NgayTao"],
    records: [
      { MaGioHang: 1, MaNguoiDung: 1, NgayTao: "2026-08-01" },
      { MaGioHang: 2, MaNguoiDung: 2, NgayTao: "2026-08-05" },
    ],
  },
  {
    id: "ChiTietGioHang",
    name: "ChiTietGioHang",
    description: "Các sản phẩm đang có trong giỏ hàng.",
    columns: ["MaGioHang", "MaXe", "SoLuong"],
    records: [
      { MaGioHang: 1, MaXe: 1, SoLuong: 1 },
      { MaGioHang: 2, MaXe: 2, SoLuong: 2 },
    ],
  },
  {
    id: "DonHang",
    name: "DonHang",
    description: "Thông tin đơn hàng đã được đặt.",
    columns: ["MaDonHang", "MaNguoiDung", "HoTenNguoiNhan", "SoDienThoai", "TongTien", "TrangThai"],
    records: [
      { MaDonHang: 1, MaNguoiDung: 1, HoTenNguoiNhan: "Quản trị viên", SoDienThoai: "0900000001", TongTien: 620000000, TrangThai: "Đã xác nhận" },
      { MaDonHang: 2, MaNguoiDung: 2, HoTenNguoiNhan: "Nguyễn Văn A", SoDienThoai: "0912345678", TongTien: 980000000, TrangThai: "Chờ xác nhận" },
    ],
  },
  {
    id: "ChiTietDonHang",
    name: "ChiTietDonHang",
    description: "Chi tiết từng xe trong đơn hàng.",
    columns: ["MaDonHang", "MaXe", "SoLuong", "DonGia", "ThanhTien"],
    records: [
      { MaDonHang: 1, MaXe: 1, SoLuong: 1, DonGia: 620000000, ThanhTien: 620000000 },
      { MaDonHang: 2, MaXe: 2, SoLuong: 1, DonGia: 980000000, ThanhTien: 980000000 },
    ],
  },
];

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>(tables[0].id);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedId) ?? tables[0],
    [selectedId]
  );

  return (
    <>
      <Head>
        <title>WebXe Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.dashboardPage}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.logoCircle}>W</div>
            <div>
              <p className={styles.brandLabel}>WebXe</p>
              <span className={styles.brandSub}>Database Dashboard</span>
            </div>
          </div>

          <nav className={styles.navList}>
            {tables.map((table) => (
              <button
                key={table.id}
                type="button"
                className={`${styles.navItem} ${selectedId === table.id ? styles.active : ""}`}
                onClick={() => setSelectedId(table.id)}
              >
                <span className={styles.navIndex}>{table.id}</span>
                <span className={styles.navText}>{table.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className={styles.contentPanel}>
          <div className={styles.topbar}>
            <div>
              <p className={styles.topbarLabel}>Bảng dữ liệu</p>
              <h1>{selectedTable.name}</h1>
            </div>
            <span className={styles.badge}>{selectedTable.records.length} records</span>
          </div>

          <div className={styles.infoCard}>
            <h2>Mô tả</h2>
            <p>{selectedTable.description}</p>
          </div>

          <div className={styles.tableSection}>
            <div className={styles.tableHeaderRow}>
              <h3>Các cột</h3>
              <span>{selectedTable.columns.length} columns</span>
            </div>

            <div className={styles.chipRow}>
              {selectedTable.columns.map((column) => (
                <span key={column} className={styles.chip}>{column}</span>
              ))}
            </div>
          </div>

          <div className={styles.dataWrap}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  {selectedTable.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedTable.records.map((row, rowIndex) => (
                  <tr key={`${selectedTable.id}-${rowIndex}`}>
                    {selectedTable.columns.map((column) => (
                      <td key={`${selectedTable.id}-${column}-${rowIndex}`}>
                        {String(row[column] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}
