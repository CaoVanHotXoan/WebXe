const { sql, connectDB } = require('../config/db');

async function createOrder(req, res) {
  const userId = Number(req.user?.UserId);
  const vehicleId = Number(req.body?.vehicleId);
  const quantity = Number(req.body?.quantity || 1);
  const recipientName = String(req.body?.recipientName || '').trim();
  const phone = String(req.body?.phone || '').trim();
  const address = String(req.body?.address || '').trim();
  const paymentMethod = String(req.body?.paymentMethod || 'Thanh toán khi nhận xe').trim();

  if (!Number.isInteger(userId) || !Number.isInteger(vehicleId) || quantity !== 1 || !recipientName || !phone || !address) {
    return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin đặt xe hợp lệ.' });
  }

  if (!/^0\d{9,10}$/.test(phone)) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ.' });
  }

  let transaction;
  try {
    const pool = await connectDB();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const vehicleResult = await new sql.Request(transaction)
      .input('MaXe', sql.Int, vehicleId)
      .query('SELECT TOP 1 MaXe, TenXe, Gia, SoLuong FROM Xe WHERE MaXe = @MaXe');
    const vehicle = vehicleResult.recordset[0];

    if (!vehicle) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Không tìm thấy mẫu xe này.' });
    }
    if (Number(vehicle.SoLuong) < quantity) {
      await transaction.rollback();
      return res.status(409).json({ message: 'Mẫu xe này hiện đã hết hàng.' });
    }

    const orderResult = await new sql.Request(transaction)
      .input('MaNguoiDung', sql.Int, userId)
      .input('HoTenNguoiNhan', sql.NVarChar(100), recipientName)
      .input('SoDienThoai', sql.VarChar(20), phone)
      .input('DiaChi', sql.NVarChar(300), address)
      .input('TongTien', sql.Decimal(18, 2), vehicle.Gia)
      .input('PhuongThucThanhToan', sql.NVarChar(50), paymentMethod)
      .input('TrangThai', sql.NVarChar(50), 'Chờ xác nhận')
      .query(`INSERT INTO DonHang (MaNguoiDung, HoTenNguoiNhan, SoDienThoai, DiaChi, TongTien, PhuongThucThanhToan, TrangThai, NgayDat)
        OUTPUT INSERTED.MaDonHang
        VALUES (@MaNguoiDung, @HoTenNguoiNhan, @SoDienThoai, @DiaChi, @TongTien, @PhuongThucThanhToan, @TrangThai, GETDATE())`);
    const orderId = orderResult.recordset[0].MaDonHang;

    await new sql.Request(transaction)
      .input('MaDonHang', sql.Int, orderId)
      .input('MaXe', sql.Int, vehicle.MaXe)
      .input('SoLuong', sql.Int, quantity)
      .input('DonGia', sql.Decimal(18, 2), vehicle.Gia)
      .query('INSERT INTO ChiTietDonHang (MaDonHang, MaXe, SoLuong, DonGia) VALUES (@MaDonHang, @MaXe, @SoLuong, @DonGia)');

    await transaction.commit();
    return res.status(201).json({ message: `Đặt xe ${vehicle.TenXe} thành công.`, orderId });
  } catch (error) {
    if (transaction) {
      try { await transaction.rollback(); } catch { /* transaction may already be closed */ }
    }
    console.error('Lỗi tạo đơn đặt xe:', error);
    return res.status(500).json({ message: 'Không thể tạo đơn đặt xe lúc này.' });
  }
}

module.exports = { createOrder };
