import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BACKEND_URL } from "@/services/api";
import styles from "./DatabaseDashboard.module.css";

type CellValue = string | number | boolean | null;
type VehicleImage = { url: string; isMain: boolean };
type VehicleImageMap = Record<string, VehicleImage[]>;

type TableItem = {
  id: string;
  name: string;
  description: string;
  columns: string[];
  records: Array<Record<string, CellValue>>;
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
    columns: ["MaNguoiDung", "MaVaiTro", "TenDangNhap", "MatKhau", "HoTen", "Email", "SoDienThoai", "HinhAnh"],
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
    id: "HinhAnhXe",
    name: "HinhAnhXe",
    description: "Ảnh xe được quản lý bên trong mục Xe.",
    columns: ["MaHinhAnh", "MaXe", "DuongDanAnh", "LaAnhChinh"],
    records: [],
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
    columns: ["MaDonHang", "MaNguoiDung", "HoTenNguoiNhan", "SoDienThoai", "DiaChi", "TongTien", "PhuongThucThanhToan", "TrangThai", "NgayDat"],
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
  {
    id: "DanhMucTinTuc",
    name: "DanhMucTinTuc",
    description: "Các danh mục phân loại bài viết tin tức.",
    columns: ["MaDanhMuc", "TenDanhMuc"],
    records: [],
  },
  {
    id: "TinTuc",
    name: "TinTuc",
    description: "Quản lý các bài viết tin tức trên website.",
    columns: ["MaTinTuc", "MaDanhMuc", "TieuDe", "TomTat", "NoiDung", "HinhAnh", "NgayDang"],
    records: [],
  },
];

const menuGroups = [
  { id: "products", label: "Quản lý Sản phẩm", tableIds: ["Xe", "HangXe", "LoaiXe"] },
  { id: "sales", label: "Quản lý Bán hàng", tableIds: ["DonHang", "GioHang"] },
  { id: "news", label: "Quản lý Tin tức", tableIds: ["DanhMucTinTuc", "TinTuc"] },
  { id: "system", label: "Quản lý Hệ thống", tableIds: ["NguoiDung", "VaiTro"] },
];

const tableIcons: Record<string, string> = {
  Xe: "🚗",
  HangXe: "🏢",
  LoaiXe: "🚘",
  DonHang: "📦",
  GioHang: "🛒",
  ChiTietGioHang: "🛍️",
  ChiTietDonHang: "🧾",
  NguoiDung: "👤",
  VaiTro: "🔑",
  DanhMucTinTuc: "🗂️",
  TinTuc: "📰",
};

const menuGroupIcons: Record<string, string> = {
  products: "🏎️",
  sales: "💳",
  news: "📰",
  system: "⚙️",
};

const detailTableByParent: Record<string, string> = {
  GioHang: "ChiTietGioHang",
  DonHang: "ChiTietDonHang",
};

const detailKeyByParent: Record<string, string> = {
  GioHang: "MaGioHang",
  DonHang: "MaDonHang",
};

const identityColumns: Record<string, string[]> = {
  VaiTro: ["MaVaiTro"], NguoiDung: ["MaNguoiDung"], HangXe: ["MaHang"], LoaiXe: ["MaLoai"],
  Xe: ["MaXe"], HinhAnhXe: ["MaHinhAnh"], GioHang: ["MaGioHang"], DonHang: ["MaDonHang"],
  DanhMucTinTuc: ["MaDanhMuc"], TinTuc: ["MaTinTuc"],
};

const hiddenDisplayColumns: Record<string, string[]> = {
  DonHang: ["MaDonHang", "MaNguoiDung"],
};

const tableLabels: Record<string, string> = {
  VaiTro: "Vai trò", NguoiDung: "Người dùng", HangXe: "Hãng xe", LoaiXe: "Loại xe",
  Xe: "Xe", GioHang: "Giỏ hàng", ChiTietGioHang: "Chi tiết giỏ hàng",
  DonHang: "Đơn hàng", ChiTietDonHang: "Chi tiết đơn hàng",
  DanhMucTinTuc: "Danh mục tin tức", TinTuc: "Tin tức",
};

const columnLabels: Record<string, string> = {
  MaVaiTro: "Mã vai trò", TenVaiTro: "Tên vai trò", MaNguoiDung: "Mã người dùng",
  MaHang: "Mã hãng xe", TenHang: "Tên hãng xe", MaLoai: "Mã loại xe", TenLoai: "Tên loại xe",
  MaXe: "Mã xe", TenXe: "Tên xe", Gia: "Giá", NamSanXuat: "Năm sản xuất", MauSac: "Màu sắc",
  SoLuong: "Số lượng", HinhAnh: "Hình ảnh", Logo: "Logo", MaHinhAnh: "Mã hình ảnh", DuongDanAnh: "Đường dẫn ảnh", LaAnhChinh: "Ảnh chính", MaGioHang: "Mã giỏ hàng",
  NgayTao: "Ngày tạo", MaDonHang: "Mã đơn hàng", HoTenNguoiNhan: "Họ tên người nhận",
  SoDienThoai: "Số điện thoại", DiaChi: "Địa chỉ", TongTien: "Tổng tiền",
  PhuongThucThanhToan: "Phương thức thanh toán", TrangThai: "Trạng thái", NgayDat: "Ngày đặt",
  DonGia: "Đơn giá", ThanhTien: "Thành tiền", TenDangNhap: "Tên đăng nhập", MatKhau: "Mật khẩu",
  HoTen: "Họ tên", Email: "Email", MoTa: "Mô tả",
  MaDanhMuc: "Mã danh mục", TenDanhMuc: "Tên danh mục", MaTinTuc: "Mã tin tức",
  TieuDe: "Tiêu đề", TomTat: "Tóm tắt", NoiDung: "Nội dung", NgayDang: "Ngày đăng",
};

const foreignKeyConfig: Record<
  string,
  { refTable: string; valueKey: string; getLabel: (row: Record<string, CellValue>) => string }
> = {
  MaHang: {
    refTable: "HangXe",
    valueKey: "MaHang",
    getLabel: (row) => String(row.TenHang || row.MaHang || ""),
  },
  MaLoai: {
    refTable: "LoaiXe",
    valueKey: "MaLoai",
    getLabel: (row) => String(row.TenLoai || row.MaLoai || ""),
  },
  MaVaiTro: {
    refTable: "VaiTro",
    valueKey: "MaVaiTro",
    getLabel: (row) => String(row.TenVaiTro || row.MaVaiTro || ""),
  },
  MaNguoiDung: {
    refTable: "NguoiDung",
    valueKey: "MaNguoiDung",
    getLabel: (row) => String(row.HoTen || row.TenDangNhap || row.MaNguoiDung || ""),
  },
  MaXe: {
    refTable: "Xe",
    valueKey: "MaXe",
    getLabel: (row) => String(row.TenXe || row.MaXe || ""),
  },
  MaDanhMuc: {
    refTable: "DanhMucTinTuc",
    valueKey: "MaDanhMuc",
    getLabel: (row) => String(row.TenDanhMuc || row.MaDanhMuc || ""),
  },
};

const getColumnLabel = (column: string) => columnLabels[column] ?? column;

const getDateTimeLocalValue = (value: CellValue) => {
  if (value == null || value === "") return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const imageColumns = new Set(["HinhAnh", "Logo", "DuongDanAnh"]);

const renderCellValue = (column: string, value: CellValue, relatedName?: string) => {
  if (imageColumns.has(column) && value) {
    return <img className={styles.tableImage} src={String(value)} alt={column} />;
  }
  return relatedName ?? (typeof value === "boolean" ? (value ? "Có" : "Không") : String(value ?? "-"));
};

const getCrudHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getProcedureName = (tableId: string, action: "create" | "edit" | "delete") => {
  const actionPrefix = action === "create" ? "Them" : action === "edit" ? "Sua" : "Xoa";
  return `sp_${actionPrefix}${tableId}`;
};

export default function Home() {
  const router = useRouter();
  const { token, isAdmin, status } = useAuth();
  const [selectedId, setSelectedId] = useState<string>(tables[0].id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    products: true,
    sales: true,
    news: true,
    system: true,
  });
  const [selectedDetailId, setSelectedDetailId] = useState<CellValue>(null);
  const [tableData, setTableData] = useState(tables);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formTableId, setFormTableId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, CellValue>>({});
  const [saving, setSaving] = useState(false);
  // Trạng thái cho thanh thông báo toast
  const [notification, setNotification] = useState<{ message: string; type: "success-add" | "success-edit" | "success-delete" | "error" } | null>(null);

  // Hàm hiển thị thông báo toast
  const showNotification = (message: string, type: "success-add" | "success-edit" | "success-delete" | "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  const [detailRecord, setDetailRecord] = useState<Record<string, CellValue> | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageIsMain, setImageIsMain] = useState(false);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [imageSaving, setImageSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    row: Record<string, CellValue>;
    tableId: string;
  } | null>(null);
  const [filterBrand, setFilterBrand] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  useEffect(() => {
    if (status !== "loading" && (!token || !isAdmin)) {
      void router.replace("/Login/Login");
    }
  }, [isAdmin, router, status, token]);

  useEffect(() => {
    if (status === "loading" || !token || !isAdmin) return;
    const controller = new AbortController();
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all(tables.map(async (table) => {
      const response = await fetch(`${BACKEND_URL}/admin/tables/${table.id}?limit=500`, {
        headers,
        credentials: "include",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Không thể tải bảng ${table.name}`);
      const data = await response.json() as { rows?: Array<Record<string, CellValue>> };
      const records = Array.isArray(data.rows) ? data.rows : [];
      return { ...table, records, columns: records.length > 0 ? Object.keys(records[0]) : table.columns };
    }))
      .then(setTableData)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        showNotification(error instanceof Error ? error.message : "Không thể tải dữ liệu.", "error");
      });

    return () => controller.abort();
  }, [isAdmin, status, token]);

  const selectedTable = useMemo(
    () => tableData.find((table) => table.id === selectedId) ?? tableData[0],
    [selectedId, tableData]
  );
  const detailTable = detailTableByParent[selectedId]
    ? tableData.find((table) => table.id === detailTableByParent[selectedId])
    : undefined;
  const detailKey = detailKeyByParent[selectedId];
  const formTable = tableData.find((table) => table.id === formTableId) ?? selectedTable;
  const filteredRecords = useMemo(() => {
    if (selectedTable.id === "TinTuc") {
      return selectedTable.records.filter((row) => filterCategory ? Number(row.MaDanhMuc) === Number(filterCategory) : true);
    }
    if (selectedTable.id !== "Xe") return selectedTable.records;
    return selectedTable.records.filter((row) => {
      const matchesBrand = filterBrand ? Number(row.MaHang) === Number(filterBrand) : true;
      const matchesType = filterType ? Number(row.MaLoai) === Number(filterType) : true;
      return matchesBrand && matchesType;
    });
  }, [selectedTable, filterBrand, filterType, filterCategory]);
  const isCardView = ["Xe", "HangXe", "NguoiDung", "TinTuc"].includes(selectedTable.id);
  const showColumnOverview = !["DonHang", "GioHang", "LoaiXe", "VaiTro", "DanhMucTinTuc", "TinTuc"].includes(selectedTable.id);
  const displayColumns = selectedTable.columns.filter(
    (column) => !(hiddenDisplayColumns[selectedTable.id] ?? []).includes(column)
  );
  const formColumns = formTable.columns.filter((column) =>
    formMode === "edit" || !(identityColumns[formTable.id] ?? []).includes(column)
  ).filter((column) => column !== "ThanhTien");
  const vehicleImages = useMemo(() => {
    const images = tableData.find((table) => table.id === "HinhAnhXe")?.records ?? [];
    return images.reduce<VehicleImageMap>((result, image) => {
      if (!image.MaXe || !image.DuongDanAnh) return result;
      const key = String(image.MaXe);
      result[key] = [...(result[key] ?? []), {
        url: String(image.DuongDanAnh),
        isMain: image.LaAnhChinh === true || image.LaAnhChinh === 1 || image.LaAnhChinh === "1",
      }];
      return result;
    }, {});
  }, [tableData]);
  const selectedVehicleImages = detailRecord?.MaXe
    ? tableData.find((table) => table.id === "HinhAnhXe")?.records.filter((image) => image.MaXe === detailRecord.MaXe) ?? []
    : [];

  const findName = (tableId: string, key: string, value: CellValue) => {
    const record = tableData.find((table) => table.id === tableId)?.records.find((item) => item[key] === value);
    const name = record?.TenXe ?? record?.TenHang ?? record?.TenLoai ?? record?.HoTen ?? record?.TenVaiTro;
    return name == null ? undefined : String(name);
  };

  const getRelatedDisplayValue = (tableId: string, column: string, value: CellValue) => {
    if (tableId === "Xe" && column === "MaHang") return findName("HangXe", "MaHang", value);
    if (tableId === "Xe" && column === "MaLoai") return findName("LoaiXe", "MaLoai", value);
    if (tableId === "GioHang" && column === "MaNguoiDung") return findName("NguoiDung", "MaNguoiDung", value);
    if ((tableId === "ChiTietGioHang" || tableId === "ChiTietDonHang") && column === "MaXe") return findName("Xe", "MaXe", value);
    return undefined;
  };

  const selectTable = (tableId: string) => {
    setSelectedId(tableId);
    setSelectedDetailId(null);
    setIsMobileMenuOpen(false);
    setFilterBrand("");
    setFilterType("");
    setFilterCategory("");
  };

  const openCreate = (tableId = selectedTable.id) => {
    setFormMode("create");
    setFormTableId(tableId);
    setFormValues({});
  };

  const openEdit = (row: Record<string, CellValue>, tableId = selectedTable.id) => {
    setFormMode("edit");
    setFormTableId(tableId);
    setFormValues({ ...row });
  };

  const openVehicleDetail = (row: Record<string, CellValue>) => {
    setDetailRecord(row);
    setImageUrl("");
    setImageIsMain(false);
    setEditingImageId(null);
  };

  const resetImageForm = () => {
    setImageUrl("");
    setImageIsMain(false);
    setEditingImageId(null);
  };

  const refreshTableData = async (tableId: string) => {
    const response = await fetch(`${BACKEND_URL}/admin/tables/${tableId}?limit=500`, {
      headers: getCrudHeaders(),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Không thể tải lại dữ liệu");
    const refreshed = await response.json() as { rows?: Array<Record<string, CellValue>> };
    const records = Array.isArray(refreshed.rows) ? refreshed.rows : [];
    setTableData((current) => current.map((table) => table.id === tableId
      ? { ...table, records, columns: records.length > 0 ? Object.keys(records[0]) : table.columns }
      : table));
  };

  const uploadImageUrl = async (url: string) => {
    const imageUrl = url.trim();
    if (!imageUrl || imageUrl.includes("res.cloudinary.com")) return imageUrl;

    const response = await fetch(`${BACKEND_URL}/admin/media/upload-url`, {
      method: "POST",
      headers: getCrudHeaders(),
      credentials: "include",
      body: JSON.stringify({ url: imageUrl }),
    });
    const data = await response.json().catch(() => null) as { url?: string; message?: string } | null;
    if (!response.ok || !data?.url) throw new Error(data?.message || "Không thể tải ảnh lên Cloudinary");
    return data.url;
  };

  const saveVehicleImage = async () => {
    if (!detailRecord?.MaXe || !imageUrl.trim()) return;
    setImageSaving(true);
    try {
      const action = editingImageId === null ? "create" : "edit";
      const cloudinaryUrl = await uploadImageUrl(imageUrl);
      const response = await fetch(`${BACKEND_URL}/admin/procedures/${getProcedureName("HinhAnhXe", action)}`, {
        method: "POST",
        headers: getCrudHeaders(),
        credentials: "include",
        body: JSON.stringify({
          ...(editingImageId === null ? {} : { MaHinhAnh: editingImageId }),
          MaXe: detailRecord.MaXe,
          DuongDanAnh: cloudinaryUrl,
          LaAnhChinh: imageIsMain,
        }),
      });
      if (!response.ok) throw new Error("Không thể lưu hình ảnh xe");
      await refreshTableData("HinhAnhXe");
      // Hiện thông báo thành công
      showNotification(editingImageId === null ? "Đã thêm thành công" : "Đã sửa thành công", editingImageId === null ? "success-add" : "success-edit");
      resetImageForm();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Không thể lưu dữ liệu", "error");
    } finally {
      setImageSaving(false);
    }
  };

  const deleteVehicleImage = async (imageId: number) => {
    setImageSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/admin/procedures/${getProcedureName("HinhAnhXe", "delete")}`, {
        method: "POST",
        headers: getCrudHeaders(),
        credentials: "include",
        body: JSON.stringify({ MaHinhAnh: imageId }),
      });
      if (!response.ok) throw new Error("Không thể xóa hình ảnh xe");
      await refreshTableData("HinhAnhXe");
      if (editingImageId === imageId) resetImageForm();
      // Hiện thông báo xóa thành công
      showNotification("Đã xóa thành công", "success-delete");
    } catch {
      showNotification("Warning: TIME OUT !", "error");
    } finally {
      setImageSaving(false);
    }
  };

  const closeForm = () => {
    setFormMode(null);
    setFormTableId(null);
  };

  const saveRecord = async () => {
    setSaving(true);
    try {
      const isCreate = formMode === "create";
      const action = isCreate ? "create" : "edit";
      const valuesToSave = { ...formValues };
      for (const column of imageColumns) {
        const value = valuesToSave[column];
        if (typeof value === "string" && value.trim()) {
          valuesToSave[column] = await uploadImageUrl(value);
        }
      }
      const response = await fetch(`${BACKEND_URL}/admin/procedures/${getProcedureName(formTable.id, action)}`, {
        method: "POST",
        headers: getCrudHeaders(),
        credentials: "include",
        body: JSON.stringify(valuesToSave),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Lưu dữ liệu thất bại");
      }
      await refreshTableData(formTable.id);
      setFormMode(null);
      // Hiện thông báo thêm/sửa thành công
      showNotification(isCreate ? "Đã thêm thành công" : "Đã sửa thành công", isCreate ? "success-add" : "success-edit");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Không thể lưu dữ liệu", "error");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (row: Record<string, CellValue>, tableId = selectedTable.id) => {
    setPendingDelete({ row, tableId });
  };

  const deleteRecord = async () => {
    if (!pendingDelete) return;
    const { row, tableId } = pendingDelete;
    const keys = identityColumns[tableId] ?? (tableId === "ChiTietGioHang" ? ["MaGioHang", "MaXe"] : ["MaDonHang", "MaXe"]);
    const payload = Object.fromEntries(keys.map((key) => [key, row[key]]));
    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/admin/procedures/${getProcedureName(tableId, "delete")}`, {
        method: "POST", headers: getCrudHeaders(), credentials: "include", body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Xóa dữ liệu thất bại");
      }
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Không thể xóa dữ liệu", "error");
      setSaving(false);
      return;
    }
    setTableData((current) => current.map((table) => table.id === tableId
      ? { ...table, records: table.records.filter((item) => !keys.every((key) => item[key] === row[key])) }
      : table));
    setPendingDelete(null);
    setSaving(false);
    // Hiện thông báo xóa thành công
    showNotification("Đã xóa thành công", "success-delete");
  };

  if (status === "loading" || !token || !isAdmin) {
    return <div className={styles.loadingState}>Đang kiểm tra quyền truy cập...</div>;
  }

  return (
    <>
      <Head>
        <title>WebXe Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.dashboardPage}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <button
              type="button"
              className={styles.mobileMenuToggle}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <span className={styles.toggleIcon}>{isMobileMenuOpen ? "✕" : "☰"}</span>
              <span className={styles.toggleText}>Danh mục</span>
            </button>
            <div className={styles.brandRow}>
              <div className={styles.logoCircle}>🏎️</div>
              <div>
                <p className={styles.brandLabel}>WebXe</p>
                <span className={styles.brandSub}>Database Dashboard</span>
              </div>
            </div>
          </div>

          <nav className={`${styles.navList} ${isMobileMenuOpen ? styles.mobileNavOpen : ""}`}>
            {menuGroups.map((group) => {
              const isExpanded = expandedGroups[group.id];
              return (
                <div key={group.id} className={styles.navGroup}>
                  <button
                    type="button"
                    className={styles.groupToggle}
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedGroups((current) => ({ ...current, [group.id]: !current[group.id] }))}
                  >
                    <span>{menuGroupIcons[group.id] ?? "📁"} {group.label}</span>
                    <span className={`${styles.groupChevron} ${isExpanded ? styles.groupChevronOpen : ""}`}>🔽</span>
                  </button>
                  {isExpanded && (
                    <div className={styles.groupItems}>
                      {group.tableIds.map((tableId) => {
                        const table = tables.find((item) => item.id === tableId);
                        if (!table) return null;
                        return (
                          <button
                            key={table.id}
                            type="button"
                            className={`${styles.navItem} ${selectedId === table.id ? styles.active : ""}`}
                            onClick={() => selectTable(table.id)}
                          >
                            <span className={styles.navIndex}>{tableIcons[table.id] ?? "🚗"}</span>
                            <span className={styles.navText}>{tableLabels[table.id] ?? table.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className={styles.contentPanel}>
          <div className={styles.topbar}>
            <div>
              <p className={styles.topbarLabel}>Bảng dữ liệu</p>
              <h1>{tableLabels[selectedTable.id] ?? selectedTable.name}</h1>
            </div>
            <div className={styles.topbarActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => void router.push("/")}>
                ← Trang chủ
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => void router.push("/ChamSocKH/ChamSocKH")}>
                💬 Chăm sóc khách hàng
              </button>
              {selectedTable.id === "Xe" && (
                <div className={styles.filterGroup}>
                  <span className={styles.filterIcon}>🏢</span>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className={styles.filterSelect}
                    aria-label="Lọc theo hãng xe"
                  >
                    <option value="">Tất cả hãng xe</option>
                    {(tableData.find((t) => t.id === "HangXe")?.records || []).map((brand) => (
                      <option key={String(brand.MaHang)} value={String(brand.MaHang ?? "")}>{String(brand.TenHang ?? "")}</option>
                    ))}
                  </select>
                </div>
              )}
              {selectedTable.id === "Xe" && (
                <div className={styles.filterGroup}>
                  <span className={styles.filterIcon}>🚘</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={styles.filterSelect}
                    aria-label="Lọc theo loại xe"
                  >
                    <option value="">Tất cả loại xe</option>
                    {(tableData.find((t) => t.id === "LoaiXe")?.records || []).map((type) => (
                      <option key={String(type.MaLoai)} value={String(type.MaLoai ?? "")}>{String(type.TenLoai ?? "")}</option>
                    ))}
                  </select>
                </div>
              )}
              {selectedTable.id === "TinTuc" && (
                <div className={styles.filterGroup}>
                  <span className={styles.filterIcon}>🗂️</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={styles.filterSelect}
                    aria-label="Lọc theo danh mục tin tức"
                  >
                    <option value="">Tất cả danh mục tin tức</option>
                    {(tableData.find((table) => table.id === "DanhMucTinTuc")?.records || []).map((category) => (
                      <option key={String(category.MaDanhMuc)} value={String(category.MaDanhMuc ?? "")}>
                        {String(category.TenDanhMuc ?? `Danh mục ${category.MaDanhMuc}`)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button type="button" className={styles.primaryButton} onClick={() => openCreate()}>+ Thêm mới</button>
            </div>
          </div>



          {formMode && (
            <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeForm();
            }}>
              <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="form-title">
                <div className={styles.tableHeaderRow}>
                  <h2 id="form-title">{formMode === "create" ? "Thêm bản ghi" : "Cập nhật bản ghi"}</h2>
                  <button type="button" className={styles.closeButton} onClick={closeForm}>Đóng</button>
                </div>
                <div className={styles.formGrid}>
                  {formColumns.map((column) => {
                    const fkConfig = foreignKeyConfig[column];
                    const isForeignKey = fkConfig && fkConfig.refTable !== formTable.id;
                    const refRecords = isForeignKey
                      ? tableData.find((t) => t.id === fkConfig.refTable)?.records ?? []
                      : [];

                    return (
                      <label key={column} className={styles.formField}>
                        <span>{getColumnLabel(column)}</span>
                        {isForeignKey ? (
                          <select
                            value={formValues[column] == null ? "" : String(formValues[column])}
                            disabled={formMode === "edit" && (identityColumns[formTable.id] ?? []).includes(column)}
                            onChange={(event) => {
                              const val = event.target.value;
                              setFormValues((current) => ({
                                ...current,
                                [column]: val === "" ? "" : isNaN(Number(val)) ? val : Number(val),
                              }));
                            }}
                          >
                            <option value="">-- Chọn {getColumnLabel(column).toLowerCase()} --</option>
                            {refRecords.map((refRow, idx) => {
                              const val = refRow[fkConfig.valueKey];
                              const label = fkConfig.getLabel(refRow);
                              return (
                                <option key={`${val}-${idx}`} value={String(val)}>
                                  {label} (Mã: {String(val)})
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <input
                            className={column === "NgayDang" ? styles.dateTimeInput : undefined}
                            type={column.includes("Ngay") ? "datetime-local" : column === "MatKhau" ? "password" : column === "LaAnhChinh" ? "checkbox" : "text"}
                            step={column.includes("Ngay") ? 60 : undefined}
                            checked={column === "LaAnhChinh" ? Boolean(formValues[column]) : undefined}
                            value={column.includes("Ngay") ? getDateTimeLocalValue(formValues[column]) : formValues[column] == null ? "" : String(formValues[column])}
                            disabled={formMode === "edit" && (identityColumns[formTable.id] ?? []).includes(column)}
                            onChange={(event) => setFormValues((current) => ({ ...current, [column]: column === "LaAnhChinh" ? event.target.checked : event.target.value }))}
                          />
                        )}
                        {imageColumns.has(column) && formValues[column] && (
                          <img className={styles.formImagePreview} src={String(formValues[column])} alt={`Xem trước ${column}`} />
                        )}
                      </label>
                    );
                  })}
                </div>
                <button type="button" className={styles.primaryButton} disabled={saving} onClick={saveRecord}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </section>
            </div>
          )}


          {!isCardView && showColumnOverview && <div className={styles.tableSection}>
            <div className={styles.tableHeaderRow}>
              <h3>Các cột</h3>
              <span>{displayColumns.length} columns</span>
            </div>

            <div className={styles.chipRow}>
              {displayColumns.map((column) => (
                <span key={column} className={styles.chip}>{getColumnLabel(column)}</span>
              ))}
            </div>
          </div>}

          {isCardView ? (
            <div className={`${styles.productGrid} ${["HangXe", "NguoiDung"].includes(selectedTable.id) ? styles.compactProductGrid : ""}`}>
              {filteredRecords.map((row, rowIndex) => (
                <article key={`${selectedTable.id}-${rowIndex}`} className={`${styles.productCard} ${["HangXe", "NguoiDung"].includes(selectedTable.id) ? styles.compactProductCard : ""}`}>
                  {(() => {
                    const images = selectedTable.id === "Xe" ? vehicleImages[String(row.MaXe)] ?? [] : [];
                    const mainImage = images.find((image) => image.isMain)?.url ?? images[0]?.url ?? row.Logo ?? row.HinhAnh;
                    const secondaryImages = images.filter((image) => image.url !== mainImage);
                    return <div className={styles.productImageArea}>
                      {mainImage ? (
                        <div className={styles.productImageLayout}>
                          <img className={styles.productImage} src={String(mainImage)} alt={String(row.TenXe || row.TenHang || row.HoTen || row.TieuDe || selectedTable.name)} />
                          {secondaryImages.length > 0 && <div className={styles.productThumbnails}>
                            {secondaryImages.map((image, imageIndex) => <img key={`${image.url}-${imageIndex}`} className={styles.productThumbnail} src={image.url} alt={`${String(row.TenXe || selectedTable.name)} ảnh phụ ${imageIndex + 1}`} />)}
                          </div>}
                        </div>
                      ) : (
                        <span className={styles.imagePlaceholder}>Chưa có ảnh</span>
                      )}
                    </div>;
                  })()}
                  <div className={styles.productCardBody}>
                      <span className={styles.productCode}>Mã: {String(row.MaXe || row.MaHang || row.MaNguoiDung || row.MaTinTuc || "-")}</span>
                      <h2>{String(row.TenXe || row.TenHang || row.HoTen || row.TenDangNhap || row.TieuDe || `${selectedTable.name} chưa đặt tên`)}</h2>
                    <strong className={styles.productPrice}>
                        {selectedTable.id === "Xe" && row.Gia ? `${Number(row.Gia).toLocaleString("vi-VN")} đ` : selectedTable.id === "NguoiDung" ? String(row.Email || "Người dùng hệ thống") : selectedTable.id === "TinTuc" ? String(row.TomTat || "Tin tức WebXe") : String(row.Logo ? "Đã có logo" : "Chưa có logo")}
                    </strong>
                    <div className={styles.productMeta}>
                        <span>{selectedTable.id === "Xe" ? String(row.MauSac || "Chưa rõ màu") : selectedTable.id === "NguoiDung" ? String(row.SoDienThoai || "Chưa có SĐT") : selectedTable.id === "TinTuc" ? String(row.NgayDang || "Chưa cập nhật") : "Danh mục hãng xe"}</span>
                        <span>{selectedTable.id === "Xe" ? `${row.SoLuong ?? 0} xe` : selectedTable.id === "NguoiDung" ? String(row.TenDangNhap || "Chưa có tài khoản") : selectedTable.id === "TinTuc" ? String(row.MaDanhMuc ? `Danh mục ${row.MaDanhMuc}` : "Chưa phân loại") : "Đang quản lý"}</span>
                    </div>
                    <div className={styles.productActions}>
                      <button type="button" className={styles.detailButton} onClick={() => openVehicleDetail(row)}>Xem chi tiết</button>
                      <button type="button" className={styles.editButton} onClick={() => openEdit(row)}>Sửa</button>
                      <button type="button" className={styles.deleteButton} onClick={() => requestDelete(row)}>Xóa</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (

            <div className={styles.dataWrap}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    {displayColumns.map((column) => (
                      <th key={column}>{getColumnLabel(column)}</th>
                    ))}
                    {detailTable && <th>Chức năng</th>}
                    <th>Chức năng</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row, rowIndex) => (
                    <tr key={`${selectedTable.id}-${rowIndex}`}>
                      {displayColumns.map((column) => (
                        <td key={`${selectedTable.id}-${column}-${rowIndex}`}>
                          {renderCellValue(column, row[column], getRelatedDisplayValue(selectedTable.id, column, row[column]))}
                        </td>
                      ))}
                      {detailTable && (
                        <td>
                          <button
                            type="button"
                            className={styles.detailButton}
                            onClick={() => setSelectedDetailId(row[detailKey] ?? null)}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      )}
                      <td className={styles.rowActions}>
                        <button type="button" className={styles.editButton} onClick={() => openEdit(row)}>Sửa</button>
                        <button type="button" className={styles.deleteButton} onClick={() => requestDelete(row)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {detailTable && selectedDetailId !== null && (
            <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedDetailId(null);
            }}>
              <section className={`${styles.modal} ${styles.detailModal}`} role="dialog" aria-modal="true" aria-labelledby="detail-title">
                <div className={styles.modalHeader}>
                  <div>
                    <p className={styles.detailLabel}>Chi tiết {tableLabels[selectedTable.id] ?? selectedTable.name} #{selectedDetailId}</p>
                    <h2 id="detail-title">{tableLabels[detailTable.id] ?? detailTable.name}</h2>
                  </div>
                  <div className={styles.topbarActions}>
                    <button type="button" className={styles.primaryButton} onClick={() => openCreate(detailTable.id)}>+ Thêm</button>
                    <button type="button" className={styles.closeButton} onClick={() => setSelectedDetailId(null)}>Đóng</button>
                  </div>
                </div>
                <div className={styles.dataWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        {detailTable.columns.map((column) => <th key={column}>{getColumnLabel(column)}</th>)}
                        <th>Chức năng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailTable.records
                        .filter((row) => row[detailKey] === selectedDetailId)
                        .map((row, rowIndex) => (
                          <tr key={`${detailTable.id}-${rowIndex}`}>
                            {detailTable.columns.map((column) => (
                              <td key={`${detailTable.id}-${column}-${rowIndex}`}>
                                {renderCellValue(column, row[column], getRelatedDisplayValue(detailTable.id, column, row[column]))}
                              </td>
                            ))}
                            <td className={styles.rowActions}>
                              <button type="button" className={styles.editButton} onClick={() => openEdit(row, detailTable.id)}>Sửa</button>
                              <button type="button" className={styles.deleteButton} onClick={() => requestDelete(row, detailTable.id)}>Xóa</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {detailRecord && (
            <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
              if (event.target === event.currentTarget) setDetailRecord(null);
            }}>
              <section className={`${styles.modal} ${styles.vehicleModal}`} role="dialog" aria-modal="true" aria-labelledby="vehicle-title">
                <div className={styles.modalHeader}>
                  <div>
                    <p className={styles.detailLabel}>Thông tin {tableLabels[selectedTable.id] ?? selectedTable.name}</p>
                    <h2 id="vehicle-title">{String(detailRecord.TenXe || detailRecord.TenHang || detailRecord.HoTen || detailRecord.TenDangNhap || `Chi tiết ${tableLabels[selectedTable.id] ?? selectedTable.name}`)}</h2>
                  </div>
                  <button type="button" className={styles.closeButton} onClick={() => setDetailRecord(null)}>Đóng</button>
                </div>
                <div className={styles.vehicleDetailContent}>
                  {(() => {
                    const mainImage = selectedVehicleImages.find((image) => image.LaAnhChinh === true || image.LaAnhChinh === 1 || image.LaAnhChinh === "1")?.DuongDanAnh
                      ?? selectedVehicleImages[0]?.DuongDanAnh
                      ?? detailRecord.Logo
                      ?? detailRecord.HinhAnh;
                    return mainImage || selectedTable.id !== "TinTuc" ? (
                      <div className={styles.vehicleDetailImage}>
                        {mainImage && <img src={String(mainImage)} alt={String(detailRecord.TenXe || detailRecord.TenHang || detailRecord.HoTen || detailRecord.TieuDe || selectedTable.name)} />}
                      </div>
                    ) : null;
                  })()}
                  <div className={styles.vehicleDetailGrid}>
                    {selectedTable.columns.map((column) => (
                      <div key={column} className={styles.vehicleDetailItem}>
                        <span>{getColumnLabel(column)}</span>
                        <strong>{renderCellValue(column, detailRecord[column], getRelatedDisplayValue(selectedTable.id, column, detailRecord[column]))}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedTable.id === "Xe" && (
                  <div className={styles.vehicleImagesPanel}>
                    <div className={styles.tableHeaderRow}>
                      <div>
                        <p className={styles.detailLabel}>Thư viện ảnh</p>
                        <h3>Ảnh của xe</h3>
                      </div>
                      <span>{selectedVehicleImages.length} ảnh</span>
                    </div>
                    <div className={styles.vehicleImageList}>
                      {selectedVehicleImages.map((image, imageIndex) => (
                        <div key={String(image.MaHinhAnh ?? imageIndex)} className={styles.vehicleImageItem}>
                          <img src={String(image.DuongDanAnh)} alt={`Ảnh xe ${imageIndex + 1}`} />
                          <div className={styles.vehicleImageItemInfo}>
                            <span>{image.LaAnhChinh === true || image.LaAnhChinh === 1 || image.LaAnhChinh === "1" ? "Ảnh chính" : "Ảnh phụ"}</span>
                            <div className={styles.rowActions}>
                              <button type="button" className={styles.editButton} onClick={() => {
                                setEditingImageId(Number(image.MaHinhAnh));
                                setImageUrl(String(image.DuongDanAnh));
                                setImageIsMain(image.LaAnhChinh === true || image.LaAnhChinh === 1 || image.LaAnhChinh === "1");
                              }}>Sửa</button>
                              <button type="button" className={styles.deleteButton} disabled={imageSaving} onClick={() => deleteVehicleImage(Number(image.MaHinhAnh))}>Xóa</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.vehicleImageForm}>
                      <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Dán đường dẫn ảnh xe" aria-label="Đường dẫn ảnh xe" />
                      <label className={styles.imageMainToggle}>
                        <input type="checkbox" checked={imageIsMain} onChange={(event) => setImageIsMain(event.target.checked)} />
                        Ảnh chính
                      </label>
                      <button type="button" className={styles.primaryButton} disabled={imageSaving || !imageUrl.trim()} onClick={saveVehicleImage}>
                        {imageSaving ? "Đang lưu..." : editingImageId === null ? "Thêm ảnh" : "Lưu ảnh"}
                      </button>
                      {editingImageId !== null && <button type="button" className={styles.closeButton} onClick={resetImageForm}>Hủy sửa</button>}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {pendingDelete && (
            <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPendingDelete(null);
            }}>
              <section className={`${styles.modal} ${styles.deleteModal}`} role="dialog" aria-modal="true" aria-labelledby="delete-title">
                <div className={styles.deleteIcon}>!</div>
                <p className={styles.detailLabel}>Xác nhận thao tác</p>
                <h2 id="delete-title">Xóa bản ghi {pendingDelete.tableId}?</h2>
                <p className={styles.deleteMessage}>Dữ liệu sau khi xóa sẽ không thể khôi phục. Bạn có chắc chắn muốn tiếp tục không?</p>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelButton} disabled={saving} onClick={() => setPendingDelete(null)}>Hủy bỏ</button>
                  <button type="button" className={styles.deleteButton} disabled={saving} onClick={deleteRecord}>
                    {saving ? "Đang xóa..." : "Xác nhận xóa"}
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Thanh thông báo toast hiện ở trên cùng bên phải */}
      {notification && (
        <div className={`${styles.toastNotification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}
    </>
  );
}
