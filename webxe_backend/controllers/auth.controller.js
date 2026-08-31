const jwt = require('jsonwebtoken');
const { sql } = require('../config/db');
require('dotenv').config();

/*
  Stored procedure gợi ý trong SQL Server:

  CREATE OR ALTER PROCEDURE sp_KiemTraDangNhap
      @TenDangNhap VARCHAR(50),
      @MatKhau VARCHAR(255)
  AS
  BEGIN
      SELECT TOP 1
          nd.MaNguoiDung,
          nd.MaVaiTro,
          nd.TenDangNhap,
          nd.HoTen,
          nd.Email
      FROM NguoiDung nd
      WHERE nd.TenDangNhap = @TenDangNhap
        AND nd.MatKhau = @MatKhau;
  END;
*/

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Tên đăng nhập và mật khẩu là bắt buộc',
    });
  }

  try {
    const request = new sql.Request();

    const result = await request
      .input('TenDangNhap', sql.VarChar(50), username)
      .input('MatKhau', sql.VarChar(255), password)
      .execute('sp_KiemTraDangNhap');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({
        message: 'Sai tài khoản hoặc mật khẩu',
      });
    }

    const token = jwt.sign(
      {
        UserId: user.MaNguoiDung,
        RoleId: user.MaVaiTro,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
    });
  } catch (error) {
    console.error('Lỗi login:', error);
    return res.status(500).json({
      message: 'Lỗi server khi đăng nhập',
    });
  }
}

module.exports = { login };
