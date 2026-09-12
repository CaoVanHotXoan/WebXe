import { getPool, sql } from '../config/db.js';

// Whitelist này khớp với ThuTuc.sql; client không thể truyền tên procedure tùy ý.
const p = (type, required = true) => ({ type, required });
export const procedureDefinitions = {
  sp_ThemVaiTro: { TenVaiTro: p(sql.NVarChar(50)) }, sp_SuaVaiTro: { MaVaiTro: p(sql.Int), TenVaiTro: p(sql.NVarChar(50)) }, sp_XoaVaiTro: { MaVaiTro: p(sql.Int) },
  sp_ThemNguoiDung: { MaVaiTro: p(sql.Int), TenDangNhap: p(sql.VarChar(50)), MatKhau: p(sql.VarChar(255)), HoTen: p(sql.NVarChar(100)), Email: p(sql.VarChar(100), false), SoDienThoai: p(sql.VarChar(20), false), HinhAnh: p(sql.NVarChar(500), false) },
  sp_SuaNguoiDung: { MaNguoiDung: p(sql.Int), MaVaiTro: p(sql.Int), TenDangNhap: p(sql.VarChar(50)), MatKhau: p(sql.VarChar(255)), HoTen: p(sql.NVarChar(100)), Email: p(sql.VarChar(100), false), SoDienThoai: p(sql.VarChar(20), false), HinhAnh: p(sql.NVarChar(500), false) }, sp_XoaNguoiDung: { MaNguoiDung: p(sql.Int) },
  sp_ThemHangXe: { TenHang: p(sql.NVarChar(100)), Logo: p(sql.NVarChar(500), false) }, sp_SuaHangXe: { MaHang: p(sql.Int), TenHang: p(sql.NVarChar(100)), Logo: p(sql.NVarChar(500), false) }, sp_XoaHangXe: { MaHang: p(sql.Int) },
  sp_ThemLoaiXe: { TenLoai: p(sql.NVarChar(100)) }, sp_SuaLoaiXe: { MaLoai: p(sql.Int), TenLoai: p(sql.NVarChar(100)) }, sp_XoaLoaiXe: { MaLoai: p(sql.Int) },
  sp_ThemXe: { MaHang: p(sql.Int), MaLoai: p(sql.Int), TenXe: p(sql.NVarChar(150)), Gia: p(sql.Decimal(18, 2)), NamSanXuat: p(sql.Int, false), MauSac: p(sql.NVarChar(100), false), MoTa: p(sql.NVarChar(sql.MAX), false), SoLuong: p(sql.Int, false) },
  sp_SuaXe: { MaXe: p(sql.Int), MaHang: p(sql.Int), MaLoai: p(sql.Int), TenXe: p(sql.NVarChar(150)), Gia: p(sql.Decimal(18, 2)), NamSanXuat: p(sql.Int, false), MauSac: p(sql.NVarChar(100), false), MoTa: p(sql.NVarChar(sql.MAX), false), SoLuong: p(sql.Int, false) }, sp_XoaXe: { MaXe: p(sql.Int) },
  sp_ThemHinhAnhXe: { MaXe: p(sql.Int), DuongDanAnh: p(sql.NVarChar(500)), LaAnhChinh: p(sql.Bit, false) }, sp_SuaHinhAnhXe: { MaHinhAnh: p(sql.Int), MaXe: p(sql.Int), DuongDanAnh: p(sql.NVarChar(500)), LaAnhChinh: p(sql.Bit, false) }, sp_XoaHinhAnhXe: { MaHinhAnh: p(sql.Int) },
  sp_ThemGioHang: { MaNguoiDung: p(sql.Int), NgayTao: p(sql.DateTime, false) }, sp_SuaGioHang: { MaGioHang: p(sql.Int), MaNguoiDung: p(sql.Int), NgayTao: p(sql.DateTime) }, sp_XoaGioHang: { MaGioHang: p(sql.Int) },
  sp_ThemChiTietGioHang: { MaGioHang: p(sql.Int), MaXe: p(sql.Int), SoLuong: p(sql.Int) }, sp_SuaChiTietGioHang: { MaGioHang: p(sql.Int), MaXe: p(sql.Int), SoLuong: p(sql.Int) }, sp_XoaChiTietGioHang: { MaGioHang: p(sql.Int), MaXe: p(sql.Int) },
  sp_ThemDonHang: { MaNguoiDung: p(sql.Int), HoTenNguoiNhan: p(sql.NVarChar(100)), SoDienThoai: p(sql.VarChar(20)), DiaChi: p(sql.NVarChar(300)), TongTien: p(sql.Decimal(18, 2)), PhuongThucThanhToan: p(sql.NVarChar(50), false), TrangThai: p(sql.NVarChar(50)), NgayDat: p(sql.DateTime, false) },
  sp_SuaDonHang: { MaDonHang: p(sql.Int), MaNguoiDung: p(sql.Int), HoTenNguoiNhan: p(sql.NVarChar(100)), SoDienThoai: p(sql.VarChar(20)), DiaChi: p(sql.NVarChar(300)), TongTien: p(sql.Decimal(18, 2)), PhuongThucThanhToan: p(sql.NVarChar(50), false), TrangThai: p(sql.NVarChar(50)), NgayDat: p(sql.DateTime) }, sp_XoaDonHang: { MaDonHang: p(sql.Int) },
  sp_ThemChiTietDonHang: { MaDonHang: p(sql.Int), MaXe: p(sql.Int), SoLuong: p(sql.Int), DonGia: p(sql.Decimal(18, 2)) }, sp_SuaChiTietDonHang: { MaDonHang: p(sql.Int), MaXe: p(sql.Int), SoLuong: p(sql.Int), DonGia: p(sql.Decimal(18, 2)) }, sp_XoaChiTietDonHang: { MaDonHang: p(sql.Int), MaXe: p(sql.Int) },
  sp_ThemDanhMucTinTuc: { TenDanhMuc: p(sql.NVarChar(100)) }, sp_SuaDanhMucTinTuc: { MaDanhMuc: p(sql.Int), TenDanhMuc: p(sql.NVarChar(100)) }, sp_XoaDanhMucTinTuc: { MaDanhMuc: p(sql.Int) },
  sp_ThemTinTuc: { MaDanhMuc: p(sql.Int), TieuDe: p(sql.NVarChar(255)), TomTat: p(sql.NVarChar(500), false), NoiDung: p(sql.NVarChar(sql.MAX)), HinhAnh: p(sql.NVarChar(500), false), NgayDang: p(sql.DateTime, false) },
  sp_SuaTinTuc: { MaTinTuc: p(sql.Int), MaDanhMuc: p(sql.Int), TieuDe: p(sql.NVarChar(255)), TomTat: p(sql.NVarChar(500), false), NoiDung: p(sql.NVarChar(sql.MAX)), HinhAnh: p(sql.NVarChar(500), false), NgayDang: p(sql.DateTime) }, sp_XoaTinTuc: { MaTinTuc: p(sql.Int) }
};

export async function executeProcedure(req, res, next) {
  try {
    const definition = procedureDefinitions[req.params.procedureName];
    if (!definition) return res.status(404).json({ message: 'Stored Procedure không nằm trong whitelist.' });

    const body = req.body ?? {};
    for (const [name, { required }] of Object.entries(definition)) {
      if (required && (body[name] === undefined || body[name] === null)) return res.status(400).json({ message: `Thiếu tham số ${name}.` });
    }

    const request = (await getPool()).request();
    for (const [name, { type, required }] of Object.entries(definition)) {
      const value = body[name] === undefined ? null : body[name];
      if (value === null && required) return res.status(400).json({ message: `Tham số ${name} không được null.` });
      request.input(name, type, value);
    }

    await request.execute(req.params.procedureName);
    return res.json({ message: `${req.params.procedureName} thực thi thành công.` });
  } catch (error) {
    return next(error);
  }
}
