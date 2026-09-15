import { getPool, sql } from '../config/db.js';
import nodemailer from 'nodemailer';
import { takeOtp } from './authController.js';

const mailTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
});

export async function getProfile(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, Number(req.user.sub))
      .query(`
         SELECT nd.MaNguoiDung, nd.TenDangNhap, nd.HoTen, nd.Email,
           nd.SoDienThoai, nd.DiaChi, nd.HinhAnh, nd.MaVaiTro, vt.TenVaiTro
        FROM NguoiDung nd
        INNER JOIN VaiTro vt ON vt.MaVaiTro = nd.MaVaiTro
        WHERE nd.MaNguoiDung = @id
      `);

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: 'Unauthorized: user no longer exists.' });
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const phone = String(req.body?.phone || '').trim();
    const address = String(req.body?.address || '').trim();
    const image = String(req.body?.image || '').trim();
    const userId = Number(req.user?.sub);

    if (!name || !email) {
      return res.status(400).json({ message: 'Họ tên và email là bắt buộc.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ.' });
    }

    const pool = await getPool();
    const currentUser = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT TOP 1 Email FROM NguoiDung WHERE MaNguoiDung = @id');

    const currentEmail = String(currentUser.recordset[0]?.Email || '').trim().toLowerCase();
    const emailChanged = email !== currentEmail;

    if (emailChanged && !takeOtp(email, 'profile_email_change', req.body?.otp)) {
      return res.status(400).json({ message: 'Mã OTP đổi email không đúng hoặc đã hết hạn.' });
    }

    const existing = await pool.request()
      .input('email', sql.VarChar(100), email)
      .input('id', sql.Int, userId)
      .query('SELECT TOP 1 MaNguoiDung FROM NguoiDung WHERE Email = @email AND MaNguoiDung <> @id');
    if (existing.recordset[0]) {
      return res.status(409).json({ message: 'Email đã được sử dụng bởi tài khoản khác.' });
    }

    const result = await pool.request()
      .input('id', sql.Int, userId)
      .input('name', sql.NVarChar(100), name)
      .input('email', sql.VarChar(100), email)
      .input('phone', sql.VarChar(20), phone || null)
      .input('address', sql.NVarChar(300), address || null)
      .input('image', sql.NVarChar(500), image || null)
      .query(`
        UPDATE NguoiDung
        SET HoTen = @name, Email = @email, SoDienThoai = @phone, DiaChi = @address, HinhAnh = @image
        WHERE MaNguoiDung = @id;
        SELECT nd.MaNguoiDung, nd.TenDangNhap, nd.HoTen, nd.Email,
               nd.SoDienThoai, nd.DiaChi, nd.HinhAnh, nd.MaVaiTro, vt.TenVaiTro
        FROM NguoiDung nd
        INNER JOIN VaiTro vt ON vt.MaVaiTro = nd.MaVaiTro
        WHERE nd.MaNguoiDung = @id;
      `);

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    return res.json({ message: 'Cập nhật thông tin thành công.', user });
  } catch (error) {
    return next(error);
  }
}

export async function getVehicleAvailabilityAlert(req, res, next) {
  try {
    const pool = await getPool();
    const userId = Number(req.user.sub);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT MaThongBao, TenXeTimKiem, TrangThai, NgayDangKy, NgayThongBao
        FROM dbo.ThongBaoCoXe
        WHERE MaNguoiDung = @userId AND TrangThai = N'Đang chờ'
        ORDER BY MaThongBao
      `);
    const alerts = result.recordset;
    const vehicles = await findAvailableVehicles(pool, alerts.map((alert) => alert.TenXeTimKiem));
    return res.json({ alerts, vehicles, hasAvailable: vehicles.length > 0 });
  } catch (error) {
    return next(error);
  }
}

export async function sendVehicleAvailabilityAlert(req, res, next) {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Chỉ khách hàng mới được dùng chức năng này.' });
    const names = Array.isArray(req.body?.vehicleNames)
      ? [...new Set(req.body.vehicleNames.map((name) => String(name || '').trim()).filter(Boolean))].slice(0, 3)
      : [];
    if (!names.length) return res.status(400).json({ message: 'Vui lòng nhập ít nhất một tên xe.' });

    const pool = await getPool();
    const userResult = await pool.request()
      .input('userId', sql.Int, Number(req.user.sub))
      .query('SELECT Email, HoTen FROM NguoiDung WHERE MaNguoiDung = @userId');
    const customer = userResult.recordset[0];
    if (!customer?.Email) return res.status(400).json({ message: 'Tài khoản chưa có email để nhận thông báo.' });

    if (req.body?.notify !== true) {
      await syncVehicleAlerts(pool, Number(req.user.sub), names);
    }

    const vehicles = await findAvailableVehicles(pool, names);
    if (!vehicles.length) return res.json({ message: 'Hiện chưa có mẫu xe nào trong danh sách bạn nhập.', vehicles: [] });
    if (req.body?.notify !== true) return res.json({ message: 'Đã lưu danh sách xe quan tâm.', vehicles });

    const vehicleRows = vehicles.map((vehicle) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:700;">${vehicle.TenXe}</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#d65335;">${Number(vehicle.Gia).toLocaleString('vi-VN')} VNĐ</td></tr>`).join('');
    await mailTransport.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: customer.Email,
      subject: 'WebXe: Mẫu xe bạn quan tâm đã có hàng',
      text: `Xin chào ${customer.HoTen || 'khách hàng'}, các mẫu xe sau hiện đang có hàng: ${vehicles.map((vehicle) => vehicle.TenXe).join(', ')}.`,
      html: `<div style="margin:0;padding:30px 16px;background:#f4f6f8;font-family:Arial,sans-serif;color:#1f2937;"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;"><div style="padding:24px 28px;background:#182b28;color:#fff;font-size:22px;font-weight:700;">WebXe báo xe có hàng</div><div style="padding:28px;"><p>Xin chào ${customer.HoTen || 'khách hàng'},</p><p>Các mẫu xe bạn quan tâm hiện đang có sẵn:</p><table style="width:100%;border-collapse:collapse;">${vehicleRows}</table><p style="margin-top:24px;color:#6b7280;font-size:13px;">Hãy truy cập WebXe để xem thông tin chi tiết và liên hệ cửa hàng.</p></div></div></div>`,
    });
    return res.json({ message: `Đã gửi thông báo đến ${customer.Email}.`, vehicles });
  } catch (error) {
    return next(error);
  }
}

async function syncVehicleAlerts(pool, userId, names) {
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await transaction.request()
      .input('userId', sql.Int, userId)
      .query('DELETE FROM dbo.ThongBaoCoXe WHERE MaNguoiDung = @userId');
    for (const name of names) {
      await transaction.request()
        .input('userId', sql.Int, userId)
        .input('vehicleName', sql.NVarChar(150), name)
        .query(`
          INSERT INTO dbo.ThongBaoCoXe (MaNguoiDung, TenXeTimKiem, TrangThai)
          VALUES (@userId, LTRIM(RTRIM(@vehicleName)), N'Đang chờ')
        `);
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function findAvailableVehicles(pool, names) {
  if (!names.length) return [];
  const request = pool.request();
  names.forEach((name, index) => request.input(`name${index}`, sql.NVarChar(150), name));
  const conditions = names
    .map((_, index) => `LOWER(LTRIM(RTRIM(TenXe))) LIKE '%' + LOWER(LTRIM(RTRIM(@name${index}))) + '%'`)
    .join(' OR ');
  const result = await request.query(`
    SELECT MaXe, TenXe, Gia, SoLuong
    FROM dbo.Xe
    WHERE SoLuong > 0 AND (${conditions})
    ORDER BY TenXe
  `);
  return result.recordset;
}
