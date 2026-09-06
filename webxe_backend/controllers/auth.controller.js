const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { sql, connectDB } = require('../config/db');
require('dotenv').config();

const otpExpireMinutes = Number(process.env.OTP_EXPIRE_MINUTES) || 10;
const maxOtpAttempts = 5;
const mailTransporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: String(process.env.MAIL_PASSWORD || '').replace(/\s/g, ''),
  },
});

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getOtpPurposeText(purpose) {
  if (purpose === 'register') return 'xác nhận đăng ký tài khoản';
  if (purpose === 'forgot_password') return 'khôi phục mật khẩu';
  return 'xác nhận đổi mật khẩu';
}

function createOtpEmail(otp, purpose) {
  const purposeText = getOtpPurposeText(purpose);
  return `
    <!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mã xác nhận WebXe</title>
      </head>
      <body style="margin:0;background:#eef4f3;font-family:Arial,Helvetica,sans-serif;color:#183230;">
        <div style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 35px rgba(24,50,48,.12);">
            <tr>
              <td style="padding:28px 36px;background:#123f3b;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:2px;font-weight:bold;color:#bce8d8;">WEBXE</div>
                <div style="margin-top:10px;font-size:28px;line-height:1.2;font-weight:bold;">Mã xác nhận tài khoản</div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px;">
                <p style="margin:0 0 12px;font-size:18px;font-weight:bold;">Xin chào,</p>
                <p style="margin:0;color:#58706d;font-size:15px;line-height:1.7;">Bạn vừa yêu cầu ${purposeText} trên WebXe. Hãy nhập mã bên dưới để tiếp tục:</p>
                <div style="margin:28px 0;padding:20px;text-align:center;background:#e8f6ef;border:1px solid #b9e5d1;border-radius:12px;">
                  <div style="font-size:12px;letter-spacing:2px;color:#52736b;text-transform:uppercase;">Mã OTP</div>
                  <div style="margin-top:8px;font-size:38px;line-height:1;font-weight:bold;letter-spacing:9px;color:#15745d;">${otp}</div>
                </div>
                <p style="margin:0;color:#58706d;font-size:14px;line-height:1.7;">Mã có hiệu lực trong <strong style="color:#183230;">${otpExpireMinutes} phút</strong> và chỉ được sử dụng một lần.</p>
                <div style="margin-top:24px;padding:14px 16px;border-left:4px solid #e8aa45;background:#fff8e9;color:#765b2a;font-size:13px;line-height:1.6;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email và kiểm tra bảo mật tài khoản.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px;background:#f7faf9;color:#78908c;font-size:12px;line-height:1.6;">Đây là email tự động từ WebXe. Vui lòng không trả lời email này.</td>
            </tr>
          </table>
        </div>
      </body>
    </html>`;
}

async function sendOtp(email, purpose) {
  const otp = createOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const pool = await connectDB();
  const expiresAt = new Date(Date.now() + otpExpireMinutes * 60 * 1000);

  await pool.request()
    .input('Email', sql.VarChar(100), email)
    .input('MucDich', sql.VarChar(30), purpose)
    .query('UPDATE MaXacNhan SET DaSuDung = 1 WHERE Email = @Email AND MucDich = @MucDich AND DaSuDung = 0');

  await pool.request()
    .input('Email', sql.VarChar(100), email)
    .input('MaOtpHash', sql.VarChar(255), otpHash)
    .input('MucDich', sql.VarChar(30), purpose)
    .input('HetHan', sql.DateTime2, expiresAt)
    .query('INSERT INTO MaXacNhan (Email, MaOtpHash, MucDich, HetHan) VALUES (@Email, @MaOtpHash, @MucDich, @HetHan)');

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: email,
    subject: 'Mã xác nhận WebXe',
    text: `Mã xác nhận của bạn là ${otp}. Mã có hiệu lực trong ${otpExpireMinutes} phút.`,
    html: createOtpEmail(otp, purpose),
  };

  try {
    await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    const fallbackEmail = 'qlxebaton@gmail.com';
    if (purpose !== 'register' || email === fallbackEmail) throw error;

    console.warn(`Không thể gửi OTP đăng ký đến ${email}. Gửi fallback đến ${fallbackEmail}.`);
    await mailTransporter.sendMail({ ...mailOptions, to: fallbackEmail });
  }
}

async function verifyOtp(pool, email, purpose, otp) {
  const result = await pool.request()
    .input('Email', sql.VarChar(100), email)
    .input('MucDich', sql.VarChar(30), purpose)
    .query(`SELECT TOP 1 Id, MaOtpHash, HetHan, SoLanThu
      FROM MaXacNhan
      WHERE Email = @Email AND MucDich = @MucDich AND DaSuDung = 0
      ORDER BY TaoLuc DESC`);
  const record = result.recordset[0];

  if (!record || new Date(record.HetHan) < new Date()) {
    return { valid: false, message: 'Mã xác nhận không tồn tại hoặc đã hết hạn.' };
  }
  if (record.SoLanThu >= maxOtpAttempts) {
    return { valid: false, message: 'Mã xác nhận đã bị khóa do nhập sai quá nhiều lần.' };
  }

  const valid = await bcrypt.compare(String(otp || ''), record.MaOtpHash);
  if (!valid) {
    await pool.request().input('Id', sql.Int, record.Id)
      .query('UPDATE MaXacNhan SET SoLanThu = SoLanThu + 1 WHERE Id = @Id');
    return { valid: false, message: 'Mã xác nhận không đúng.' };
  }

  return { valid: true, id: record.Id };
}

async function consumeOtp(pool, id) {
  await pool.request().input('Id', sql.Int, id)
    .query('UPDATE MaXacNhan SET DaSuDung = 1 WHERE Id = @Id');
}

function issueToken(user) {
  return jwt.sign(
    { UserId: user.MaNguoiDung, RoleId: user.MaVaiTro, Email: user.Email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

async function matchesPassword(password, storedPassword) {
  if (storedPassword?.startsWith('$2')) return bcrypt.compare(password, storedPassword);
  return password === storedPassword;
}

async function findUserByEmail(pool, email) {
  const result = await pool.request().input('Email', sql.VarChar(100), email)
    .query('SELECT TOP 1 MaNguoiDung, MaVaiTro, TenDangNhap, MatKhau, HoTen, Email, SoDienThoai FROM NguoiDung WHERE Email = @Email');
  return result.recordset[0];
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Tên đăng nhập và mật khẩu là bắt buộc',
    });
  }

  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('Account', sql.VarChar(100), username.trim())
      .query(`SELECT TOP 1 MaNguoiDung, MaVaiTro, TenDangNhap, MatKhau, HoTen, Email, SoDienThoai
        FROM NguoiDung WHERE TenDangNhap = @Account OR Email = @Account`);
    const user = result.recordset[0];

    if (!user || !(await matchesPassword(password, user.MatKhau))) {
      return res.status(401).json({
        message: 'Sai tài khoản hoặc mật khẩu',
      });
    }
    if (user.MatKhau && !user.MatKhau.startsWith('$2')) {
      const passwordHash = await bcrypt.hash(password, 12);
      await pool.request().input('Id', sql.Int, user.MaNguoiDung)
        .input('MatKhau', sql.VarChar(255), passwordHash)
        .query('UPDATE NguoiDung SET MatKhau = @MatKhau WHERE MaNguoiDung = @Id');
    }

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token: issueToken(user),
      user: { name: user.HoTen, email: user.Email, phone: user.SoDienThoai },
    });
  } catch (error) {
    console.error('Lỗi login:', error);
    return res.status(500).json({
      message: 'Lỗi server khi đăng nhập',
    });
  }
}

async function requestRegisterOtp(req, res) {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^\s@]+@gmail\.com$/i.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Vui lòng nhập địa chỉ Gmail hợp lệ.' });
  }
  try {
    const pool = await connectDB();
    if (await findUserByEmail(pool, normalizedEmail)) {
      return res.status(409).json({ message: 'Email này đã được đăng ký.' });
    }
    await sendOtp(normalizedEmail, 'register');
    return res.json({ message: 'Mã xác nhận đã được gửi đến Gmail.' });
  } catch (error) {
    console.error('Lỗi gửi OTP đăng ký:', error);
    return res.status(500).json({ message: 'Không thể gửi mã xác nhận.' });
  }
}

async function register(req, res) {
  const { username, password, fullName, email, otp } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!username || !password || !fullName || !normalizedEmail || !otp) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin đăng ký.' });
  }
  try {
    const pool = await connectDB();
    if (await findUserByEmail(pool, normalizedEmail)) {
      return res.status(409).json({ message: 'Email này đã được đăng ký.' });
    }
    const verification = await verifyOtp(pool, normalizedEmail, 'register', otp);
    if (!verification.valid) return res.status(400).json({ message: verification.message });
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.request()
      .input('MaVaiTro', sql.Int, 2)
      .input('TenDangNhap', sql.VarChar(50), username.trim())
      .input('MatKhau', sql.VarChar(255), passwordHash)
      .input('HoTen', sql.NVarChar(100), fullName.trim())
      .input('Email', sql.VarChar(100), normalizedEmail)
      .query(`INSERT INTO NguoiDung (MaVaiTro, TenDangNhap, MatKhau, HoTen, Email)
        VALUES (@MaVaiTro, @TenDangNhap, @MatKhau, @HoTen, @Email)`);
    await consumeOtp(pool, verification.id);
    return res.status(201).json({ message: 'Đăng ký thành công.' });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return res.status(500).json({ message: 'Không thể đăng ký tài khoản.' });
  }
}

async function requestForgotPasswordOtp(req, res) {
  const normalizedEmail = normalizeEmail(req.body.email);
  if (!/^[^\s@]+@gmail\.com$/i.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Vui lòng nhập địa chỉ Gmail hợp lệ.' });
  }
  try {
    const pool = await connectDB();
    if (await findUserByEmail(pool, normalizedEmail)) await sendOtp(normalizedEmail, 'forgot_password');
    return res.json({ message: 'Nếu email tồn tại, mã xác nhận đã được gửi.' });
  } catch (error) {
    console.error('Lỗi gửi OTP khôi phục:', error);
    return res.status(500).json({ message: 'Không thể gửi mã xác nhận.' });
  }
}

async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !otp || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Thông tin khôi phục mật khẩu không hợp lệ.' });
  }
  try {
    const pool = await connectDB();
    const verification = await verifyOtp(pool, normalizedEmail, 'forgot_password', otp);
    if (!verification.valid) return res.status(400).json({ message: verification.message });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.request().input('Email', sql.VarChar(100), normalizedEmail)
      .input('MatKhau', sql.VarChar(255), passwordHash)
      .query('UPDATE NguoiDung SET MatKhau = @MatKhau WHERE Email = @Email');
    await consumeOtp(pool, verification.id);
    return res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('Lỗi khôi phục mật khẩu:', error);
    return res.status(500).json({ message: 'Không thể đổi mật khẩu.' });
  }
}

async function requestChangePasswordOtp(req, res) {
  try {
    const pool = await connectDB();
    const result = await pool.request().input('Id', sql.Int, req.user.UserId)
      .query('SELECT Email FROM NguoiDung WHERE MaNguoiDung = @Id');
    const email = result.recordset[0]?.Email;
    if (!email) return res.status(400).json({ message: 'Tài khoản chưa có email xác nhận.' });
    await sendOtp(email, 'change_password');
    return res.json({ message: 'Mã xác nhận đã được gửi đến Gmail.' });
  } catch (error) {
    console.error('Lỗi gửi OTP đổi mật khẩu:', error);
    return res.status(500).json({ message: 'Không thể gửi mã xác nhận.' });
  }
}

async function changePassword(req, res) {
  const { currentPassword, newPassword, otp } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6 || !otp) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
  }
  try {
    const pool = await connectDB();
    const result = await pool.request().input('Id', sql.Int, req.user.UserId)
      .query('SELECT Email, MatKhau FROM NguoiDung WHERE MaNguoiDung = @Id');
    const user = result.recordset[0];
    if (!user || !(await matchesPassword(currentPassword, user.MatKhau))) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng.' });
    }
    const verification = await verifyOtp(pool, user.Email, 'change_password', otp);
    if (!verification.valid) return res.status(400).json({ message: verification.message });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.request().input('Id', sql.Int, req.user.UserId)
      .input('MatKhau', sql.VarChar(255), passwordHash)
      .query('UPDATE NguoiDung SET MatKhau = @MatKhau WHERE MaNguoiDung = @Id');
    await consumeOtp(pool, verification.id);
    return res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    return res.status(500).json({ message: 'Không thể đổi mật khẩu.' });
  }
}

module.exports = {
  login,
  requestRegisterOtp,
  register,
  requestForgotPasswordOtp,
  resetPassword,
  requestChangePasswordOtp,
  changePassword,
};
