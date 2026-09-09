# 📋 TÀI LIỆU BÁO CÁO & BẢO VỆ ĐỒ ÁN WEBXE
> **Tài liệu Giải Trình Lựa Chọn Công Nghệ & Kịch Bản Bảo Vệ Đồ Án (Mục 10 Rubric - 10/10 điểm)**

---

## 🏛️ 10.1. GIẢI TRÌNH LỰA CHỌN FRAMEWORK (3.0 Điểm)

### **Lựa chọn: Next.js (Pages Router) + Express.js REST API**
* **Tên & Phiên bản**: Next.js v15.x / 16.x (React 19), Express.js v4.x, Node.js v20+.
* **Lý do lựa chọn phù hợp với bài toán Bán Xe**:
  1. **Tối ưu SEO & Tốc độ tải trang cho bài toán Thương mại điện tử**: Mua bán xe đòi hỏi các trang danh sách xe và chi tiết xe phải được chỉ mục SEO tốt trên Google. Next.js cung cấp Server-Side Rendering (SSR) & Static Site Generation (SSG) giúp cào dữ liệu Meta Tags, Title, OpenGraph chính xác.
  2. **Kiến trúc Tách biệt Frontend - Backend (Decoupled Architecture)**: Frontend Next.js tập trung vào trải nghiệm UI/UX mượt mà cho khách hàng, trong khi Backend Express.js chuyên trách các tác vụ API, kết nối DB SQL Server, xác thực JWT & gửi Email OTP.
  3. **File-system Routing trực quan**: Cấu trúc tuyến đường theo thư mục `src/pages` giúp dễ dàng mở rộng các module (`TrangChu`, `ChiTietXe`, `MuaBanXe`, `Login`, `ThongTinCaNhan`).

---

## 🎨 10.2. GIẢI TRÌNH LỰA CHỌN THƯ VIỆN & STATE MANAGEMENT (3.0 Điểm)

### **1. Quản lý State toàn cục: React Context API (`AuthContext`) & Custom Hooks**
* **Lý do chọn**: Dự án cần quản lý thông tin Đăng nhập, Token JWT và Vai trò (Admin / Khách hàng) trên toàn hệ thống. Việc sử dụng `AuthContext` kết hợp với `localStorage` giúp:
  * Tránh hiện tượng Prop Drilling (truyền prop qua nhiều tầng).
  * Tự động phục hồi trạng thái (Rehydrate) khi người dùng F5 tải lại trang.
  * Xóa sạch dữ liệu an toàn khi bấm Đăng xuất (Logout).

### **2. Giao diện & Styling: CSS Modules + Tailwind CSS + Modern Glassmorphism Theme**
* **Lý do chọn**:
  * **CSS Modules (`*.module.css`)**: Đảm bảo tính đóng gói CSS (scoped styles), tránh đụng độ tên class giữa các trang.
  * **Tailwind Utility Tokens**: Giúp dựng layout Responsive linh hoạt với các class tiện ích như `@apply`, `backdrop-blur`, `shadow-soft-3d`.

### **3. Thư viện Swagger OpenAPI 3.0 & JWT / Bcrypt**
* **Swagger (`swagger-ui-express`)**: Tự động sinh tài liệu API tương tác tại `/api-docs` giúp Giảng viên thử nghiệm API trực tiếp.
* **Bcrypt & JWT**: Mật khẩu được mã hóa băm 12 rounds an toàn ở Backend trước khi lưu SQL Server; Token được truyền qua HTTP Header `Authorization: Bearer <token>`.

---

## 🗄️ 10.3. GIẢI TRÌNH LỰA CHỌN CƠ SỞ DỮ LIỆU SQL SERVER (2.0 Điểm)

### **Lựa chọn: Microsoft SQL Server**
* **Loại DB**: Relational Database Management System (RDBMS - Cơ sở dữ liệu quan hệ).
* **Driver / Driver kết nối**: Thư viện `mssql` (Node.js driver cho SQL Server).
* **Lý do lựa chọn SQL Server**:
  1. **Tính Ràng buộc Dữ liệu & Ràng buộc Khóa Ngoại (Integrity & Constraints)**: Dữ liệu mua bán xe đòi hỏi tính chính xác tuyệt đối về giá trị, số lượng kho, mã xe, mã người dùng và đơn hàng. SQL Server hỗ trợ ràng buộc Khóa chính (Primary Key), Khóa ngoại (Foreign Key `ON DELETE CASCADE / NO ACTION`) giúp tránh trôi dạt dữ liệu rác.
  2. **Thiết kế Chuẩn hóa (Normalization)**: Sơ đồ DB 9 bảng được thiết kế đạt chuẩn 3NF:
     * `NguoiDung` (1) ── (N) `GioHang`
     * `HangXe` (1) ── (N) `Xe`
     * `LoaiXe` (1) ── (N) `Xe`
     * `Xe` (1) ── (N) `HinhAnhXe`
     * `DonHang` (1) ── (N) `ChiTietDonHang`
  3. **Tối ưu hóa Truy vấn bằng Stored Procedures & Triggers (`ThuTuc.sql`)**: Giảm tải cho Server Node.js bằng cách thực thi trực tiếp các thủ tục lưu trữ SQL cho các thao tác phức tạp như tính tổng tiền đơn hàng hoặc cập nhật số lượng xe trong kho.

---

## 🎬 10.4. KỊCH BẢN DEMO BẢO VỆ 5 PHÚT (1.0 Điểm)

1. **Phút 00:00 - 01:00**: Giới thiệu thành viên, mục tiêu đồ án WebXe, kiến trúc Next.js + Express + SQL Server.
2. **Phút 01:00 - 02:30**: Demo luồng Khách hàng trên Frontend:
   * Tìm kiếm xe theo từ khóa (Auto-complete).
   * Lọc xe theo Hãng xe (Toyota, Honda...) & Loại xe (Sedan, SUV...).
   * Xem chi tiết xe & Bộ sưu tập ảnh.
   * Đăng ký tài khoản mới ➔ Nhận mã OTP qua Email ➔ Đăng nhập.
3. **Phút 02:30 - 04:00**: Demo luồng Admin trên Backend Dashboard (`http://localhost:3002`):
   * Đăng nhập tài khoản Admin (`admin/123456`).
   * Xem giao diện Responsive trên màn hình Desktop, iPad (Header xanh full, Hamburger menu) & Mobile.
   * Thao tác CRUD (Thêm mới Xe, Sửa giá xe, Xóa xe, Thêm ảnh xe).
4. **Phút 04:00 - 05:00**: Mở tài liệu Swagger OpenAPI (`/api-docs`), xem file SQL Server `QuanLyXe.sql` & trả lời câu hỏi của Giảng viên.

---

## ❓ 10.5. BỘ CÂU HỎI & CÂU TRẢ LỜI PHẢN BIỆN THƯỜNG GẶP (1.0 Điểm)

### **Câu 1: Làm thế nào bạn bảo vệ API Backend khỏi truy cập trái phép?**
👉 **Trả lời**: Hệ thống sử dụng middleware `authMiddleware.js` để kiểm tra Token JWT gửi kèm ở Header `Authorization: Bearer <token>`. Nếu không có token hoặc token đã hết hạn, API sẽ trả về mã lỗi `401 Unauthorized`. Đồng thời middleware `requireRole(1)` sẽ chặn tất cả các request không phải quyền Admin đối với các API quản trị.

### **Câu 2: Tại sao bạn lưu mật khẩu dưới dạng Hash Bcrypt thay vì Plain text?**
👉 **Trả lời**: Để bảo mật tuyệt đối cho tài khoản người dùng. Khi đăng ký hoặc đổi mật khẩu, mật khẩu sẽ được băm bằng thuật toán `bcrypt.hash(password, 12)` sinh ra chuỗi muối 60 ký tự. Khi người dùng đăng nhập, backend dùng `bcrypt.compare()` để đối sánh chứ không lưu hay xem được mật khẩu gốc.

### **Câu 3: Dữ liệu giữa các bảng `Xe`, `HangXe`, `LoaiXe` kết nối với nhau như thế nào?**
👉 **Trả lời**: Trong SQL Server, bảng `Xe` chứa 2 khóa ngoại (Foreign Keys) là `MaHang` tham chiếu tới bảng `HangXe(MaHang)` và `MaLoai` tham chiếu tới `LoaiXe(MaLoai)`. Khi truy vấn, chúng em sử dụng câu lệnh `INNER JOIN` hoặc `LEFT JOIN` để lấy thông tin chi tiết tên hãng xe và tên loại xe tương ứng.

### **Câu 4: Khi F5 tải lại trang, làm sao giữ được trạng thái Đăng nhập?**
👉 **Trả lời**: Trong `AuthContext.tsx`, chúng em sử dụng hook `useEffect` chạy 1 lần khi trang mount để đọc `token` và `profile` từ `localStorage`. Nếu dữ liệu hợp lệ, `AuthContext` tự động khôi phục (rehydrate) trạng thái đăng nhập cho toàn bộ ứng dụng mà không cần người dùng đăng nhập lại.

### **Câu 5: Giao diện ứng dụng hỗ trợ các loại màn hình nào?**
👉 **Trả lời**: Giao diện dashboard quản trị được viết bằng CSS Media Queries thích ứng hoàn toàn trên Desktop (`>=1025px`), iPad (`<=1024px`) với thanh Header màu xanh tràn ngang và nút menu Hamburger xổ dọc góc trên bên trái, cũng như màn hình Mobile (`<=440px`) với các thẻ ô điều khiển lớn thích hợp bấm chạm bằng ngón tay.
