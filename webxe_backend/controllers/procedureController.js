import { getPool, sql } from '../config/db.js';
import { deleteCloudinaryImage } from './mediaController.js';
import nodemailer from 'nodemailer';
import { takeOtp } from './authController.js';

const mailTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
});
const clientUrl = 'https://fontend-webxe.vercel.app/';

const imageDeleteTargets = {
  sp_XoaNguoiDung: { table: 'NguoiDung', id: 'MaNguoiDung', columns: ['HinhAnh'] },
  sp_XoaHangXe: { table: 'HangXe', id: 'MaHang', columns: ['Logo'] },
  sp_XoaHinhAnhXe: { table: 'HinhAnhXe', id: 'MaHinhAnh', columns: ['DuongDanAnh'] },
  sp_XoaTinTuc: { table: 'TinTuc', id: 'MaTinTuc', columns: ['HinhAnh'] },
};

const imageUpdateTargets = {
  sp_SuaNguoiDung: { table: 'NguoiDung', id: 'MaNguoiDung', columns: ['HinhAnh'] },
  sp_SuaHangXe: { table: 'HangXe', id: 'MaHang', columns: ['Logo'] },
  sp_SuaHinhAnhXe: { table: 'HinhAnhXe', id: 'MaHinhAnh', columns: ['DuongDanAnh'] },
  sp_SuaTinTuc: { table: 'TinTuc', id: 'MaTinTuc', columns: ['HinhAnh'] },
};

// Whitelist này khớp với ThuTuc.sql; client không thể truyền tên procedure tùy ý.
const p = (type, required = true) => ({ type, required });
export const procedureDefinitions = {
  sp_ThemVaiTro: { TenVaiTro: p(sql.NVarChar(50)) }, sp_SuaVaiTro: { MaVaiTro: p(sql.Int), TenVaiTro: p(sql.NVarChar(50)) }, sp_XoaVaiTro: { MaVaiTro: p(sql.Int) },
  sp_ThemNguoiDung: { MaVaiTro: p(sql.Int), TenDangNhap: p(sql.VarChar(50)), MatKhau: p(sql.VarChar(255)), HoTen: p(sql.NVarChar(100)), Email: p(sql.VarChar(100), false), SoDienThoai: p(sql.VarChar(20), false), DiaChi: p(sql.NVarChar(300), false), HinhAnh: p(sql.NVarChar(500), false) },
  sp_SuaNguoiDung: { MaNguoiDung: p(sql.Int), MaVaiTro: p(sql.Int), TenDangNhap: p(sql.VarChar(50)), MatKhau: p(sql.VarChar(255)), HoTen: p(sql.NVarChar(100)), Email: p(sql.VarChar(100), false), SoDienThoai: p(sql.VarChar(20), false), DiaChi: p(sql.NVarChar(300), false), HinhAnh: p(sql.NVarChar(500), false) }, sp_XoaNguoiDung: { MaNguoiDung: p(sql.Int) },
  sp_ThemHangXe: { TenHang: p(sql.NVarChar(100)), Logo: p(sql.NVarChar(500), false) }, sp_SuaHangXe: { MaHang: p(sql.Int), TenHang: p(sql.NVarChar(100)), Logo: p(sql.NVarChar(500), false) }, sp_XoaHangXe: { MaHang: p(sql.Int) },
  sp_ThemLoaiXe: { TenLoai: p(sql.NVarChar(100)) }, sp_SuaLoaiXe: { MaLoai: p(sql.Int), TenLoai: p(sql.NVarChar(100)) }, sp_XoaLoaiXe: { MaLoai: p(sql.Int) },
  sp_ThemXe: { MaHang: p(sql.Int), MaLoai: p(sql.Int), TenXe: p(sql.NVarChar(150)), Gia: p(sql.Decimal(18, 2)), NamSanXuat: p(sql.Int, false), MauSac: p(sql.NVarChar(100), false), MoTa: p(sql.NVarChar(sql.MAX), false), SoLuong: p(sql.Int, false) },
  sp_SuaXe: { MaXe: p(sql.Int), MaHang: p(sql.Int), MaLoai: p(sql.Int), TenXe: p(sql.NVarChar(150)), Gia: p(sql.Decimal(18, 2)), NamSanXuat: p(sql.Int, false), MauSac: p(sql.NVarChar(100), false), MoTa: p(sql.NVarChar(sql.MAX), false), SoLuong: p(sql.Int, false) }, sp_XoaXe: { MaXe: p(sql.Int) },
  sp_ThemHinhAnhXe: { MaXe: p(sql.Int), DuongDanAnh: p(sql.NVarChar(500)), LaAnhChinh: p(sql.Bit, false) }, sp_SuaHinhAnhXe: { MaHinhAnh: p(sql.Int), MaXe: p(sql.Int), DuongDanAnh: p(sql.NVarChar(500)), LaAnhChinh: p(sql.Bit, false) }, sp_XoaHinhAnhXe: { MaHinhAnh: p(sql.Int) },
  sp_ThemGioHang: { MaNguoiDung: p(sql.Int), NgayTao: p(sql.DateTime, false) }, sp_SuaGioHang: { MaGioHang: p(sql.Int), MaNguoiDung: p(sql.Int), NgayTao: p(sql.DateTime) }, sp_XoaGioHang: { MaGioHang: p(sql.Int) },
  sp_ThemChiTietGioHang: { MaGioHang: p(sql.Int), MaXe: p(sql.Int), SoLuong: p(sql.Int) }, sp_SuaChiTietGioHang: { MaGioHang: p(sql.Int), MaXe: p(sql.Int), SoLuong: p(sql.Int) }, sp_XoaChiTietGioHang: { MaGioHang: p(sql.Int), MaXe: p(sql.Int) },
  sp_ThemDonHang: { MaNguoiDung: p(sql.Int), HoTenNguoiNhan: p(sql.NVarChar(100)), SoDienThoai: p(sql.VarChar(20)), DiaChi: p(sql.NVarChar(300)), TongTien: p(sql.Decimal(18, 2)), PhuongThucThanhToan: p(sql.NVarChar(50), false), TrangThai: p(sql.NVarChar(50)), NgayDat: p(sql.DateTime, false) },
  sp_SuaDonHang: { MaDonHang: p(sql.Int), MaNguoiDung: p(sql.Int), HoTenNguoiNhan: p(sql.NVarChar(100)), SoDienThoai: p(sql.VarChar(20)), DiaChi: p(sql.NVarChar(300)), TongTien: p(sql.Decimal(18, 2)), PhuongThucThanhToan: p(sql.NVarChar(50), false), TrangThai: p(sql.NVarChar(50)), NgayDat: p(sql.DateTime) }, sp_XoaDonHang: { MaDonHang: p(sql.Int) },
  sp_ThemChiTietDonHang: { MaDonHang: p(sql.Int), MaXe: p(sql.Int), SoLuong: p(sql.Int), DonGia: p(sql.Decimal(18, 2)) }, sp_SuaChiTietDonHang: { MaDonHang: p(sql.Int), MaXe: p(sql.Int), MaXeCu: p(sql.Int, false), SoLuong: p(sql.Int), DonGia: p(sql.Decimal(18, 2)) }, sp_XoaChiTietDonHang: { MaDonHang: p(sql.Int), MaXe: p(sql.Int) },
  sp_ThemDonHangVaChiTiet: { MaNguoiDung: p(sql.Int), HoTenNguoiNhan: p(sql.NVarChar(100)), SoDienThoai: p(sql.VarChar(20)), DiaChi: p(sql.NVarChar(300)), TongTien: p(sql.Decimal(18, 2)), PhuongThucThanhToan: p(sql.NVarChar(50), false), TrangThai: p(sql.NVarChar(50)), NgayDat: p(sql.DateTime, false), MaXe: p(sql.Int), SoLuong: p(sql.Int), DonGia: p(sql.Decimal(18, 2)) },
  sp_ThemDanhMucTinTuc: { TenDanhMuc: p(sql.NVarChar(100)) }, sp_SuaDanhMucTinTuc: { MaDanhMuc: p(sql.Int), TenDanhMuc: p(sql.NVarChar(100)) }, sp_XoaDanhMucTinTuc: { MaDanhMuc: p(sql.Int) },
  sp_ThemTinTuc: { MaDanhMuc: p(sql.Int), TieuDe: p(sql.NVarChar(255)), TomTat: p(sql.NVarChar(500), false), NoiDung: p(sql.NVarChar(sql.MAX)), HinhAnh: p(sql.NVarChar(500), false), NgayDang: p(sql.DateTime, false) },
  sp_SuaTinTuc: { MaTinTuc: p(sql.Int), MaDanhMuc: p(sql.Int), TieuDe: p(sql.NVarChar(255)), TomTat: p(sql.NVarChar(500), false), NoiDung: p(sql.NVarChar(sql.MAX)), HinhAnh: p(sql.NVarChar(500), false), NgayDang: p(sql.DateTime) }, sp_XoaTinTuc: { MaTinTuc: p(sql.Int) }
};

export async function executeProcedure(req, res, next) {
  try {
    const definition = procedureDefinitions[req.params.procedureName];
    if (!definition) return res.status(404).json({ message: 'Stored Procedure không nằm trong whitelist.' });

    const body = req.body ?? {};
    if (['sp_ThemNguoiDung', 'sp_SuaNguoiDung'].includes(req.params.procedureName)) {
      const email = String(body.Email || '').trim().toLowerCase();
      const currentEmail = req.params.procedureName === 'sp_SuaNguoiDung'
        ? String((await (await getPool()).request()
          .input('userId', sql.Int, Number(body.MaNguoiDung))
          .query('SELECT TOP 1 Email FROM NguoiDung WHERE MaNguoiDung = @userId')).recordset[0]?.Email || '').trim().toLowerCase()
        : '';
      const emailChanged = req.params.procedureName === 'sp_ThemNguoiDung' || email !== currentEmail;
      if (emailChanged && !takeOtp(email, 'admin_user_email', body.otp)) {
        return res.status(400).json({ message: 'Mã OTP Gmail không đúng hoặc đã hết hạn.' });
      }
    }
    for (const [name, { required }] of Object.entries(definition)) {
      if (required && (body[name] === undefined || body[name] === null)) return res.status(400).json({ message: `Thiếu tham số ${name}.` });
    }

    const pool = await getPool();
    const imageUrls = await getImageUrlsBeforeDelete(pool, req.params.procedureName, body);
    const oldImageUrls = await getImageUrlsBeforeUpdate(pool, req.params.procedureName, body);
    const request = pool.request();
    for (const [name, { type, required }] of Object.entries(definition)) {
      const value = body[name] === undefined ? null : body[name];
      if (value === null && required) return res.status(400).json({ message: `Tham số ${name} không được null.` });
      request.input(name, type, value);
    }

    const result = await request.execute(req.params.procedureName);
    const vehicleNotification = ['sp_ThemXe', 'sp_SuaXe'].includes(req.params.procedureName)
      ? await notifyCustomersAboutVehicle(pool, body)
      : null;
    if (['sp_ThemChiTietDonHang', 'sp_SuaChiTietDonHang', 'sp_XoaChiTietDonHang'].includes(req.params.procedureName)) {
      await syncOrderTotal(pool, body.MaDonHang);
    }
    await deleteCloudinaryImages(imageUrls);
    await deleteReplacedCloudinaryImages(oldImageUrls, body, req.params.procedureName);
    return res.json({
      message: `${req.params.procedureName} thực thi thành công.`,
      record: result.recordset?.[0] ?? null,
      vehicleNotification,
    });
  } catch (error) {
    return next(error);
  }
}

async function notifyCustomersAboutVehicle(pool, vehicle) {
  const vehicleName = String(vehicle.TenXe || '').trim();
  if (!vehicleName || Number(vehicle.SoLuong) <= 0) {
    return { sent: 0, skipped: true };
  }

  const vehicleResult = await pool.request()
    .input('vehicleName', sql.NVarChar(150), vehicleName)
    .query(`
      SELECT TOP 1 MaXe, TenXe, Gia, SoLuong
      FROM dbo.Xe
      WHERE TenXe = @vehicleName
      ORDER BY MaXe DESC
    `);
  const savedVehicle = vehicleResult.recordset[0];
  if (!savedVehicle || Number(savedVehicle.SoLuong) <= 0) {
    return { sent: 0, skipped: true };
  }

  const result = await pool.request()
    .input('vehicleName', sql.NVarChar(150), savedVehicle.TenXe)
    .query(`
      SELECT tb.MaThongBao, tb.MaNguoiDung, tb.TenXeTimKiem,
             nd.Email, nd.HoTen
      FROM dbo.ThongBaoCoXe tb
      INNER JOIN dbo.NguoiDung nd ON nd.MaNguoiDung = tb.MaNguoiDung
      WHERE tb.TrangThai = N'Đang chờ'
        AND NULLIF(LTRIM(RTRIM(nd.Email)), '') IS NOT NULL
        AND CHARINDEX(
          LOWER(LTRIM(RTRIM(tb.TenXeTimKiem))),
          LOWER(LTRIM(RTRIM(@vehicleName)))
        ) > 0
    `);

  const recipients = new Map();
  for (const row of result.recordset) {
    const email = String(row.Email).trim().toLowerCase();
    const recipient = recipients.get(email) ?? {
      email,
      name: row.HoTen || 'khách hàng',
      alertIds: [],
    };
    recipient.alertIds.push(row.MaThongBao);
    recipients.set(email, recipient);
  }

  const deliveries = await Promise.allSettled([...recipients.values()].map(async (recipient) => {
    await mailTransport.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: recipient.email,
      subject: `WebXe: ${savedVehicle.TenXe} đã có hàng`,
      text: `Xin chào ${recipient.name}, xe ${savedVehicle.TenXe} đã có hàng.
Giá: ${formatPrice(savedVehicle.Gia)}
Xem chi tiết: ${clientUrl}ChiTietXe/ChiTietXe?id=${savedVehicle.MaXe}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
          <h2>WebXe báo xe có hàng</h2>
          <p>Xin chào ${escapeHtml(recipient.name)},</p>
          <p>Mẫu xe <strong>${escapeHtml(savedVehicle.TenXe)}</strong> bạn quan tâm hiện đã có hàng.</p>
          <p>Giá: <strong>${escapeHtml(formatPrice(savedVehicle.Gia))}</strong></p>
          <p><a href="${clientUrl}ChiTietXe/ChiTietXe?id=${savedVehicle.MaXe}">Xem chi tiết xe trên WebXe</a></p>
        </div>
      `,
    });

    await Promise.all(recipient.alertIds.map((alertId) => pool.request()
      .input('alertId', sql.Int, alertId)
      .query(`
        UPDATE dbo.ThongBaoCoXe
        SET TrangThai = N'Đã thông báo', NgayThongBao = GETDATE()
        WHERE MaThongBao = @alertId AND TrangThai = N'Đang chờ'
      `)));
  }));

  const sent = deliveries.filter((delivery) => delivery.status === 'fulfilled').length;
  deliveries
    .filter((delivery) => delivery.status === 'rejected')
    .forEach((delivery) => console.error('[Mail] Không gửi được thông báo có xe:', delivery.reason?.message || delivery.reason));

  return {
    sent,
    failed: deliveries.length - sent,
    matched: recipients.size,
    message: deliveries.length - sent > 0
      ? 'Có email gửi thất bại. Kiểm tra MAIL_HOST, MAIL_USER, MAIL_PASSWORD và log backend.'
      : sent > 0 ? `Đã gửi email thông báo đến ${sent} khách hàng.` : 'Không có khách hàng đăng ký tên xe này.',
  };
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

async function syncOrderTotal(pool, orderId) {
  await pool.request()
    .input('orderId', sql.Int, Number(orderId))
    .query(`
      UPDATE DonHang
      SET TongTien = (
        SELECT COALESCE(SUM(SoLuong * DonGia), 0)
        FROM ChiTietDonHang
        WHERE MaDonHang = @orderId
      )
      WHERE MaDonHang = @orderId
    `);
}

async function getImageUrlsBeforeDelete(pool, procedureName, body) {
  const target = imageDeleteTargets[procedureName];
  if (!target || body[target.id] === undefined || body[target.id] === null) {
    if (procedureName !== 'sp_XoaXe' || body.MaXe === undefined || body.MaXe === null) return [];
    const result = await pool.request()
      .input('id', sql.Int, body.MaXe)
      .query('SELECT DuongDanAnh FROM dbo.HinhAnhXe WHERE MaXe = @id');
    return result.recordset.map((row) => row.DuongDanAnh).filter(Boolean);
  }

  const result = await pool.request()
    .input('id', sql.Int, body[target.id])
    .query(`SELECT ${target.columns.join(', ')} FROM dbo.${target.table} WHERE ${target.id} = @id`);
  return result.recordset.flatMap((row) => target.columns.map((column) => row[column])).filter(Boolean);
}

async function getImageUrlsBeforeUpdate(pool, procedureName, body) {
  const target = imageUpdateTargets[procedureName];
  if (!target || body[target.id] === undefined || body[target.id] === null) return [];

  const result = await pool.request()
    .input('id', sql.Int, body[target.id])
    .query(`SELECT ${target.columns.join(', ')} FROM dbo.${target.table} WHERE ${target.id} = @id`);
  return result.recordset.flatMap((row) => target.columns.map((column) => row[column])).filter(Boolean);
}

async function deleteReplacedCloudinaryImages(oldImageUrls, body, procedureName) {
  const target = imageUpdateTargets[procedureName];
  if (!target || !oldImageUrls.length) return;

  const newImageUrls = target.columns
    .map((column) => body[column])
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim());
  const replacedUrls = oldImageUrls.filter((oldUrl) => !newImageUrls.includes(oldUrl));
  await deleteCloudinaryImages(replacedUrls);
}

async function deleteCloudinaryImages(imageUrls) {
  if (!imageUrls.length) return;
  const results = await Promise.allSettled(imageUrls.map((imageUrl) => deleteCloudinaryImage(imageUrl)));
  for (const result of results) {
    if (result.status === 'rejected') console.error('Không thể xóa ảnh trên Cloudinary:', result.reason);
  }
}
