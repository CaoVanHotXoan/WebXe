# webxe_backend

Backend Node.js / Express cho `webxe_fontend`, kết nối SQL Server database `QuanLyXe`, xác thực JWT bằng HttpOnly Cookie và Swagger UI.

## Cài đặt

```powershell
cd webxe_backend
npm install express mssql dotenv cors cookie-parser jsonwebtoken bcryptjs swagger-ui-express swagger-jsdoc
Copy-Item .env.example .env
```

Điền thông tin SQL Server và `JWT_SECRET` (ít nhất 32 ký tự) trong `.env`. Mật khẩu trong bảng `NguoiDung.MatKhau` phải là bcrypt hash. Có thể tạo hash bằng:

```powershell
npm run hash-password
```

Chạy:

```powershell
npm run dev
```

Swagger UI: `http://localhost:5000/api-docs`

## Endpoint chính

- `POST /api/auth/login`: nhận `tenDangNhap` hoặc `email` và `password`, đặt cookie `token`.
- `POST /api/auth/logout`: xóa cookie `token`.
- `GET /api/user/profile`: yêu cầu cookie hợp lệ.
- `POST /api/admin/procedures/:procedureName`: yêu cầu admin và gọi một trong 36 procedure được whitelist từ `ThuTuc.sql`.

Frontend phải gọi fetch với `credentials: 'include'`. Với Next.js proxy hiện tại, đặt `BACKEND_PROXY_URL=http://localhost:5000` nếu muốn proxy `/api/backend` trỏ tới backend này. Backend vẫn chạy độc lập tại cổng 5000 và CORS dùng `origin: process.env.CLIENT_URL`, `credentials: true`.

Lệnh endpoint procedure ví dụ:

```json
POST /api/admin/procedures/sp_ThemHangXe
{ "TenHang": "Toyota", "Logo": null }
```

Không commit `.env` hoặc thông tin SQL Server vào Git.
