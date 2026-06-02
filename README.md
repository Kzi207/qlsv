# QLSV - Hệ thống quản lý sinh viên

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20%20%3C25-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

QLSV là ứng dụng web hỗ trợ quản lý sinh viên, lớp học, học kỳ, tài khoản, điểm rèn luyện, minh chứng, điểm danh QR, sự kiện và yêu cầu hỗ trợ. Dự án được xây dựng theo mô hình full-stack TypeScript với backend Express/Prisma và frontend React/Vite.

Ứng dụng phù hợp cho môi trường quản lý lớp, khoa hoặc nhóm đào tạo cần một hệ thống gọn, dễ triển khai, có phân quyền rõ ràng giữa quản trị viên, ban cán sự và sinh viên.

## Mục Lục

- [Điểm nổi bật](#điểm-nổi-bật)
- [Vai trò người dùng](#vai-trò-người-dùng)
- [Kiến trúc tổng quan](#kiến-trúc-tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu cài đặt](#yêu-cầu-cài-đặt)
- [Cài đặt nhanh](#cài-đặt-nhanh)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Khởi tạo database](#khởi-tạo-database)
- [Chạy dự án](#chạy-dự-án)
- [Các đường dẫn chính](#các-đường-dẫn-chính)
- [API backend](#api-backend)
- [Build production](#build-production)
- [Gợi ý triển khai](#gợi-ý-triển-khai)
- [Kiểm tra mã nguồn](#kiểm-tra-mã-nguồn)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Bảo mật](#bảo-mật)
- [Thông tin liên hệ](#thông-tin-liên-hệ)

## Điểm Nổi Bật

| Nhóm chức năng | Mô tả |
| --- | --- |
| Xác thực và phân quyền | Đăng nhập bằng cookie HTTP-only, CSRF token, phân quyền `ADMIN`, `BCH`, `STUDENT`. |
| Quản lý sinh viên | Quản lý danh sách sinh viên, mã số sinh viên, email, lớp và tài khoản liên kết. |
| Quản lý lớp và học kỳ | Tạo lớp, gán học kỳ, chọn học kỳ đang hoạt động theo lớp. |
| Điểm rèn luyện | Sinh viên tự đánh giá, nộp minh chứng, ban cán sự/quản trị viên xét duyệt và điều chỉnh. |
| Điểm danh QR | Tạo phiên điểm danh theo lớp hoặc hoạt động, quét QR, kiểm tra vị trí, IP và thiết bị. |
| Sự kiện | Quản lý sự kiện và trang đăng ký công khai tại `/dangky`. |
| Ban cán sự | Gán BCH phụ trách theo lớp và khoảng số thứ tự sinh viên. |
| Hỗ trợ sinh viên | Tiếp nhận yêu cầu hỗ trợ từ trang liên hệ công khai và quản lý trong dashboard. |
| Nhật ký hoạt động | Ghi nhận lịch sử thao tác theo người dùng, vai trò, đối tượng và thời gian. |
| Chatbot sinh viên | Hỗ trợ hỏi đáp về điểm danh, điểm rèn luyện, minh chứng, hồ sơ cá nhân. Có thể dùng Gemini khi cấu hình API key. |
| Excel | Hỗ trợ các thao tác xuất/nhập dữ liệu liên quan đến sinh viên, điểm và thống kê. |
| Lưu trữ minh chứng | Hỗ trợ upload file, xử lý ảnh và tùy chọn lưu trên Cloudflare R2. |

## Vai Trò Người Dùng

| Vai trò | Quyền chính |
| --- | --- |
| `ADMIN` | Toàn quyền quản lý dashboard, sinh viên, lớp, học kỳ, tài khoản, BCH, sự kiện, hỗ trợ, điểm danh, điểm rèn luyện, minh chứng và nhật ký hoạt động. |
| `BCH` | Hỗ trợ quản lý sinh viên/lớp được phân công, tạo hoặc kiểm tra điểm danh, xử lý điểm rèn luyện và minh chứng theo phạm vi phụ trách. |
| `STUDENT` | Xem dashboard cá nhân, điểm danh QR, xem chuyên cần, tự đánh giá điểm rèn luyện, nộp minh chứng, xem hồ sơ và dùng chatbot. |

## Kiến Trúc Tổng Quan

```text
Browser
  |
  | React + Vite
  v
Frontend
  |
  | Axios, cookie, CSRF token
  v
Backend API
  |
  | Prisma ORM
  v
PostgreSQL

Tùy chọn:
Backend -> Cloudflare R2 cho minh chứng
Backend -> Gmail SMTP cho email thông báo
Backend -> Google GenAI/Gemini cho chatbot
```

## Công Nghệ Sử Dụng

### Backend

| Công nghệ | Vai trò |
| --- | --- |
| Node.js `>=20 <25` | Runtime backend. |
| Express 5 | Xây dựng REST API. |
| TypeScript | Kiểu dữ liệu và build backend. |
| Prisma 6 | ORM, migration, seed database. |
| PostgreSQL | Cơ sở dữ liệu chính. |
| JWT + Cookie | Xác thực phiên đăng nhập. |
| CSRF middleware | Bảo vệ request thay đổi dữ liệu. |
| Multer + Sharp | Upload và xử lý file/ảnh minh chứng. |
| ExcelJS | Xử lý dữ liệu Excel. |
| Nodemailer | Gửi email khi cấu hình Gmail SMTP. |
| AWS S3 SDK | Kết nối Cloudflare R2 theo chuẩn S3. |
| Google GenAI | Chatbot AI tùy chọn. |

### Frontend

| Công nghệ | Vai trò |
| --- | --- |
| React 19 | Xây dựng giao diện. |
| TypeScript | Kiểu dữ liệu phía frontend. |
| Vite | Dev server, proxy API và build production. |
| React Router 7 | Điều hướng và bảo vệ route. |
| Zustand | Lưu trạng thái xác thực. |
| Tailwind CSS | Thiết kế giao diện. |
| Axios | Gọi API backend. |
| Recharts | Biểu đồ dashboard/thống kê. |
| html5-qrcode | Quét QR trên trình duyệt. |
| qrcode.react | Tạo mã QR cho phiên điểm danh. |
| Framer Motion | Hiệu ứng giao diện. |
| Lucide React | Icon trong UI. |

## Cấu Trúc Thư Mục

```text
qlsv/
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma        # Schema dữ liệu Prisma
|   |   |-- seed.ts              # Dữ liệu khởi tạo
|   |   `-- migrations/          # Lịch sử migration
|   |-- src/
|   |   |-- controllers/         # Xử lý nghiệp vụ API
|   |   |-- middleware/          # Auth, CSRF, rate limit, security headers
|   |   |-- routes/              # Khai báo route backend
|   |   |-- types/               # Type dùng chung
|   |   `-- utils/               # Prisma, env, email, R2, Excel, bảo mật
|   |-- package.json
|   `-- tsconfig.json
|
|-- frontend/
|   |-- public/
|   |   |-- logo-qlsv.png
|   |   |-- thongtinlienhe.html
|   |   |-- chinhsachbaomat.html
|   |   `-- dieukhoansudung.html
|   |-- src/
|   |   |-- api/                 # Axios client
|   |   |-- components/          # Component dùng chung
|   |   |-- constants/           # Dữ liệu cấu hình giao diện/DRL
|   |   |-- layout/              # Main layout và sidebar
|   |   |-- pages/               # Các màn hình chức năng
|   |   |-- store/               # Zustand auth store
|   |   |-- types/               # Type frontend
|   |   `-- utils/               # Hàm hỗ trợ frontend
|   |-- package.json
|   |-- vite.config.ts
|   `-- .env.example
|
`-- README.md
```

## Yêu Cầu Cài Đặt

- Node.js từ `20` đến dưới `25`.
- npm.
- PostgreSQL database local hoặc database đã deploy sẵn.
- Git nếu muốn clone/pull/push dự án.

Kiểm tra phiên bản:

```bash
node -v
npm -v
```

## Cài Đặt Nhanh

Tại thư mục gốc của dự án:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Cấu Hình Môi Trường

### Backend

Tạo file `backend/.env` với nội dung mẫu:

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require

# Auth
JWT_SECRET=replace_with_a_strong_secret_at_least_32_chars

# Cookie khi deploy khác domain hoặc dùng HTTPS
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
COOKIE_DOMAIN=

# Tùy chọn: cho phép token qua query khi thật sự cần
ALLOW_QUERY_TOKEN_AUTH=false

# Tùy chọn: Cloudflare R2 cho minh chứng
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_ENDPOINT=
R2_REGION=auto
R2_EVIDENCE_PREFIX=evidence

# Tùy chọn: Gmail SMTP
GMAIL_USER=
GMAIL_APP_PASSWORD=
MAIL_FROM=

# Tùy chọn: Chatbot AI
GEMINI_API_KEY=
GOOGLE_GENAI_API_KEY=
GEMINI_MODEL=gemma-4-31b-it
```

Ghi chú:

- `DATABASE_URL` là bắt buộc. Backend sẽ không khởi động nếu thiếu biến này.
- `JWT_SECRET` nên dài tối thiểu 32 ký tự. Trong production, backend bắt buộc secret đủ mạnh.
- `FRONTEND_ORIGIN` phải trùng origin frontend để CORS và cookie hoạt động đúng.
- Nếu frontend và backend ở hai domain khác nhau, thường cần `COOKIE_SAME_SITE=none` và `COOKIE_SECURE=true`.

### Frontend

Tạo `frontend/.env` từ file mẫu:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Hoặc trên macOS/Linux:

```bash
cp frontend/.env.example frontend/.env
```

Cấu hình local mặc định:

```env
VITE_API_URL=/api
VITE_API_TARGET=http://localhost:5000
VITE_DEV_ALLOWED_HOSTS=
VITE_LOGIN_BACKGROUND_IMAGE_URL=
VITE_LOGIN_LOGO_URL=/logo-qlsv.png
VITE_MAPS_QUERY_URL=https://www.google.com/maps?q=
```

Khi chạy local, Vite sẽ proxy request `/api` sang `VITE_API_TARGET`.

Khi deploy production và gọi API trực tiếp:

```env
VITE_API_URL=https://your-backend.example.com/api
VITE_API_TARGET=
```

## Khởi Tạo Database

Chạy Prisma generate, migration và seed:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Seed hiện tạo dữ liệu khởi đầu gồm:

| Dữ liệu | Giá trị |
| --- | --- |
| Tài khoản mẫu | `admin` |
| Mật khẩu mẫu | `admin123` |
| Lớp mẫu | `CNCD2511` |
| Sinh viên mẫu | `CNCD2511016` |

Sau khi seed, hãy đổi mật khẩu mặc định ngay. Nếu tài khoản `admin` chưa có quyền quản trị, cập nhật role thành `ADMIN` trong database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE username = 'admin';
```

Bạn cũng có thể mở Prisma Studio để kiểm tra dữ liệu:

```bash
cd backend
npx prisma studio
```

## Chạy Dự Án

Mở hai terminal riêng.

Terminal 1 - backend:

```bash
cd backend
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:5000
```

Terminal 2 - frontend:

```bash
cd frontend
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

Đăng nhập tại:

```text
http://localhost:5173/login
```

## Các Đường Dẫn Chính

### Route nội bộ

| Đường dẫn | Vai trò | Mô tả |
| --- | --- | --- |
| `/` | Tất cả | Dashboard theo vai trò. |
| `/login` | Công khai | Trang đăng nhập. |
| `/students` | `ADMIN`, `BCH` | Quản lý sinh viên. |
| `/classes` | `ADMIN`, `BCH` | Quản lý lớp. |
| `/semesters` | `ADMIN`, `BCH` | Quản lý học kỳ. |
| `/accounts` | `ADMIN`, `BCH` | Quản lý tài khoản. |
| `/bch` | `ADMIN` | Quản lý ban cán sự. |
| `/drl` | `ADMIN`, `BCH` | Quản lý điểm rèn luyện. |
| `/training` | Tất cả | Xem điểm rèn luyện. |
| `/training/evaluation/self` | `STUDENT` | Sinh viên tự đánh giá DRL. |
| `/training/approval` | `ADMIN`, `BCH` | Duyệt điểm rèn luyện. |
| `/evidence/submit` | `STUDENT` | Nộp minh chứng. |
| `/evidence/review` | `ADMIN`, `BCH` | Duyệt minh chứng. |
| `/attendance` | Tất cả | Xem chuyên cần/điểm danh. |
| `/attendance/scan` | Tất cả | Quét QR điểm danh. |
| `/attendance/manage/class` | `ADMIN`, `BCH` | Tạo phiên QR theo lớp. |
| `/attendance/manage/activity` | `ADMIN`, `BCH` | Tạo phiên QR cho hoạt động. |
| `/events` | `ADMIN`, `BCH` | Quản lý sự kiện. |
| `/support` | `ADMIN` | Quản lý yêu cầu hỗ trợ. |
| `/profile` | Tất cả | Hồ sơ cá nhân. |
| `/activity-history` | Tất cả | Lịch sử hoạt động. |

### Trang công khai

| Đường dẫn | Mô tả |
| --- | --- |
| `/dangky` | Đăng ký sự kiện công khai. |
| `/thongtinlienhe.html` | Trang liên hệ và gửi yêu cầu hỗ trợ. |
| `/chinhsachbaomat.html` | Chính sách bảo mật. |
| `/dieukhoansudung.html` | Điều khoản sử dụng. |

## API Backend

Backend mount các nhóm API dưới prefix `/api`:

| Prefix | Chức năng |
| --- | --- |
| `/api/auth` | Đăng nhập, đăng xuất, lấy thông tin phiên, quản lý xác thực. |
| `/api/students` | Quản lý sinh viên. |
| `/api/classes` | Quản lý lớp. |
| `/api/semesters` | Quản lý học kỳ. |
| `/api/training` | Điểm rèn luyện, tự đánh giá, xét duyệt, minh chứng. |
| `/api/attendance` | Phiên điểm danh, QR, lịch sử chuyên cần. |
| `/api/bch` | Phân công ban cán sự. |
| `/api/events` | Sự kiện và đăng ký sự kiện. |
| `/api/support` | Yêu cầu hỗ trợ. |
| `/api/chatbot` | Chatbot hỗ trợ sinh viên. |
| `/api/activity-logs` | Nhật ký hoạt động. |

Health check đơn giản:

```text
GET http://localhost:5000/
```

## Build Production

### Backend

```bash
cd backend
npm run build
npm start
```

Lệnh build sẽ chạy Prisma generate trước rồi biên dịch TypeScript sang `backend/dist`.

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

Thư mục build frontend:

```text
frontend/dist
```

## Gợi Ý Triển Khai

### Backend

Thiết lập các biến môi trường production:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your_production_secret_at_least_32_chars
FRONTEND_ORIGIN=https://your-frontend.example.com
COOKIE_SAME_SITE=none
COOKIE_SECURE=true
```

Nếu dùng migration production:

```bash
cd backend
npx prisma migrate deploy
npm run build
npm start
```

### Frontend

Nếu frontend được deploy riêng:

```env
VITE_API_URL=https://your-backend.example.com/api
VITE_API_TARGET=
```

Nếu dùng Vercel, kiểm tra `frontend/vercel.json` và cấu hình biến môi trường trong dashboard của Vercel.

### Upload minh chứng

- Local development có thể lưu file theo cấu hình mặc định của backend.
- Production nên cấu hình Cloudflare R2 để tránh mất file khi server restart hoặc chạy trên môi trường serverless.

### Cookie, CORS và HTTPS

- `FRONTEND_ORIGIN` phải đúng origin thật của frontend.
- Khi frontend/backend khác domain, cookie đăng nhập cần `SameSite=None` và `Secure=true`.
- Trình duyệt yêu cầu HTTPS nếu cookie dùng `SameSite=None`.

## Kiểm Tra Mã Nguồn

Frontend có ESLint:

```bash
cd frontend
npm run lint
```

Backend có thể kiểm tra TypeScript bằng build:

```bash
cd backend
npm run build
```

Dự án hiện chưa có script test tự động riêng trong `package.json`.

## Lỗi Thường Gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Backend báo `Missing DATABASE_URL` | Tạo `backend/.env` và cấu hình đúng `DATABASE_URL`. |
| Không đăng nhập được hoặc bị quay lại `/login` | Kiểm tra `FRONTEND_ORIGIN`, `COOKIE_SAME_SITE`, `COOKIE_SECURE`, HTTPS và domain cookie. |
| Frontend gọi API bị CORS | Đảm bảo origin frontend nằm trong `FRONTEND_ORIGIN`. |
| Vite không proxy API | Kiểm tra `VITE_API_URL=/api` và `VITE_API_TARGET=http://localhost:5000`. |
| Prisma migrate lỗi kết nối | Kiểm tra database đang chạy, user/password đúng và database tồn tại. |
| Tài khoản `admin` không thấy menu quản trị | Kiểm tra role trong bảng `User`, đặt thành `ADMIN` nếu cần. |
| QR scanner không hoạt động | Trình duyệt cần quyền camera, HTTPS hoặc localhost, và thiết bị phải có camera khả dụng. |
| Điểm danh vị trí không hợp lệ | Kiểm tra quyền location, bán kính phiên điểm danh và tọa độ thiết bị. |
| Upload minh chứng lỗi R2 | Kiểm tra đủ `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`. |
| Chatbot không trả lời bằng AI | Kiểm tra `GEMINI_API_KEY` hoặc `GOOGLE_GENAI_API_KEY`. Nếu không có key, chatbot sẽ ưu tiên dữ liệu nội bộ. |

## Bảo Mật

- Không commit `.env`, API key, database URL, mật khẩu hoặc `JWT_SECRET`.
- Đổi mật khẩu tài khoản mẫu sau lần chạy đầu tiên.
- Dùng `JWT_SECRET` đủ dài và khác nhau giữa development/production.
- Bật HTTPS khi deploy production.
- Cấu hình cookie đúng domain để tránh lỗi đăng nhập và giảm rủi ro bảo mật.
- Không bật `ALLOW_QUERY_TOKEN_AUTH=true` nếu không có nhu cầu rõ ràng.
- Với dữ liệu minh chứng, ưu tiên storage có kiểm soát quyền truy cập như Cloudflare R2.

## Quy Trình Sử Dụng Gợi Ý

1. Quản trị viên đăng nhập bằng tài khoản khởi tạo.
2. Cập nhật role, đổi mật khẩu và kiểm tra thông tin tài khoản.
3. Tạo hoặc import lớp, sinh viên và tài khoản.
4. Tạo học kỳ, gán học kỳ hoạt động cho lớp.
5. Phân công BCH theo lớp hoặc khoảng số thứ tự sinh viên.
6. Mở đợt tự đánh giá điểm rèn luyện, sinh viên nộp phiếu và minh chứng.
7. BCH hoặc quản trị viên xét duyệt minh chứng, điểm rèn luyện.
8. Tạo phiên điểm danh QR theo lớp hoặc hoạt động.
9. Sinh viên quét QR, xem chuyên cần, xem điểm và lịch sử hoạt động.
10. Theo dõi yêu cầu hỗ trợ và xử lý phản hồi khi có vấn đề phát sinh.

## Thông Tin Liên Hệ

| Mục | Thông tin |
| --- | --- |
| Dự án | Hệ thống QLSV |
| Tác giả/nhóm phát triển | Lê Khánh Duy, Phạm Thái Minh Đăng |
| Email | `toi05022020@gmail.com` |
| Trang liên hệ | `/thongtinlienhe.html` |
| Trang đăng ký sự kiện | `/dangky` |

## Bản Quyền

© 2026 Lê Khánh Duy. All Rights Reserved.

Toàn bộ mã nguồn, thiết kế giao diện, cấu trúc dữ liệu và logic nghiệp vụ thuộc quyền sở hữu của tác giả. Không sao chép, chỉnh sửa, tái phân phối hoặc sử dụng cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản của tác giả.
