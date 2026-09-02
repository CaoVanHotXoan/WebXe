const { sql } = require('../config/db');

const allowedTables = [
  'VaiTro',
  'NguoiDung',
  'HangXe',
  'LoaiXe',
  'Xe',
  'GioHang',
  'ChiTietGioHang',
  'DonHang',
  'ChiTietDonHang',
];

const tableDefinitions = {
  VaiTro: { procedure: 'VaiTro', primaryKeys: ['MaVaiTro'], fields: { TenVaiTro: sql.NVarChar(50) } },
  NguoiDung: {
    procedure: 'NguoiDung', primaryKeys: ['MaNguoiDung'], fields: {
      MaVaiTro: sql.Int, TenDangNhap: sql.VarChar(50), MatKhau: sql.VarChar(255),
      HoTen: sql.NVarChar(100), Email: sql.VarChar(100), SoDienThoai: sql.VarChar(20), HinhAnh: sql.NVarChar(500),
    },
  },
  HangXe: { procedure: 'HangXe', primaryKeys: ['MaHang'], fields: { TenHang: sql.NVarChar(100), Logo: sql.NVarChar(500) } },
  LoaiXe: { procedure: 'LoaiXe', primaryKeys: ['MaLoai'], fields: { TenLoai: sql.NVarChar(100) } },
  Xe: {
    procedure: 'Xe', primaryKeys: ['MaXe'], fields: {
      MaHang: sql.Int, MaLoai: sql.Int, TenXe: sql.NVarChar(150), Gia: sql.Decimal(18, 2),
      HinhAnh: sql.NVarChar(500), NamSanXuat: sql.Int, MauSac: sql.NVarChar(100), MoTa: sql.NVarChar(sql.MAX), SoLuong: sql.Int,
    },
  },
  GioHang: { procedure: 'GioHang', primaryKeys: ['MaGioHang'], fields: { MaNguoiDung: sql.Int, NgayTao: sql.DateTime } },
  ChiTietGioHang: { procedure: 'ChiTietGioHang', primaryKeys: ['MaGioHang', 'MaXe'], fields: { MaGioHang: sql.Int, MaXe: sql.Int, SoLuong: sql.Int } },
  DonHang: {
    procedure: 'DonHang', primaryKeys: ['MaDonHang'], fields: {
      MaNguoiDung: sql.Int, HoTenNguoiNhan: sql.NVarChar(100), SoDienThoai: sql.VarChar(20), DiaChi: sql.NVarChar(300),
      TongTien: sql.Decimal(18, 2), PhuongThucThanhToan: sql.NVarChar(50), TrangThai: sql.NVarChar(50), NgayDat: sql.DateTime,
    },
  },
  ChiTietDonHang: { procedure: 'ChiTietDonHang', primaryKeys: ['MaDonHang', 'MaXe'], fields: { MaDonHang: sql.Int, MaXe: sql.Int, SoLuong: sql.Int, DonGia: sql.Decimal(18, 2) } },
};

async function getAllTablesDataObject() {
  const result = {};

  for (const tableName of allowedTables) {
    const request = new sql.Request();
    const rows = await request.query(`SELECT * FROM [dbo].[${tableName}]`);
    result[tableName] = rows.recordset;
  }

  return result;
}

async function getAllTablesData(req, res) {
  try {
    const result = await getAllTablesDataObject();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi khi lấy toàn bộ dữ liệu:', error);
    return res.status(500).json({
      message: 'Không thể lấy dữ liệu từ cơ sở dữ liệu',
      error: error.message,
    });
  }
}

async function getTableData(req, res) {
  const tableName = req.params.table;

  if (!allowedTables.includes(tableName)) {
    return res.status(404).json({
      message: 'Bảng không tồn tại hoặc không được phép truy cập',
      table: tableName,
    });
  }

  try {
    const request = new sql.Request();
    const rows = await request.query(`SELECT * FROM [dbo].[${tableName}]`);

    return res.status(200).json({
      table: tableName,
      count: rows.recordset.length,
      data: rows.recordset,
    });
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu từ bảng ${tableName}:`, error);
    return res.status(500).json({
      message: `Không thể lấy dữ liệu từ bảng ${tableName}`,
      error: error.message,
    });
  }
}

function getDefinition(tableName, res) {
  if (!allowedTables.includes(tableName)) {
    res.status(404).json({ message: 'Bảng không tồn tại hoặc không được phép truy cập', table: tableName });
    return null;
  }
  return tableDefinitions[tableName];
}

async function executeCrud(req, res, action) {
  const definition = getDefinition(req.params.table, res);
  if (!definition) return;

  const values = { ...(req.body || {}), ...(req.params || {}) };
  const fields = action === 'create'
    ? Object.keys(definition.fields)
    : action === 'update'
      ? [...definition.primaryKeys, ...Object.keys(definition.fields).filter((field) => !definition.primaryKeys.includes(field))]
      : definition.primaryKeys;

  try {
    const request = new sql.Request();
    for (const field of fields) {
      const value = values[field] === undefined || values[field] === '' ? null : values[field];
      request.input(field, definition.fields[field] || sql.Int, value);
    }
    await request.execute(`sp_${action === 'create' ? 'Them' : action === 'update' ? 'Sua' : 'Xoa'}${definition.procedure}`);
    return res.status(action === 'create' ? 201 : 200).json({ message: `${action} ${req.params.table} thành công` });
  } catch (error) {
    console.error(`Lỗi CRUD bảng ${req.params.table}:`, error);
    return res.status(500).json({ message: `Không thể ${action} dữ liệu`, error: error.message });
  }
}

const createTableData = (req, res) => executeCrud(req, res, 'create');
const updateTableData = (req, res) => executeCrud(req, res, 'update');
const deleteTableData = (req, res) => executeCrud(req, res, 'delete');

module.exports = {
  getAllTablesData,
  getAllTablesDataObject,
  getTableData,
  allowedTables,
  createTableData,
  updateTableData,
  deleteTableData,
};
