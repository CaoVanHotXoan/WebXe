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

module.exports = {
  getAllTablesData,
  getAllTablesDataObject,
  getTableData,
  allowedTables,
};
