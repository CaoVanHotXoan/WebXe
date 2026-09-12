import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { getPool, sql } from '../config/db.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 3600000,
  path: '/'
};

const otpStore = new Map();
const otpLifetimeMs = Number(process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000;
const mailTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD }
});

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function createOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtp(email, purpose) {
  const otp = createOtp();
  otpStore.set(`${purpose}:${email}`, { otp, expiresAt: Date.now() + otpLifetimeMs });
  await mailTransport.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: email,
    subject: purpose === 'register' ? 'Mã OTP đăng ký tài khoản WebXe' : 'Mã OTP đổi mật khẩu WebXe',
    text: `Mã xác nhận của bạn là ${otp}. Mã có hiệu lực trong ${process.env.OTP_EXPIRE_MINUTES || 10} phút.`
  });
}

function takeOtp(email, purpose, inputOtp) {
  const key = `${purpose}:${email}`;
  const saved = otpStore.get(key);
  if (!saved || saved.expiresAt < Date.now() || saved.otp !== String(inputOtp || '').trim()) {
    return false;
  }
  otpStore.delete(key);
  return true;
}

export async function login(req, res, next) {
  try {
    const { tenDangNhap, email, password } = req.body ?? {};
    const loginName = String(tenDangNhap || email || '').trim();

    if (!loginName || typeof password !== 'string') {
      return res.status(400).json({ message: 'tenDangNhap/email và password là bắt buộc.' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('loginName', sql.VarChar(100), loginName)
      .query(`
        SELECT TOP 1 nd.MaNguoiDung, nd.TenDangNhap, nd.MatKhau, nd.HoTen,
               nd.Email, nd.SoDienThoai, nd.HinhAnh, nd.MaVaiTro, vt.TenVaiTro
        FROM NguoiDung nd
        INNER JOIN VaiTro vt ON vt.MaVaiTro = nd.MaVaiTro
        WHERE nd.TenDangNhap = @loginName OR nd.Email = @loginName
      `);

    const user = result.recordset[0];
    const passwordMatches = user && await bcrypt.compare(password, user.MatKhau);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    const role = user.TenVaiTro?.toLowerCase() === 'admin' || user.MaVaiTro === 1 ? 'admin' : 'user';
    const token = jwt.sign(
      { sub: user.MaNguoiDung, username: user.TenDangNhap, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.cookie('token', token, cookieOptions);
    return res.json({
      message: 'Đăng nhập thành công.',
      token,
      user: { id: user.MaNguoiDung, username: user.TenDangNhap, name: user.HoTen, email: user.Email, role }
    });
  } catch (error) {
    return next(error);
  }
}

export async function requestRegisterOtp(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const username = String(req.body?.username || '').trim();
    const fullName = String(req.body?.fullName || '').trim();
    if (!/^\S+@gmail\.com$/i.test(email) || !username || !fullName) {
      return res.status(400).json({ message: 'Email Gmail, tên đăng nhập và họ tên là bắt buộc.' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .input('email', sql.VarChar(100), email)
      .query('SELECT TOP 1 TenDangNhap, Email FROM NguoiDung WHERE TenDangNhap = @username OR Email = @email');
    if (result.recordset[0]) {
      return res.status(409).json({ message: 'Tên đăng nhập hoặc email đã được sử dụng.' });
    }

    await sendOtp(email, 'register');
    return res.json({ message: 'Mã OTP đã được gửi đến Gmail của bạn.' });
  } catch (error) {
    return next(error);
  }
}

export async function verifyRegister(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = req.body?.otp;
    const username = String(req.body?.username || '').trim();
    const fullName = String(req.body?.fullName || '').trim();
    const password = req.body?.password;
    if (!takeOtp(email, 'register', otp)) return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    if (!username || !fullName || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Thông tin đăng ký không hợp lệ.' });
    }

    const pool = await getPool();
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.request()
      .input('roleId', sql.Int, 2)
      .input('username', sql.VarChar(50), username)
      .input('password', sql.VarChar(255), passwordHash)
      .input('fullName', sql.NVarChar(100), fullName)
      .input('email', sql.VarChar(100), email)
      .query('INSERT INTO NguoiDung (MaVaiTro, TenDangNhap, MatKhau, HoTen, Email) VALUES (@roleId, @username, @password, @fullName, @email)');
    return res.status(201).json({ message: 'Đăng ký thành công.' });
  } catch (error) {
    return next(error);
  }
}

export async function requestForgotPasswordOtp(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!/^\S+@gmail\.com$/i.test(email)) return res.status(400).json({ message: 'Vui lòng nhập địa chỉ Gmail hợp lệ.' });
    const pool = await getPool();
    const result = await pool.request().input('email', sql.VarChar(100), email)
      .query('SELECT TOP 1 MaNguoiDung FROM NguoiDung WHERE Email = @email');
    if (!result.recordset[0]) return res.status(404).json({ message: 'Email chưa được đăng ký.' });
    await sendOtp(email, 'forgot_password');
    return res.json({ message: 'Mã OTP đổi mật khẩu đã được gửi đến Gmail của bạn.' });
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const newPassword = req.body?.newPassword;
    if (!takeOtp(email, 'forgot_password', req.body?.otp)) return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    if (typeof newPassword !== 'string' || newPassword.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const result = await (await getPool()).request()
      .input('email', sql.VarChar(100), email)
      .input('password', sql.VarChar(255), passwordHash)
      .query('UPDATE NguoiDung SET MatKhau = @password WHERE Email = @email');
    if (!result.rowsAffected[0]) return res.status(404).json({ message: 'Email chưa được đăng ký.' });
    return res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    return next(error);
  }
}

export function logout(req, res) {
  return res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' })
    .json({ message: 'Đăng xuất thành công.' });
}
