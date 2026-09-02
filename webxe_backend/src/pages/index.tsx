import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
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
];

const menuGroups = [
  { id: "products", label: "Quản lý Sản phẩm", tableIds: ["Xe", "HangXe", "LoaiXe"] },
  { id: "sales", label: "Quản lý Bán hàng", tableIds: ["DonHang", "GioHang"] },
  { id: "system", label: "Quản lý Hệ thống", tableIds: ["NguoiDung", "VaiTro"] },
];

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
  Xe: ["MaXe"], GioHang: ["MaGioHang"], DonHang: ["MaDonHang"],
};

const imageColumns = new Set(["HinhAnh", "Logo"]);

const renderCellValue = (column: string, value: string | number | null) => {
  if (imageColumns.has(column) && value) {
    return <img className={styles.tableImage} src={String(value)} alt={column} />;
  }
  return String(value ?? "-");
};

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>(tables[0].id);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    products: true,
    sales: true,
    system: true,
  });
  const [selectedDetailId, setSelectedDetailId] = useState<string | number | null>(null);
  const [tableData, setTableData] = useState(tables);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formTableId, setFormTableId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number | null>>({});
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [detailRecord, setDetailRecord] = useState<Record<string, string | number | null> | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    row: Record<string, string | number | null>;
    tableId: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/data/json")
      .then((response) => response.json())
      .then((data: Record<string, Array<Record<string, string | number | null>>>) => {
        setTableData(tables.map((table) => ({
          ...table,
          records: Array.isArray(data[table.id]) ? data[table.id] : table.records,
          columns: Array.isArray(data[table.id]) && data[table.id].length > 0
            ? Object.keys(data[table.id][0])
            : table.columns,
        })));
      })
      .catch(() => setErrorMessage("Không thể tải dữ liệu từ máy chủ."));
  }, []);

  const selectedTable = useMemo(
    () => tableData.find((table) => table.id === selectedId) ?? tableData[0],
    [selectedId, tableData]
  );
  const detailTable = detailTableByParent[selectedId]
    ? tableData.find((table) => table.id === detailTableByParent[selectedId])
    : undefined;
  const detailKey = detailKeyByParent[selectedId];
  const formTable = tableData.find((table) => table.id === formTableId) ?? selectedTable;
  const isCardView = ["Xe", "HangXe", "NguoiDung"].includes(selectedTable.id);
  const formColumns = formTable.columns.filter((column) =>
    formMode === "edit" || !(identityColumns[formTable.id] ?? []).includes(column)
  ).filter((column) => column !== "ThanhTien");

  const selectTable = (tableId: string) => {
    setSelectedId(tableId);
    setSelectedDetailId(null);
  };

  const openCreate = (tableId = selectedTable.id) => {
    setFormMode("create");
    setFormTableId(tableId);
    setErrorMessage("");
    setFormValues({});
  };

  const openEdit = (row: Record<string, string | number | null>, tableId = selectedTable.id) => {
    setFormMode("edit");
    setFormTableId(tableId);
    setErrorMessage("");
    setFormValues({ ...row });
  };

  const closeForm = () => {
    setFormMode(null);
    setFormTableId(null);
  };

  const saveRecord = async () => {
    setSaving(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/data/${formTable.id}`, {
        method: formMode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      if (!response.ok) throw new Error("Lưu dữ liệu thất bại");
      const refreshed = await fetch("/api/data/json").then((result) => result.json());
      setTableData(tables.map((table) => ({
        ...table,
        records: Array.isArray(refreshed[table.id]) ? refreshed[table.id] : table.records,
        columns: Array.isArray(refreshed[table.id]) && refreshed[table.id].length > 0 ? Object.keys(refreshed[table.id][0]) : table.columns,
      })));
      setFormMode(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể lưu dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (row: Record<string, string | number | null>, tableId = selectedTable.id) => {
    setPendingDelete({ row, tableId });
  };

  const deleteRecord = async () => {
    if (!pendingDelete) return;
    const { row, tableId } = pendingDelete;
    const keys = identityColumns[tableId] ?? (tableId === "ChiTietGioHang" ? ["MaGioHang", "MaXe"] : ["MaDonHang", "MaXe"]);
    const payload = Object.fromEntries(keys.map((key) => [key, row[key]]));
    setSaving(true);
    const response = await fetch(`/api/data/${tableId}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setErrorMessage("Không thể xóa bản ghi. Có thể bản ghi đang được bảng khác tham chiếu.");
      setSaving(false);
      return;
    }
    setTableData((current) => current.map((table) => table.id === tableId
      ? { ...table, records: table.records.filter((item) => !keys.every((key) => item[key] === row[key])) }
      : table));
    setPendingDelete(null);
    setSaving(false);
  };

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
                    <span>{group.label}</span>
                    <span className={`${styles.groupChevron} ${isExpanded ? styles.groupChevronOpen : ""}`}>⌄</span>
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
                            <span className={styles.navIndex}>{table.id.slice(0, 2)}</span>
                            <span className={styles.navText}>{table.name}</span>
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
              <h1>{selectedTable.name}</h1>
            </div>
            <div className={styles.topbarActions}>
              <span className={styles.badge}>{selectedTable.records.length} records</span>
              <button type="button" className={styles.primaryButton} onClick={() => openCreate()}>+ Thêm mới</button>
            </div>
          </div>

          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

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
                {formColumns.map((column) => (
                  <label key={column} className={styles.formField}>
                    <span>{column}</span>
                    <input
                      type={column.includes("Ngay") ? "datetime-local" : column === "MatKhau" ? "password" : "text"}
                      value={formValues[column] == null ? "" : String(formValues[column])}
                      disabled={formMode === "edit" && (identityColumns[formTable.id] ?? []).includes(column)}
                      onChange={(event) => setFormValues((current) => ({ ...current, [column]: event.target.value }))}
                    />
                    {imageColumns.has(column) && formValues[column] && (
                      <img className={styles.formImagePreview} src={String(formValues[column])} alt={`Xem trước ${column}`} />
                    )}
                  </label>
                ))}
              </div>
              <button type="button" className={styles.primaryButton} disabled={saving} onClick={saveRecord}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              </section>
            </div>
          )}

          <div className={styles.infoCard}>
            <h2>Mô tả</h2>
            <p>{selectedTable.description}</p>
          </div>

          {!isCardView && <div className={styles.tableSection}>
            <div className={styles.tableHeaderRow}>
              <h3>Các cột</h3>
              <span>{selectedTable.columns.length} columns</span>
            </div>

            <div className={styles.chipRow}>
              {selectedTable.columns.map((column) => (
                <span key={column} className={styles.chip}>{column}</span>
              ))}
            </div>
          </div>}

          {isCardView ? (
            <div className={styles.productGrid}>
              {selectedTable.records.map((row, rowIndex) => (
                <article key={`${selectedTable.id}-${rowIndex}`} className={styles.productCard}>
                  <div className={styles.productImageArea}>
                    {(row.HinhAnh || row.Logo) ? (
                      <img className={styles.productImage} src={String(row.HinhAnh || row.Logo)} alt={String(row.TenXe || row.TenHang || row.HoTen || selectedTable.name)} />
                    ) : (
                      <span className={styles.imagePlaceholder}>Chưa có ảnh</span>
                    )}
                  </div>
                  <div className={styles.productCardBody}>
                    <span className={styles.productCode}>Mã: {String(row.MaXe || row.MaHang || row.MaNguoiDung || "-")}</span>
                    <h2>{String(row.TenXe || row.TenHang || row.HoTen || row.TenDangNhap || `${selectedTable.name} chưa đặt tên`)}</h2>
                    <strong className={styles.productPrice}>
                      {selectedTable.id === "Xe" && row.Gia ? `${Number(row.Gia).toLocaleString("vi-VN")} đ` : selectedTable.id === "NguoiDung" ? String(row.Email || "Người dùng hệ thống") : String(row.Logo ? "Đã có logo" : "Chưa có logo")}
                    </strong>
                    <div className={styles.productMeta}>
                      <span>{selectedTable.id === "Xe" ? String(row.MauSac || "Chưa rõ màu") : selectedTable.id === "NguoiDung" ? String(row.SoDienThoai || "Chưa có SĐT") : "Danh mục hãng xe"}</span>
                      <span>{selectedTable.id === "Xe" ? `${row.SoLuong ?? 0} xe` : selectedTable.id === "NguoiDung" ? String(row.TenDangNhap || "Chưa có tài khoản") : "Đang quản lý"}</span>
                    </div>
                    <div className={styles.productActions}>
                      <button type="button" className={styles.detailButton} onClick={() => setDetailRecord(row)}>Xem chi tiết</button>
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
                  {selectedTable.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  {detailTable && <th>Thao tác</th>}
                  <th>CRUD</th>
                </tr>
              </thead>
              <tbody>
                {selectedTable.records.map((row, rowIndex) => (
                  <tr key={`${selectedTable.id}-${rowIndex}`}>
                    {selectedTable.columns.map((column) => (
                      <td key={`${selectedTable.id}-${column}-${rowIndex}`}>
                        {renderCellValue(column, row[column])}
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
            <section className={styles.detailSection}>
              <div className={styles.tableHeaderRow}>
                <div>
                  <p className={styles.detailLabel}>Chi tiết {selectedTable.name}</p>
                  <h3>{detailTable.name}</h3>
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
                      {detailTable.columns.map((column) => <th key={column}>{column}</th>)}
                      <th>CRUD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailTable.records
                      .filter((row) => row[detailKey] === selectedDetailId)
                      .map((row, rowIndex) => (
                        <tr key={`${detailTable.id}-${rowIndex}`}>
                          {detailTable.columns.map((column) => (
                            <td key={`${detailTable.id}-${column}-${rowIndex}`}>{renderCellValue(column, row[column])}</td>
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
          )}

          {detailRecord && (
            <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
              if (event.target === event.currentTarget) setDetailRecord(null);
            }}>
              <section className={`${styles.modal} ${styles.vehicleModal}`} role="dialog" aria-modal="true" aria-labelledby="vehicle-title">
                <div className={styles.modalHeader}>
                  <div>
                    <p className={styles.detailLabel}>Thông tin {selectedTable.name}</p>
                    <h2 id="vehicle-title">{String(detailRecord.TenXe || detailRecord.TenHang || detailRecord.HoTen || detailRecord.TenDangNhap || `Chi tiết ${selectedTable.name}`)}</h2>
                  </div>
                  <button type="button" className={styles.closeButton} onClick={() => setDetailRecord(null)}>Đóng</button>
                </div>
                <div className={styles.vehicleDetailContent}>
                  <div className={styles.vehicleDetailImage}>
                    {(detailRecord.HinhAnh || detailRecord.Logo) ? <img src={String(detailRecord.HinhAnh || detailRecord.Logo)} alt={String(detailRecord.TenXe || detailRecord.TenHang || detailRecord.HoTen || selectedTable.name)} /> : <span className={styles.imagePlaceholder}>Chưa có ảnh</span>}
                  </div>
                  <div className={styles.vehicleDetailGrid}>
                    {selectedTable.columns.map((column) => (
                      <div key={column} className={styles.vehicleDetailItem}>
                        <span>{column}</span>
                        <strong>{renderCellValue(column, detailRecord[column])}</strong>
                      </div>
                    ))}
                  </div>
                </div>
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
    </>
  );
}
