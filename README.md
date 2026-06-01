# QLSV - Hệ thống quản lý sinh viên

QLSV là ứng dụng web hỗ trợ quản lý sinh viên, lớp học, học kỳ, điểm rèn luyện, điểm danh QR và các hoạt động liên quan đến công tác quản lý lớp/đào tạo.

Dự án gồm 2 phần chính:

- `backend`: API Node.js/Express, Prisma ORM, PostgreSQL.
- `frontend`: giao diện React + TypeScript + Vite.

## Tính năng chính

- Đăng nhập, đăng xuất và phân quyền theo vai trò `ADMIN`, `BCH`, `STUDENT`.
- Quản lý sinh viên, lớp, học kỳ và tài khoản.
- Quản lý điểm rèn luyện, tự đánh giá, xét duyệt và nộp minh chứng.
- Điểm danh bằng QR cho lớp học hoặc hoạt động.
- Quản lý sự kiện và trang đăng ký công khai tại `/dangky`.
- Quản lý yêu cầu hỗ trợ từ trang liên hệ công khai.
- Chatbot hỗ trợ sinh viên khi có cấu hình khóa API AI.
- Xuất/nhập dữ liệu liên quan bằng Excel.

## Công nghệ sử dụng

### Backend

- Node.js 20+
- Express 5
- TypeScript
- Prisma
- PostgreSQL
- JWT, cookie, CSRF middleware
- Multer, Sharp, ExcelJS
- Tùy chọn: Gmail SMTP, Cloudflare R2, Google GenAI/Gemini

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- Tailwind CSS
- Axios
- Recharts
- QR Code / HTML5 QR scanner

## Cấu trúc thư mục

```text
qlsv/
|-- backend/               # Mã nguồn API
|   |-- prisma/            # Prisma schema, seed và database scripts
|   `-- src/
|       |-- controllers/   # Xử lý nghiệp vụ
|       |-- middleware/    # Auth, CSRF, rate limit, security headers
|       |-- routes/        # Khai báo API routes
|       `-- utils/         # Cấu hình, Prisma, email, storage...
|-- frontend/              # Mã nguồn giao diện React
|   |-- public/            # Tài nguyên tĩnh và trang công khai
|   `-- src/
|       |-- components/    # Component dùng chung
|       |-- layout/        # Layout và sidebar
|       |-- pages/         # Các trang chức năng
|       |-- store/         # Auth store
|       `-- utils/         # Hàm hỗ trợ frontend
`-- README.md
```

## Yêu cầu trước khi cài đặt

- Node.js từ `20` đến dưới `25`.
- npm.
- PostgreSQL hoặc một PostgreSQL database đã deploy sẵn.

## Cài đặt

Tại thư mục gốc của dự án:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Cấu hình môi trường

### Backend

Tạo file `backend/.env` từ file mẫu:

```bash
cd backend
cp .env.example .env
```

Cập nhật các biến bắt buộc:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require
JWT_SECRET=replace_with_a_strong_secret_at_least_32_chars
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development
PORT=5000
```

Khi deploy production và frontend/backend khác domain, cần cấu hình thêm:

```env
COOKIE_SAME_SITE=none
COOKIE_SECURE=true
```

### Frontend

Tạo file `frontend/.env` từ file mẫu:

```bash
cd frontend
cp .env.example .env
```

Cấu hình mặc định khi chạy local:

```env
VITE_API_URL=/api
VITE_API_TARGET=http://localhost:5000
```

Vite sẽ proxy các request `/api` sang backend local.

## Khởi tạo database

Chạy Prisma migrate và seed dữ liệu ban đầu:

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

Tài khoản admin mặc định được tạo bởi seed:

```text
Tên đăng nhập: admin
Mật khẩu: admin123
```

Nên đổi mật khẩu ngay sau lần đăng nhập đầu tiên.

## Cách chạy dự án

Mở 2 terminal riêng.

Terminal 1 - chạy backend:

```bash
cd backend
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:5000
```

Terminal 2 - chạy frontend:

```bash
cd frontend
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

Sau đó truy cập `http://localhost:5173/login` để đăng nhập.

## Cách dùng cơ bản

1. Đăng nhập bằng tài khoản `admin`.
2. Tạo hoặc cập nhật lớp học, học kỳ và danh sách sinh viên.
3. Tạo tài khoản cho sinh viên/BCH nếu cần phân quyền riêng.
4. Quản lý điểm rèn luyện tại các màn hình DRL, xét duyệt và minh chứng.
5. Tạo phiên điểm danh QR cho lớp hoặc hoạt động.
6. Sinh viên đăng nhập để xem dashboard, tự đánh giá, nộp minh chứng và quét QR điểm danh.
7. Dùng trang `/dangky` cho đăng ký sự kiện công khai.
8. Dùng trang `/thongtinlienhe.html` để gửi yêu cầu hỗ trợ công khai.

## Build và chạy production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

Thư mục build frontend nằm tại `frontend/dist`.

## Kiểm tra mã nguồn

Frontend có cấu hình ESLint:

```bash
cd frontend
npm run lint
```

Backend hiện chưa có script test riêng. Có thể kiểm tra TypeScript/backend build bằng:

```bash
cd backend
npm run build
```

## Ghi chú triển khai

- `FRONTEND_ORIGIN` phải trùng với domain frontend để CORS và cookie hoạt động đúng.
- Khi dùng Vercel/Render hoặc hai domain khác nhau, đặt `COOKIE_SAME_SITE=none` và `COOKIE_SECURE=true`.
- Không đưa file `.env`, khóa API, mật khẩu database hoặc `JWT_SECRET` lên Git.
- Nếu dùng upload minh chứng lên Cloudflare R2, cấu hình các biến `R2_*` trong `backend/.env`.
- Nếu dùng email thông báo, cấu hình `GMAIL_USER`, `GMAIL_APP_PASSWORD` và `MAIL_FROM`.
- Nếu dùng chatbot, cấu hình `GEMINI_API_KEY` và `GEMINI_MODEL`.

## Thông tin liên hệ

- Tác giả: Lê Khánh Duy,Phạm Thái Minh Đăng
- Email: `toi05022020@gmail.com`
- Dự án: Hệ thống QLSV
- Trang liên hệ trong hệ thống: `/thongtinlienhe.html`
- Yêu cầu hỗ trợ được ghi nhận trong menu `Hỗ trợ` của tài khoản quản trị.

## Bản quyền

© 2026 Lê Khánh Duy. All Rights Reserved.

Toàn bộ mã nguồn, thiết kế giao diện, cấu trúc dữ liệu và logic nghiệp vụ thuộc quyền sở hữu của tác giả. Không sao chép, chỉnh sửa, tái phân phối hoặc sử dụng cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản của tác giả.
