const jwt = require('jsonwebtoken');
const { sql } = require('../config/db');
require('dotenv').config();

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Tên đăng nhập và mật khẩu là bắt buộc' });
  }

  try {
    const request = new sql.Request();
    const result = await request
      .input('username', sql.VarChar(50), username)
      .input('password', sql.VarChar(255), password)
      .query(`
        SELECT TOP 1 *
        FROM Users
        WHERE username = @username AND password = @password
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    const user = result.recordset[0];
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role || 'user',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
}

module.exports = { login };
