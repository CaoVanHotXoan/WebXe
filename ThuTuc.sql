/* Stored procedures CRUD cho CSDL QuanLyXe */

CREATE PROCEDURE sp_ThemVaiTro
    @TenVaiTro NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO VaiTro (TenVaiTro) VALUES (@TenVaiTro);
END;
GO

CREATE PROCEDURE sp_SuaVaiTro
    @MaVaiTro INT,
    @TenVaiTro NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE VaiTro SET TenVaiTro = @TenVaiTro WHERE MaVaiTro = @MaVaiTro;
END;
GO

CREATE PROCEDURE sp_XoaVaiTro @MaVaiTro INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM VaiTro WHERE MaVaiTro = @MaVaiTro;
END;
GO

CREATE PROCEDURE sp_ThemNguoiDung
    @MaVaiTro INT, @TenDangNhap VARCHAR(50), @MatKhau VARCHAR(255),
    @HoTen NVARCHAR(100), @Email VARCHAR(100) = NULL,
    @SoDienThoai VARCHAR(20) = NULL, @HinhAnh NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO NguoiDung (MaVaiTro, TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, HinhAnh)
    VALUES (@MaVaiTro, @TenDangNhap, @MatKhau, @HoTen, @Email, @SoDienThoai, @HinhAnh);
END;
GO

CREATE PROCEDURE sp_SuaNguoiDung
    @MaNguoiDung INT, @MaVaiTro INT, @TenDangNhap VARCHAR(50), @MatKhau VARCHAR(255),
    @HoTen NVARCHAR(100), @Email VARCHAR(100) = NULL,
    @SoDienThoai VARCHAR(20) = NULL, @HinhAnh NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE NguoiDung
    SET MaVaiTro = @MaVaiTro, TenDangNhap = @TenDangNhap, MatKhau = @MatKhau,
        HoTen = @HoTen, Email = @Email, SoDienThoai = @SoDienThoai, HinhAnh = @HinhAnh
    WHERE MaNguoiDung = @MaNguoiDung;
END;
GO

CREATE PROCEDURE sp_XoaNguoiDung @MaNguoiDung INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM NguoiDung WHERE MaNguoiDung = @MaNguoiDung;
END;
GO

CREATE PROCEDURE sp_ThemHangXe @TenHang NVARCHAR(100), @Logo NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO HangXe (TenHang, Logo) VALUES (@TenHang, @Logo);
END;
GO

CREATE PROCEDURE sp_SuaHangXe @MaHang INT, @TenHang NVARCHAR(100), @Logo NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE HangXe SET TenHang = @TenHang, Logo = @Logo WHERE MaHang = @MaHang;
END;
GO

CREATE PROCEDURE sp_XoaHangXe @MaHang INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM HangXe WHERE MaHang = @MaHang;
END;
GO

CREATE PROCEDURE sp_ThemLoaiXe @TenLoai NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO LoaiXe (TenLoai) VALUES (@TenLoai);
END;
GO

CREATE PROCEDURE sp_SuaLoaiXe @MaLoai INT, @TenLoai NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE LoaiXe SET TenLoai = @TenLoai WHERE MaLoai = @MaLoai;
END;
GO

CREATE PROCEDURE sp_XoaLoaiXe @MaLoai INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM LoaiXe WHERE MaLoai = @MaLoai;
END;
GO

CREATE PROCEDURE sp_ThemXe
    @MaHang INT, @MaLoai INT, @TenXe NVARCHAR(150), @Gia DECIMAL(18,2),
    @HinhAnh NVARCHAR(500) = NULL, @NamSanXuat INT = NULL,
    @MauSac NVARCHAR(100) = NULL, @MoTa NVARCHAR(MAX) = NULL, @SoLuong INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Xe (MaHang, MaLoai, TenXe, Gia, HinhAnh, NamSanXuat, MauSac, MoTa, SoLuong)
    VALUES (@MaHang, @MaLoai, @TenXe, @Gia, @HinhAnh, @NamSanXuat, @MauSac, @MoTa, @SoLuong);
END;
GO

CREATE PROCEDURE sp_SuaXe
    @MaXe INT, @MaHang INT, @MaLoai INT, @TenXe NVARCHAR(150), @Gia DECIMAL(18,2),
    @HinhAnh NVARCHAR(500) = NULL, @NamSanXuat INT = NULL,
    @MauSac NVARCHAR(100) = NULL, @MoTa NVARCHAR(MAX) = NULL, @SoLuong INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Xe SET MaHang = @MaHang, MaLoai = @MaLoai, TenXe = @TenXe, Gia = @Gia,
        HinhAnh = @HinhAnh, NamSanXuat = @NamSanXuat, MauSac = @MauSac,
        MoTa = @MoTa, SoLuong = @SoLuong WHERE MaXe = @MaXe;
END;
GO

CREATE PROCEDURE sp_XoaXe @MaXe INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Xe WHERE MaXe = @MaXe;
END;
GO

CREATE PROCEDURE sp_ThemGioHang @MaNguoiDung INT, @NgayTao DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO GioHang (MaNguoiDung, NgayTao) VALUES (@MaNguoiDung, ISNULL(@NgayTao, GETDATE()));
END;
GO

CREATE PROCEDURE sp_SuaGioHang @MaGioHang INT, @MaNguoiDung INT, @NgayTao DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE GioHang SET MaNguoiDung = @MaNguoiDung, NgayTao = @NgayTao WHERE MaGioHang = @MaGioHang;
END;
GO

CREATE PROCEDURE sp_XoaGioHang @MaGioHang INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM GioHang WHERE MaGioHang = @MaGioHang;
END;
GO

CREATE PROCEDURE sp_ThemChiTietGioHang @MaGioHang INT, @MaXe INT, @SoLuong INT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ChiTietGioHang (MaGioHang, MaXe, SoLuong) VALUES (@MaGioHang, @MaXe, @SoLuong);
END;
GO

CREATE PROCEDURE sp_SuaChiTietGioHang @MaGioHang INT, @MaXe INT, @SoLuong INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ChiTietGioHang SET SoLuong = @SoLuong WHERE MaGioHang = @MaGioHang AND MaXe = @MaXe;
END;
GO

CREATE PROCEDURE sp_XoaChiTietGioHang @MaGioHang INT, @MaXe INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM ChiTietGioHang WHERE MaGioHang = @MaGioHang AND MaXe = @MaXe;
END;
GO

CREATE PROCEDURE sp_ThemDonHang
    @MaNguoiDung INT, @HoTenNguoiNhan NVARCHAR(100), @SoDienThoai VARCHAR(20),
    @DiaChi NVARCHAR(300), @TongTien DECIMAL(18,2),
    @PhuongThucThanhToan NVARCHAR(50) = NULL, @TrangThai NVARCHAR(50), @NgayDat DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO DonHang (MaNguoiDung, HoTenNguoiNhan, SoDienThoai, DiaChi, TongTien, PhuongThucThanhToan, TrangThai, NgayDat)
    VALUES (@MaNguoiDung, @HoTenNguoiNhan, @SoDienThoai, @DiaChi, @TongTien, @PhuongThucThanhToan, @TrangThai, ISNULL(@NgayDat, GETDATE()));
END;
GO

CREATE PROCEDURE sp_SuaDonHang
    @MaDonHang INT, @MaNguoiDung INT, @HoTenNguoiNhan NVARCHAR(100), @SoDienThoai VARCHAR(20),
    @DiaChi NVARCHAR(300), @TongTien DECIMAL(18,2),
    @PhuongThucThanhToan NVARCHAR(50) = NULL, @TrangThai NVARCHAR(50), @NgayDat DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE DonHang SET MaNguoiDung = @MaNguoiDung, HoTenNguoiNhan = @HoTenNguoiNhan,
        SoDienThoai = @SoDienThoai, DiaChi = @DiaChi, TongTien = @TongTien,
        PhuongThucThanhToan = @PhuongThucThanhToan, TrangThai = @TrangThai, NgayDat = @NgayDat
    WHERE MaDonHang = @MaDonHang;
END;
GO

CREATE PROCEDURE sp_XoaDonHang @MaDonHang INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM DonHang WHERE MaDonHang = @MaDonHang;
END;
GO

CREATE PROCEDURE sp_ThemChiTietDonHang
    @MaDonHang INT, @MaXe INT, @SoLuong INT, @DonGia DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ChiTietDonHang (MaDonHang, MaXe, SoLuong, DonGia) VALUES (@MaDonHang, @MaXe, @SoLuong, @DonGia);
END;
GO

CREATE PROCEDURE sp_SuaChiTietDonHang
    @MaDonHang INT, @MaXe INT, @SoLuong INT, @DonGia DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ChiTietDonHang SET SoLuong = @SoLuong, DonGia = @DonGia
    WHERE MaDonHang = @MaDonHang AND MaXe = @MaXe;
END;
GO

CREATE PROCEDURE sp_XoaChiTietDonHang @MaDonHang INT, @MaXe INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM ChiTietDonHang WHERE MaDonHang = @MaDonHang AND MaXe = @MaXe;
END;
GO