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

## Deploy trên Vercel

Trong Vercel, tạo project với **Root Directory** là `webxe_backend`. Vercel sẽ dùng `api/index.js` làm serverless entrypoint. Khai báo toàn bộ biến môi trường cần thiết trong Vercel Project Settings, đặc biệt `DB_SERVER`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGIN`, `MAIL_USER`, `MAIL_PASSWORD` và các biến Cloudinary nếu đang sử dụng.

Sau khi deploy, kiểm tra `https://<domain-vercel>/api/health`. Cập nhật `CORS_ORIGIN` bằng domain frontend thật, không thêm dấu `/` cuối URL. Không đưa file `.env` lên Git hoặc Vercel.

## Endpoint chính

- `POST /api/auth/login`: nhận `tenDangNhap` hoặc `email` và `password`, đặt cookie `token`.
- `POST /api/auth/logout`: xóa cookie `token`.
- `GET /api/user/profile`: yêu cầu cookie hợp lệ.
- `POST /api/admin/procedures/:procedureName`: yêu cầu admin và gọi một trong 36 procedure được whitelist từ `ThuTuc.sql`.

Frontend phải gọi fetch với `credentials: 'include'`. Với Next.js proxy hiện tại, đặt `BACKEND_PROXY_URL=http://localhost:5000` nếu muốn proxy `/api/backend` trỏ tới backend này. Backend vẫn chạy độc lập tại cổng 5000 và CORS dùng `origin: process.env.CLIENT_URL`, `credentials: true`.

Gửi OTP qua Gmail SMTP cổng 465 với TLS ngầm. Khai báo `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=465`, `MAIL_USER`, `MAIL_PASSWORD` là Google App Password 16 ký tự và `MAIL_FROM`. Ngoài ra cần `JWT_SECRET`, thông tin SQL Server và `CORS_ORIGIN` bằng URL frontend Render.

Lệnh endpoint procedure ví dụ:

```json
POST /api/admin/procedures/sp_ThemHangXe
{ "TenHang": "Toyota", "Logo": null }
```

Không commit `.env` hoặc thông tin SQL Server vào Git.
