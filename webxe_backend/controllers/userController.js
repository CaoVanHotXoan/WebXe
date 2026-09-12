import { getPool, sql } from '../config/db.js';

export async function getProfile(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, Number(req.user.sub))
      .query(`
        SELECT nd.MaNguoiDung, nd.TenDangNhap, nd.HoTen, nd.Email,
               nd.SoDienThoai, nd.HinhAnh, nd.MaVaiTro, vt.TenVaiTro
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
