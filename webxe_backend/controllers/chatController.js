import { getPool, sql } from '../config/db.js';

async function getConversationForUser(pool, conversationId, userId, isAdmin) {
  const request = pool.request().input('conversationId', sql.Int, conversationId);
  const condition = isAdmin ? '' : 'AND c.MaKhachHang = @userId';
  if (!isAdmin) request.input('userId', sql.Int, userId);
  const result = await request.query(`
    SELECT c.MaCuocHoiThoai, c.MaKhachHang, c.MaNhanVien, c.TrangThai, c.NgayTao
    FROM CuocHoiThoai c
    WHERE c.MaCuocHoiThoai = @conversationId ${condition}
  `);
  return result.recordset[0];
}

async function getMessages(pool, conversationId) {
  const result = await pool.request()
    .input('conversationId', sql.Int, conversationId)
    .query(`
      SELECT tn.MaTinNhan, tn.MaCuocHoiThoai, tn.MaNguoiGui, nd.HoTen, nd.MaVaiTro,
             tn.NoiDung, tn.ThoiGian, tn.DaXem
      FROM TinNhan tn
      INNER JOIN NguoiDung nd ON nd.MaNguoiDung = tn.MaNguoiGui
      WHERE tn.MaCuocHoiThoai = @conversationId
      ORDER BY tn.ThoiGian ASC, tn.MaTinNhan ASC
    `);
  return result.recordset;
}

export async function getCustomerConversation(req, res, next) {
  try {
    const userId = Number(req.user.sub);
    const pool = await getPool();
    let conversation = (await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT TOP 1 MaCuocHoiThoai, MaKhachHang, MaNhanVien, TrangThai, NgayTao
        FROM CuocHoiThoai
        WHERE MaKhachHang = @userId AND TrangThai <> N'Đã đóng'
        ORDER BY MaCuocHoiThoai DESC
      `)).recordset[0];

    if (!conversation) {
      const result = await pool.request()
        .input('MaKhachHang', sql.Int, userId)
        .execute('sp_ThemCuocHoiThoai');
      conversation = result.recordset[0];
      conversation = {
        ...conversation,
        MaKhachHang: userId,
        MaNhanVien: null,
        TrangThai: 'Đang chờ',
      };
    }

    return res.json({ conversation, messages: await getMessages(pool, conversation.MaCuocHoiThoai) });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminConversations(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT c.MaCuocHoiThoai, c.MaKhachHang, c.MaNhanVien, c.TrangThai, c.NgayTao,
             kh.HoTen AS TenKhachHang, kh.Email,
             nv.HoTen AS TenNhanVien,
             lastMessage.NoiDung AS TinNhanCuoi, lastMessage.ThoiGian AS ThoiGianTinNhanCuoi
      FROM CuocHoiThoai c
      INNER JOIN NguoiDung kh ON kh.MaNguoiDung = c.MaKhachHang
      LEFT JOIN NguoiDung nv ON nv.MaNguoiDung = c.MaNhanVien
      OUTER APPLY (
        SELECT TOP 1 tn.NoiDung, tn.ThoiGian
        FROM TinNhan tn
        WHERE tn.MaCuocHoiThoai = c.MaCuocHoiThoai
        ORDER BY tn.ThoiGian DESC, tn.MaTinNhan DESC
      ) lastMessage
      ORDER BY COALESCE(lastMessage.ThoiGian, c.NgayTao) DESC
    `);
    return res.json({ conversations: result.recordset });
  } catch (error) {
    return next(error);
  }
}

export async function getConversationMessages(req, res, next) {
  try {
    const conversationId = Number(req.params.conversationId);
    if (!Number.isInteger(conversationId)) return res.status(400).json({ message: 'Mã cuộc hội thoại không hợp lệ.' });
    const pool = await getPool();
    const conversation = await getConversationForUser(pool, conversationId, Number(req.user.sub), req.user.role === 'admin');
    if (!conversation) return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại.' });
    return res.json({ conversation, messages: await getMessages(pool, conversationId) });
  } catch (error) {
    return next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const conversationId = Number(req.body?.conversationId);
    const text = String(req.body?.message || '').trim();
    if (!Number.isInteger(conversationId) || !text || text.length > 4000) {
      return res.status(400).json({ message: 'Cuộc hội thoại và nội dung tin nhắn là bắt buộc.' });
    }

    const userId = Number(req.user.sub);
    const isAdmin = req.user.role === 'admin';
    const pool = await getPool();
    const conversation = await getConversationForUser(pool, conversationId, userId, isAdmin);
    if (!conversation) return res.status(404).json({ message: 'Bạn không có quyền truy cập cuộc hội thoại này.' });

    if (isAdmin && !conversation.MaNhanVien) {
      await pool.request()
        .input('MaCuocHoiThoai', sql.Int, conversationId)
        .input('MaNhanVien', sql.Int, userId)
        .execute('sp_NhanCuocHoiThoai');
    }

    const result = await pool.request()
      .input('MaCuocHoiThoai', sql.Int, conversationId)
      .input('MaNguoiGui', sql.Int, userId)
      .input('NoiDung', sql.NVarChar(sql.MAX), text)
      .execute('sp_ThemTinNhan');
    return res.status(201).json({ message: 'Đã gửi tin nhắn.', messageId: result.recordset[0]?.MaTinNhan });
  } catch (error) {
    return next(error);
  }
}

export async function markConversationRead(req, res, next) {
  try {
    const conversationId = Number(req.params.conversationId);
    const userId = Number(req.user.sub);
    const pool = await getPool();
    const conversation = await getConversationForUser(pool, conversationId, userId, req.user.role === 'admin');
    if (!conversation) return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại.' });
    await pool.request()
      .input('MaCuocHoiThoai', sql.Int, conversationId)
      .input('MaNguoiXem', sql.Int, userId)
      .execute('sp_DanhDauTinNhanDaXem');
    return res.json({ message: 'Đã đánh dấu tin nhắn.' });
  } catch (error) {
    return next(error);
  }
}
