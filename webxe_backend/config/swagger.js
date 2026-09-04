const PORT = Number(process.env.PORT) || 3002;

const tablesConfig = [
  {
    name: 'Xe',
    tag: '1. Quản lý Xe (Sản phẩm)',
    description: 'API Quản lý sản phẩm Xe trong kho',
    pk: ['MaXe'],
    schema: {
      type: 'object',
      properties: {
        MaXe: { type: 'integer', example: 1 },
        MaHang: { type: 'integer', example: 1 },
        MaLoai: { type: 'integer', example: 1 },
        TenXe: { type: 'string', example: 'Toyota Vios 2024' },
        Gia: { type: 'number', example: 620000000 },
        HinhAnh: { type: 'string', example: 'https://i.pinimg.com/736x/60/79/e8/6079e8f4f6b1c7c9088619623be3f36a.jpg' },
        NamSanXuat: { type: 'integer', example: 2024 },
        MauSac: { type: 'string', example: 'Trắng' },
        MoTa: { type: 'string', example: 'Xe tay ga / sedan chất lượng cao' },
        SoLuong: { type: 'integer', example: 10 },
      },
    },
    createExample: {
      MaHang: 1,
      MaLoai: 1,
      TenXe: 'Toyota Vios 2024',
      Gia: 620000000,
      HinhAnh: 'https://i.pinimg.com/736x/60/79/e8/6079e8f4f6b1c7c9088619623be3f36a.jpg',
      NamSanXuat: 2024,
      MauSac: 'Trắng',
      MoTa: 'Xe sedan 5 chỗ',
      SoLuong: 10,
    },
    updateExample: {
      MaXe: 1,
      MaHang: 1,
      MaLoai: 1,
      TenXe: 'Toyota Vios 2024 (Đã cập nhật)',
      Gia: 610000000,
      HinhAnh: 'https://i.pinimg.com/736x/60/79/e8/6079e8f4f6b1c7c9088619623be3f36a.jpg',
      NamSanXuat: 2024,
      MauSac: 'Đen',
      MoTa: 'Xe sedan 5 chỗ bản nâng cấp',
      SoLuong: 8,
    },
    deleteExample: { MaXe: 1 },
  },
  {
    name: 'HangXe',
    tag: '2. Quản lý Hãng Xe',
    description: 'API Quản lý các hãng xe (Toyota, Honda,...)',
    pk: ['MaHang'],
    schema: {
      type: 'object',
      properties: {
        MaHang: { type: 'integer', example: 1 },
        TenHang: { type: 'string', example: 'Toyota' },
        Logo: { type: 'string', example: 'https://example.com/toyota.png' },
      },
    },
    createExample: { TenHang: 'Toyota', Logo: 'https://example.com/toyota.png' },
    updateExample: { MaHang: 1, TenHang: 'Toyota Việt Nam', Logo: 'https://example.com/toyota.png' },
    deleteExample: { MaHang: 1 },
  },
  {
    name: 'LoaiXe',
    tag: '3. Quản lý Loại Xe',
    description: 'API Quản lý phân loại xe (Sedan, SUV, Tay ga,...)',
    pk: ['MaLoai'],
    schema: {
      type: 'object',
      properties: {
        MaLoai: { type: 'integer', example: 1 },
        TenLoai: { type: 'string', example: 'Sedan' },
      },
    },
    createExample: { TenLoai: 'Sedan' },
    updateExample: { MaLoai: 1, TenLoai: 'Sedan Cao Cấp' },
    deleteExample: { MaLoai: 1 },
  },
  {
    name: 'NguoiDung',
    tag: '4. Quản lý Người Dùng',
    description: 'API Quản lý danh sách tài khoản người dùng',
    pk: ['MaNguoiDung'],
    schema: {
      type: 'object',
      properties: {
        MaNguoiDung: { type: 'integer', example: 1 },
        MaVaiTro: { type: 'integer', example: 2 },
        TenDangNhap: { type: 'string', example: 'khach01' },
        MatKhau: { type: 'string', example: '123456' },
        HoTen: { type: 'string', example: 'Nguyễn Văn A' },
        Email: { type: 'string', example: 'a@gmail.com' },
        SoDienThoai: { type: 'string', example: '0912345678' },
        HinhAnh: { type: 'string', example: 'https://example.com/avatar.jpg' },
      },
    },
    createExample: {
      MaVaiTro: 2,
      TenDangNhap: 'khach01',
      MatKhau: '123456',
      HoTen: 'Nguyễn Văn A',
      Email: 'a@gmail.com',
      SoDienThoai: '0912345678',
      HinhAnh: 'https://example.com/avatar.jpg',
    },
    updateExample: {
      MaNguoiDung: 1,
      MaVaiTro: 2,
      TenDangNhap: 'khach01',
      MatKhau: '123456',
      HoTen: 'Nguyễn Văn A (Cập nhật)',
      Email: 'a_updated@gmail.com',
      SoDienThoai: '0912345678',
      HinhAnh: 'https://example.com/avatar.jpg',
    },
    deleteExample: { MaNguoiDung: 1 },
  },
  {
    name: 'VaiTro',
    tag: '5. Quản lý Vai Trò',
    description: 'API Quản lý các vai trò người dùng (Admin, Khách hàng,...)',
    pk: ['MaVaiTro'],
    schema: {
      type: 'object',
      properties: {
        MaVaiTro: { type: 'integer', example: 1 },
        TenVaiTro: { type: 'string', example: 'Admin' },
      },
    },
    createExample: { TenVaiTro: 'Nhân viên bán hàng' },
    updateExample: { MaVaiTro: 1, TenVaiTro: 'Quản trị viên hệ thống' },
    deleteExample: { MaVaiTro: 1 },
  },
  {
    name: 'GioHang',
    tag: '6. Quản lý Giỏ Hàng',
    description: 'API Quản lý danh sách giỏ hàng',
    pk: ['MaGioHang'],
    schema: {
      type: 'object',
      properties: {
        MaGioHang: { type: 'integer', example: 1 },
        MaNguoiDung: { type: 'integer', example: 1 },
        NgayTao: { type: 'string', example: '2026-09-04T10:00:00.000Z' },
      },
    },
    createExample: { MaNguoiDung: 1, NgayTao: '2026-09-04T10:00:00.000Z' },
    updateExample: { MaGioHang: 1, MaNguoiDung: 1, NgayTao: '2026-09-04T10:00:00.000Z' },
    deleteExample: { MaGioHang: 1 },
  },
  {
    name: 'ChiTietGioHang',
    tag: '7. Quản lý Chi Tiết Giỏ Hàng',
    description: 'API Quản lý các món hàng trong từng giỏ hàng',
    pk: ['MaGioHang', 'MaXe'],
    schema: {
      type: 'object',
      properties: {
        MaGioHang: { type: 'integer', example: 1 },
        MaXe: { type: 'integer', example: 1 },
        SoLuong: { type: 'integer', example: 2 },
      },
    },
    createExample: { MaGioHang: 1, MaXe: 1, SoLuong: 2 },
    updateExample: { MaGioHang: 1, MaXe: 1, SoLuong: 3 },
    deleteExample: { MaGioHang: 1, MaXe: 1 },
  },
  {
    name: 'DonHang',
    tag: '8. Quản lý Đơn Hàng',
    description: 'API Quản lý đơn hàng mua xe',
    pk: ['MaDonHang'],
    schema: {
      type: 'object',
      properties: {
        MaDonHang: { type: 'integer', example: 1 },
        MaNguoiDung: { type: 'integer', example: 1 },
        HoTenNguoiNhan: { type: 'string', example: 'Nguyễn Văn A' },
        SoDienThoai: { type: 'string', example: '0912345678' },
        DiaChi: { type: 'string', example: '123 Đường ABC, Quận 1, TP.HCM' },
        TongTien: { type: 'number', example: 620000000 },
        PhuongThucThanhToan: { type: 'string', example: 'Chuyển khoản' },
        TrangThai: { type: 'string', example: 'Chờ xác nhận' },
        NgayDat: { type: 'string', example: '2026-09-04T10:00:00.000Z' },
      },
    },
    createExample: {
      MaNguoiDung: 1,
      HoTenNguoiNhan: 'Nguyễn Văn A',
      SoDienThoai: '0912345678',
      DiaChi: '123 Đường ABC, Quận 1, TP.HCM',
      TongTien: 620000000,
      PhuongThucThanhToan: 'Chuyển khoản',
      TrangThai: 'Chờ xác nhận',
      NgayDat: '2026-09-04T10:00:00.000Z',
    },
    updateExample: {
      MaDonHang: 1,
      MaNguoiDung: 1,
      HoTenNguoiNhan: 'Nguyễn Văn A',
      SoDienThoai: '0912345678',
      DiaChi: '123 Đường ABC, Quận 1, TP.HCM',
      TongTien: 620000000,
      PhuongThucThanhToan: 'Chuyển khoản',
      TrangThai: 'Đã xác nhận',
      NgayDat: '2026-09-04T10:00:00.000Z',
    },
    deleteExample: { MaDonHang: 1 },
  },
  {
    name: 'ChiTietDonHang',
    tag: '9. Quản lý Chi Tiết Đơn Hàng',
    description: 'API Quản lý sản phẩm chi tiết của đơn hàng',
    pk: ['MaDonHang', 'MaXe'],
    schema: {
      type: 'object',
      properties: {
        MaDonHang: { type: 'integer', example: 1 },
        MaXe: { type: 'integer', example: 1 },
        SoLuong: { type: 'integer', example: 1 },
        DonGia: { type: 'number', example: 620000000 },
      },
    },
    createExample: { MaDonHang: 1, MaXe: 1, SoLuong: 1, DonGia: 620000000 },
    updateExample: { MaDonHang: 1, MaXe: 1, SoLuong: 2, DonGia: 620000000 },
    deleteExample: { MaDonHang: 1, MaXe: 1 },
  },
];

function generatePaths() {
  const paths = {};

  paths['/api/auth/login'] = {
    post: {
      tags: ['0. Hệ Thống & Xác Thực'],
      summary: 'Đăng nhập hệ thống (Auth Login)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string', example: 'sa' },
                password: { type: 'string', example: '123456' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Đăng nhập thành công, trả về JWT Token' },
        401: { description: 'Sai tài khoản hoặc mật khẩu' },
      },
    },
  };

  tablesConfig.forEach((table) => {
    const routePath = `/api/data/${table.name}`;

    paths[routePath] = {
      get: {
        tags: [table.tag],
        summary: `[GET] Lấy danh sách ${table.name}`,
        description: `Truy vấn toàn bộ dữ liệu từ bảng ${table.name}`,
        responses: {
          200: {
            description: `Lấy dữ liệu ${table.name} thành công`,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', example: table.name },
                    count: { type: 'integer', example: 1 },
                    data: {
                      type: 'array',
                      items: table.schema,
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: [table.tag],
        summary: `[POST] Thêm mới bản ghi vào ${table.name}`,
        description: `Tạo một bản ghi mới trong bảng ${table.name}`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: table.schema,
              example: table.createExample,
            },
          },
        },
        responses: {
          200: { description: `Thêm mới ${table.name} thành công` },
          400: { description: 'Dữ liệu không hợp lệ' },
          500: { description: 'Lỗi server / kết nối CSDL' },
        },
      },
      put: {
        tags: [table.tag],
        summary: `[PUT] Cập nhật bản ghi ${table.name}`,
        description: `Cập nhật thông tin bản ghi theo khóa chính: ${table.pk.join(', ')}`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: table.schema,
              example: table.updateExample,
            },
          },
        },
        responses: {
          200: { description: `Cập nhật ${table.name} thành công` },
          400: { description: 'Thiếu khóa chính hoặc dữ liệu không hợp lệ' },
          500: { description: 'Lỗi server / kết nối CSDL' },
        },
      },
      delete: {
        tags: [table.tag],
        summary: `[DELETE] Xóa bản ghi khỏi ${table.name}`,
        description: `Xóa bản ghi dựa theo khóa chính: ${table.pk.join(', ')}`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: Object.fromEntries(
                  table.pk.map((pkKey) => [pkKey, { type: 'integer', example: 1 }])
                ),
              },
              example: table.deleteExample,
            },
          },
        },
        responses: {
          200: { description: `Xóa bản ghi ${table.name} thành công` },
          400: { description: 'Thiếu khóa chính hoặc tham chiếu dữ liệu ràng buộc' },
          500: { description: 'Lỗi server / kết nối CSDL' },
        },
      },
    };
  });

  return paths;
}

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'WebXe API Documentation',
    version: '1.0.0',
    description: 'Hệ thống REST API quản lý WebXe - Đầy đủ 4 thao tác GET, POST, PUT, DELETE cho tất cả 9 bảng dữ liệu.',
    contact: {
      name: 'WebXe Developer Team',
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'WebXe API Server',
    },
  ],
  tags: [
    { name: '0. Hệ Thống & Xác Thực', description: 'API Đăng nhập và xác thực Token' },
    ...tablesConfig.map((t) => ({ name: t.tag, description: t.description })),
  ],
  paths: generatePaths(),
};

const customCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  body, .swagger-ui {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
    background-color: #f8fafc !important;
  }
  
  .swagger-ui .topbar {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
    padding: 16px 0 !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
    border-bottom: 3px solid #3b82f6 !important;
  }
  
  .swagger-ui .topbar .topbar-wrapper {
    max-width: 1200px !important;
    padding: 0 24px !important;
  }
  
  .swagger-ui .topbar .topbar-wrapper img {
    display: none !important;
  }
  
  .swagger-ui .topbar .topbar-wrapper a::before {
    content: '🚗 WebXe API Portal';
    font-size: 22px !important;
    font-weight: 800 !important;
    color: #38bdf8 !important;
    letter-spacing: -0.5px !important;
  }

  .swagger-ui .topbar .topbar-wrapper a span {
    display: none !important;
  }

  .swagger-ui .wrapper {
    max-width: 1200px !important;
    padding: 0 24px !important;
  }
  
  .swagger-ui .info {
    margin: 32px 0 24px !important;
    background: #ffffff !important;
    padding: 28px !important;
    border-radius: 16px !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.03) !important;
  }
  
  .swagger-ui .info .title {
    font-size: 32px !important;
    font-weight: 800 !important;
    color: #0f172a !important;
    letter-spacing: -0.5px !important;
  }
  
  .swagger-ui .info p {
    font-size: 15px !important;
    color: #475569 !important;
    line-height: 1.6 !important;
  }
  
  .swagger-ui .scheme-container {
    background: #ffffff !important;
    border-radius: 16px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important;
    border: 1px solid #e2e8f0 !important;
    padding: 18px 24px !important;
    margin-bottom: 32px !important;
  }
  
  .swagger-ui .opblock-tag {
    font-size: 20px !important;
    font-weight: 800 !important;
    color: #0f172a !important;
    border-bottom: 2px solid #cbd5e1 !important;
    padding-bottom: 10px !important;
    margin: 36px 0 16px !important;
  }

  .swagger-ui .opblock-tag small {
    color: #64748b !important;
    font-weight: 500 !important;
  }
  
  .swagger-ui .opblock {
    border-radius: 14px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03) !important;
    border: 1px solid #e2e8f0 !important;
    margin-bottom: 16px !important;
    overflow: hidden !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease !important;
  }
  
  .swagger-ui .opblock:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.06) !important;
  }
  
  .swagger-ui .opblock .opblock-summary {
    padding: 14px 20px !important;
  }
  
  .swagger-ui .opblock.opblock-get {
    background: rgba(240, 253, 244, 0.7) !important;
    border-color: #86efac !important;
  }
  .swagger-ui .opblock.opblock-get .opblock-summary-method {
    background: #16a34a !important;
    border-radius: 8px !important;
    font-weight: 800 !important;
  }
  
  .swagger-ui .opblock.opblock-post {
    background: rgba(239, 246, 255, 0.7) !important;
    border-color: #93c5fd !important;
  }
  .swagger-ui .opblock.opblock-post .opblock-summary-method {
    background: #2563eb !important;
    border-radius: 8px !important;
    font-weight: 800 !important;
  }
  
  .swagger-ui .opblock.opblock-put {
    background: rgba(254, 249, 195, 0.7) !important;
    border-color: #fde047 !important;
  }
  .swagger-ui .opblock.opblock-put .opblock-summary-method {
    background: #d97706 !important;
    border-radius: 8px !important;
    font-weight: 800 !important;
  }
  
  .swagger-ui .opblock.opblock-delete {
    background: rgba(254, 242, 242, 0.7) !important;
    border-color: #fca5a5 !important;
  }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method {
    background: #dc2626 !important;
    border-radius: 8px !important;
    font-weight: 800 !important;
  }
  
  .swagger-ui .btn.execute {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
    border: none !important;
    color: #ffffff !important;
    border-radius: 10px !important;
    font-weight: 700 !important;
    padding: 10px 28px !important;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
  }
  
  .swagger-ui .btn.execute:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4) !important;
  }
`;

const swaggerUiOptions = {
  customCss,
  customSiteTitle: 'WebXe API Docs - Swagger',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    displayRequestDuration: true,
    defaultModelsExpandDepth: 1,
  },
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
};
