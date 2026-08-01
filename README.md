# QLSV - Hệ Thống Quản Lý Sinh Viên & Điểm Rèn Luyện

Hệ thống quản lý sinh viên và chấm điểm rèn luyện (DRL) trực tuyến hiện đại dành cho Liên chi đoàn / Khoa. Hỗ trợ tự động hóa chấm điểm rèn luyện, duyệt minh chứng trực quan, điểm danh bằng mã QR, tích hợp trợ lý ảo thông minh AI (Gemini), và xuất nhập dữ liệu linh hoạt qua Excel.

---

## 🚀 Tính Năng Chính

### 👥 Phân Quyền Hệ Thống (RBAC)
*   **ADMIN**: Quản lý toàn diện hệ thống bao gồm Tài khoản, Lớp học, Học kỳ, Ban Cán Sự (BCH), Sự kiện, và Cấu hình hệ thống.
*   **BCH (Ban Cán Sự)**: Quản lý sinh viên trong lớp được giao, duyệt phiếu điểm rèn luyện của sinh viên, nhập dữ liệu hàng loạt và thống kê kết quả.
*   **STUDENT**: Tự đánh giá điểm rèn luyện học kỳ, đăng tải tệp minh chứng hoạt động, điểm danh QR, xem thống kê chuyên cần và trò chuyện với trợ lý ảo AI.

### 📊 Quản Lý Điểm Rèn Luyện & Minh Chứng
*   **Tự Đánh Giá Trực Tuyến**: Sinh viên thực hiện chấm điểm theo biểu mẫu chuẩn trực quan, dễ sử dụng.
*   **Duyệt Minh Chứng Thông Minh**: BCH/Admin phê duyệt minh chứng trực tiếp bằng cách xem các hình ảnh/tài liệu được tải lên lưu trữ đám mây.
*   **Nhập Minh Chứng Từ Excel**: Cấp điểm cộng hoạt động hàng loạt cho danh sách sinh viên qua file Excel và tự động duyệt minh chứng tương ứng.
*   **Nhập DRL Bằng File**: Cập nhật trực tiếp điểm tổng và điểm thành phần (Ý thức, Hoạt động, Kỷ luật) trực tiếp từ file điểm Excel của Khoa/Trường.
*   **Xuất Báo Cáo**: Xuất toàn bộ bảng điểm rèn luyện của lớp/học kỳ ra định dạng Excel chuẩn.

### 📱 Điểm Danh QR
*   **Điểm Danh Sự Kiện**: Tạo mã điểm danh QR động theo thời gian thực cho các hoạt động Đoàn - Hội.
*   **Điểm Danh Học Phần**: Hỗ trợ giảng viên/BCH điểm danh chuyên cần của các buổi học trên lớp.

### 🤖 Trợ Lý Ảo AI (Gemini Integration)
*   Tích hợp mô hình ngôn ngữ lớn **Gemini** giúp giải đáp các thắc mắc về quy chế đánh giá điểm rèn luyện, hướng dẫn thao tác trên hệ thống và tư vấn hoạt động cho sinh viên.

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
*   **Framework**: React 19, TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS, Lucide Icons, Framer Motion (Animations)
*   **State Management**: Zustand
*   **HTTP Client**: Axios
*   **Charts**: Recharts

### Backend
*   **Runtime**: Node.js, Express, TypeScript
*   **Database ORM**: Prisma (PostgreSQL / Neon.tech)
*   **Object Storage**: Cloudflare R2 / AWS S3 SDK (Lưu trữ hình ảnh minh chứng)
*   **Authentication**: JWT, Google OAuth 2.0
*   **Mailing**: Nodemailer (Gửi mã xác nhận qua Gmail)
*   **AI Engine**: Google Gen AI SDK (Gemini API)

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống
*   **Node.js**: Phiên bản `>= 20` và `< 25`
*   **Cơ sở dữ liệu**: PostgreSQL (Khuyên dùng Neon.tech hoặc CockroachDB)
*   **Lưu trữ đám mây**: Cloudflare R2 hoặc AWS S3
*   **Công cụ dòng lệnh**: `npm` hoặc `yarn`

---

### 1. Cài Đặt & Khởi Chạy Backend

1.  Di chuyển vào thư mục backend:
    ```bash
    cd backend
    ```
2.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
3.  Tạo file cấu hình môi trường `.env` trong thư mục `backend/` dựa theo mẫu dưới đây:
    ```env
    # Cơ sở dữ liệu PostgreSQL
    DATABASE_URL="postgresql://username:password@host:port/dbname?sslmode=require"

    # Cấu hình Mailer (Dùng Gmail App Password)
    GMAIL_USER="your-email@gmail.com"
    GMAIL_APP_PASSWORD="your-gmail-app-password"

    # Cloudflare R2 / S3 Storage (Lưu file minh chứng)
    R2_ACCOUNT_ID="your-cloudflare-account-id"
    R2_ACCESS_KEY_ID="your-access-key"
    R2_SECRET_ACCESS_KEY="your-secret-key"
    R2_BUCKET="your-bucket-name"
    R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
    R2_REGION="auto"
    R2_EVIDENCE_PREFIX="evidence"

    # Xác thực JWT
    JWT_SECRET="tự-sinh-chuỗi-jwt-secret-dài-và-bảo-mật"

    # Google OAuth
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
    GOOGLE_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"

    # Gemini AI
    GEMINI_API_KEY="your-gemini-api-key"
    GEMINI_MODEL="gemini-2.5-flash"

    # Cấu hình Runtime
    NODE_ENV=development
    PORT=5000
    FRONTEND_ORIGIN="http://localhost:5173"
    ```
4.  Cập nhật Schema và khởi tạo Database:
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```
5.  *(Tùy chọn)* Nạp dữ liệu mẫu ban đầu (Seeding):
    ```bash
    npm run prisma:seed
    ```
6.  Chạy Backend ở chế độ phát triển:
    ```bash
    npm run dev
    ```

---

### 2. Cài Đặt & Khởi Chạy Frontend

1.  Di chuyển vào thư mục frontend:
    ```bash
    cd ../frontend
    ```
2.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
3.  Tạo file cấu hình môi trường `.env` trong thư mục `frontend/` để kết nối với API:
    ```env
    # Đường dẫn gốc API gọi từ UI
    VITE_API_URL=/api

    # Target Backend cho Vite Proxy
    VITE_API_TARGET=http://localhost:5000

    # Cấu hình bổ sung (Không bắt buộc)
    VITE_MAPS_QUERY_URL=https://www.google.com/maps?q=
    ```
4.  Khởi chạy Frontend ở chế độ phát triển:
    ```bash
    npm run dev
    ```
    *Giao diện người dùng sẽ chạy mặc định tại địa chỉ: `http://localhost:5173`*

---

## 📦 Đóng Gói Ứng Dụng (Production Build)

### Đóng gói Frontend
```bash
cd frontend
npm run build
```
Thư mục chứa mã nguồn tĩnh sau khi đóng gói sẽ nằm ở `frontend/dist/`.

### Đóng gói Backend
```bash
cd backend
npm run build
```
Mã JavaScript đã biên dịch từ TypeScript sẽ nằm ở `backend/dist/`. Chạy máy chủ production:
```bash
npm start
```
