/*

Bảng:
1. VaiTro
2. NguoiDung
3. HangXe
4. LoaiXe
5. Xe
6. GioHang
7. ChiTietGioHang
8. DonHang
9. ChiTietDonHang



/* =========================================================
   1. VAI TRÒ
   ========================================================= */

CREATE TABLE VaiTro
(
    MaVaiTro INT IDENTITY(1,1) PRIMARY KEY,

    TenVaiTro NVARCHAR(50) NOT NULL UNIQUE
);
GO


/* =========================================================
   2. NGƯỜI DÙNG
   Tài khoản đăng nhập
   ========================================================= */

CREATE TABLE NguoiDung
(
    MaNguoiDung INT IDENTITY(1,1) PRIMARY KEY,

    MaVaiTro INT NOT NULL,

    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,

    MatKhau VARCHAR(255) NOT NULL,

    HoTen NVARCHAR(100) NOT NULL,

    Email VARCHAR(100),

    SoDienThoai VARCHAR(20),

    HinhAnh NVARCHAR(500),

    FOREIGN KEY (MaVaiTro)
        REFERENCES VaiTro(MaVaiTro)
);
GO


/* =========================================================
   3. HÃNG XE
   ========================================================= */

CREATE TABLE HangXe
(
    MaHang INT IDENTITY(1,1) PRIMARY KEY,

    TenHang NVARCHAR(100) NOT NULL UNIQUE,

    Logo NVARCHAR(500)
);
GO


/* =========================================================
   4. LOẠI XE
   ========================================================= */

CREATE TABLE LoaiXe
(
    MaLoai INT IDENTITY(1,1) PRIMARY KEY,

    TenLoai NVARCHAR(100) NOT NULL UNIQUE
);
GO


/* =========================================================
   5. XE
   ========================================================= */

CREATE TABLE Xe
(
    MaXe INT IDENTITY(1,1) PRIMARY KEY,

    MaHang INT NOT NULL,

    MaLoai INT NOT NULL,

    TenXe NVARCHAR(150) NOT NULL,

    Gia DECIMAL(18,2) NOT NULL,

    HinhAnh NVARCHAR(500),

    NamSanXuat INT,

    MauSac NVARCHAR(100),

    MoTa NVARCHAR(MAX),

    SoLuong INT NOT NULL DEFAULT 0,

    FOREIGN KEY (MaHang)
        REFERENCES HangXe(MaHang),

    FOREIGN KEY (MaLoai)
        REFERENCES LoaiXe(MaLoai),

    CHECK (Gia >= 0),

    CHECK (SoLuong >= 0)
);
GO


/* =========================================================
   6. GIỎ HÀNG
   ========================================================= */

CREATE TABLE GioHang
(
    MaGioHang INT IDENTITY(1,1) PRIMARY KEY,

    MaNguoiDung INT NOT NULL,

    NgayTao DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
);
GO


/* =========================================================
   7. CHI TIẾT GIỎ HÀNG
   ========================================================= */

CREATE TABLE ChiTietGioHang
(
    MaGioHang INT NOT NULL,

    MaXe INT NOT NULL,

    SoLuong INT NOT NULL DEFAULT 1,

    PRIMARY KEY (MaGioHang, MaXe),

    FOREIGN KEY (MaGioHang)
        REFERENCES GioHang(MaGioHang),

    FOREIGN KEY (MaXe)
        REFERENCES Xe(MaXe),

    CHECK (SoLuong > 0)
);
GO


/* =========================================================
   8. ĐƠN HÀNG
   ========================================================= */

CREATE TABLE DonHang
(
    MaDonHang INT IDENTITY(1,1) PRIMARY KEY,

    MaNguoiDung INT NOT NULL,

    HoTenNguoiNhan NVARCHAR(100) NOT NULL,

    SoDienThoai VARCHAR(20) NOT NULL,

    DiaChi NVARCHAR(300) NOT NULL,

    TongTien DECIMAL(18,2) NOT NULL,

    PhuongThucThanhToan NVARCHAR(50),

    TrangThai NVARCHAR(50) NOT NULL
        DEFAULT N'Chờ xác nhận',

    NgayDat DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung),

    CHECK (TongTien >= 0)
);
GO


/* =========================================================
   9. CHI TIẾT ĐƠN HÀNG
   ========================================================= */

CREATE TABLE ChiTietDonHang
(
    MaDonHang INT NOT NULL,

    MaXe INT NOT NULL,

    SoLuong INT NOT NULL,

    DonGia DECIMAL(18,2) NOT NULL,

    ThanhTien AS (SoLuong * DonGia),

    PRIMARY KEY (MaDonHang, MaXe),

    FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang),

    FOREIGN KEY (MaXe)
        REFERENCES Xe(MaXe),

    CHECK (SoLuong > 0),

    CHECK (DonGia >= 0)
);
GO