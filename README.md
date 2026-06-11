# QLSV | Hệ Thống Quản Lý Sinh Viên

<div align="center">
  <img src="./frontend/public/logo-qlsv-clean.png" alt="QLSV Logo" width="160" />

  <h3>Nền tảng quản lý sinh viên, điểm rèn luyện, điểm danh QR và vận hành lớp học trên một hệ thống thống nhất</h3>

  <p>
    <img src="https://img.shields.io/badge/Node.js-%3E%3D20%20%3C25-2F855A?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-6.x-2563EB?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-19-0EA5E9?style=for-the-badge&logo=react&logoColor=06263A" alt="React" />
    <img src="https://img.shields.io/badge/Express-5-111827?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Prisma-6-334155?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Ready-0F766E?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
</div>

> QLSV là dự án full-stack TypeScript phục vụ quản lý sinh viên theo lớp và học kỳ, kết hợp các bài toán thực tế như chấm điểm rèn luyện, nộp minh chứng, điểm danh QR có kiểm tra vị trí, đăng ký sự kiện, yêu cầu hỗ trợ và chatbot nội bộ cho sinh viên.

## Mục Lục

- [Tổng Quan Dự Án](#tổng-quan-dự-án)
- [Điểm Nổi Bật](#điểm-nổi-bật)
- [Phân Tích Tính Năng Theo Nghiệp Vụ](#phân-tích-tính-năng-theo-nghiệp-vụ)
- [Vai Trò Người Dùng](#vai-trò-người-dùng)
- [Kiến Trúc Tổng Quan](#kiến-trúc-tổng-quan)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
- [Hướng Dẫn Chạy Dự Án Từ Đầu](#hướng-dẫn-chạy-dự-án-từ-đầu)
- [Biến Môi Trường Backend](#biến-môi-trường-backend)
- [Biến Môi Trường Frontend](#biến-môi-trường-frontend)
- [Khởi Tạo Database](#khởi-tạo-database)
- [Chạy Local Development](#chạy-local-development)
- [Luồng Kiểm Tra Sau Khi Chạy](#luồng-kiểm-tra-sau-khi-chạy)
- [Route Và API Chính](#route-và-api-chính)
- [Build Và Triển Khai](#build-và-triển-khai)
- [Bảo Mật Và Vận Hành](#bảo-mật-và-vận-hành)
- [Lỗi Thường Gặp](#lỗi-thường-gặp)
- [Tác Giả](#tác-giả)
- [Bản Quyền](#bản-quyền)

## Tổng Quan Dự Án

QLSV được thiết kế cho bối cảnh quản lý lớp, khoa hoặc đơn vị đào tạo cần một hệ thống gọn nhưng đủ sâu để xử lý cả nghiệp vụ học vụ lẫn vận hành hằng ngày. Thay vì tách rời nhiều biểu mẫu, file Excel và nhóm chat, dự án gom các luồng công việc quan trọng về cùng một nền tảng:

- Quản trị tài khoản, sinh viên, lớp và học kỳ.
- Theo dõi điểm rèn luyện theo từng học kỳ với khả năng tự đánh giá, phê duyệt và đối soát minh chứng.
- Điểm danh QR theo lớp hoặc theo hoạt động, có kiểm tra vị trí, IP và lịch sử check-in.
- Tổ chức sự kiện có trang đăng ký công khai riêng.
- Tiếp nhận yêu cầu hỗ trợ từ sinh viên ngay cả khi chưa đăng nhập.
- Tạo nhật ký hoạt động để truy vết thao tác.
- Tích hợp chatbot nội bộ để hỗ trợ các câu hỏi thường gặp và một số truy vấn cá nhân.

Điểm mạnh của dự án không chỉ nằm ở số lượng module, mà ở cách các module liên kết với nhau. Ví dụ, một phiên điểm danh hoạt động có thể cộng trực tiếp điểm vào tiêu chí rèn luyện phù hợp; minh chứng được duyệt sẽ làm thay đổi tổng điểm và đưa phiếu về trạng thái chờ xét lại; BCH có thể chỉ quản lý lớp hoặc dải số thứ tự sinh viên được phân công.

## Điểm Nổi Bật

| Nhóm | Giá trị thực tế |
| --- | --- |
| Quản lý theo vai trò | Phân quyền rõ giữa `ADMIN`, `BCH`, `STUDENT`, giúp đúng người đúng việc. |
| Điểm rèn luyện có chiều sâu | Không chỉ lưu tổng điểm, mà còn lưu chi tiết theo tiêu chí, file minh chứng, hoạt động QR, trạng thái duyệt và ghi chú phản hồi. |
| Điểm danh QR thông minh | Hỗ trợ phiên điểm danh theo lớp hoặc hoạt động, có tọa độ, bán kính, khung giờ và tổng hợp tỷ lệ tham gia. |
| Gắn hoạt động vào DRL | Điểm danh hoạt động có thể tự cộng điểm vào đúng mục rèn luyện theo cấu hình phiên QR. |
| Vận hành linh hoạt cho BCH | BCH có thể bị giới hạn theo lớp hoặc theo khoảng số thứ tự sinh viên. |
| Hỗ trợ công khai | Sinh viên có thể gửi yêu cầu hỗ trợ từ trang công khai mà không cần đăng nhập. |
| Chatbot nội bộ | Có thể trả lời về chuyên cần, điểm rèn luyện, hồ sơ cá nhân, đồng thời fallback sang tri thức cục bộ nếu chưa cấu hình AI. |
| Khả năng mở rộng tốt | Prisma + TypeScript + React giúp dự án dễ bảo trì và phát triển thêm module. |

## Phân Tích Tính Năng Theo Nghiệp Vụ

### 1. Xác thực và hồ sơ người dùng

- Đăng nhập bằng `username/password`, phát hành JWT và lưu phiên bằng cookie.
- Có các luồng `me`, cập nhật hồ sơ, đổi mật khẩu, quên mật khẩu bằng mã gửi email.
- Hệ thống có ghi log cho các thao tác auth quan trọng như đăng nhập thành công, đăng nhập thất bại, đổi mật khẩu, đặt lại mật khẩu.
- Frontend dùng route guard để khóa màn hình theo vai trò.

### 2. Quản lý sinh viên, lớp và học kỳ

- Quản lý danh sách sinh viên với mã sinh viên, email, lớp, số thứ tự.
- Quản lý lớp học và học kỳ đang hoạt động.
- Học kỳ có thể mang tính toàn cục hoặc giới hạn theo phạm vi lớp.
- Đây là phần nền cho hầu hết module còn lại: DRL, điểm danh, sự kiện và thống kê.

### 3. Điểm rèn luyện

- Sinh viên có thể tự nộp phiếu đánh giá theo học kỳ.
- Hệ thống lưu chi tiết theo từng tiêu chí dưới dạng `details`, không chỉ lưu điểm tổng.
- Có phân tách `điểm sinh viên tự khai` và `điểm quản trị/BCH duyệt`.
- Mỗi phiếu có trạng thái như `PENDING`, `APPROVED`, `REJECTED`.
- Có thống kê theo lớp, tỷ lệ nộp phiếu, tỷ lệ duyệt và danh sách chưa nộp.
- Có thể export Excel để phục vụ tổng hợp và báo cáo.

### 4. Minh chứng và xét duyệt minh chứng

- Sinh viên nộp minh chứng riêng cho từng tiêu chí.
- Mỗi minh chứng có tên hoạt động, số điểm, danh sách file, trạng thái và thời điểm nộp.
- Khi minh chứng được duyệt, hệ thống có thể gắn điểm vào tiêu chí tương ứng và tự tính lại tổng điểm rèn luyện.
- Nếu minh chứng bị từ chối hoặc chuyển tiêu chí, dữ liệu cũng được đồng bộ lại.
- Phần này tạo ra quy trình duyệt minh bạch hơn thay vì chấm thủ công hoàn toàn.

### 5. Điểm danh QR và chuyên cần

- Tạo phiên điểm danh cho lớp hoặc cho hoạt động.
- Mỗi phiên có `title`, `sessionDate`, tọa độ, bán kính, thời gian mở/đóng check-in và token QR riêng.
- Có hỗ trợ kiểm tra khoảng cách địa lý, IP, thông tin thiết bị và hồ sơ check-in nền của sinh viên.
- Có thống kê số lượng đã điểm danh, vắng mặt, tỷ lệ tham gia, mức độ hợp lệ vị trí/IP.
- Có thể điểm danh thủ công hoặc xóa điểm danh thủ công khi cần hiệu chỉnh.
- Có thể export danh sách điểm danh ra Excel.

### 6. Cộng điểm hoạt động vào DRL

- Đây là một phần khá hay của dự án: phiên điểm danh hoạt động có thể cấu hình để cộng điểm vào một mục DRL cụ thể.
- Khi sinh viên check-in thành công, hệ thống ghi lại activity vào chi tiết tiêu chí, cộng điểm và cập nhật tổng phiếu.
- Nếu admin xóa check-in thủ công, điểm cộng tương ứng cũng được rút lại.
- Điều này giúp giảm khối lượng cộng điểm thủ công sau sự kiện.

### 7. Sự kiện và trang đăng ký công khai

- Có module quản lý sự kiện ở backend/frontend.
- Có route công khai `/dangky` cho phép đăng ký tham gia sự kiện.
- Dữ liệu đăng ký được lưu thành từng bản ghi và có ràng buộc tránh đăng ký trùng theo sinh viên/sự kiện.

### 8. Ban cán sự và phạm vi phụ trách

- BCH không chỉ là một vai trò hiển thị, mà có bảng phân công riêng.
- Có thể gán BCH theo lớp và khoảng số thứ tự sinh viên từ `fromOrder` đến `toOrder`.
- Điều này phù hợp với mô hình lớp đông sinh viên, nhiều BCH cùng phụ trách từng cụm.

### 9. Yêu cầu hỗ trợ

- Có endpoint công khai nhận yêu cầu hỗ trợ.
- Admin có thể xem danh sách, cập nhật trạng thái `NEW`, `IN_PROGRESS`, `RESOLVED`, và chỉ xóa khi yêu cầu đã hoàn tất.
- Hệ thống lưu thêm `sourcePage`, `ipAddress`, `userAgent` để hỗ trợ truy vết.

### 10. Chatbot hỗ trợ sinh viên

- Có tri thức cục bộ cho các chủ đề như điểm danh, DRL, hồ sơ, sự kiện, hỗ trợ.
- Nếu cấu hình `GEMINI_API_KEY` hoặc `GOOGLE_GENAI_API_KEY`, chatbot có thể sinh câu trả lời bằng AI trên nền hướng dẫn nội bộ.
- Có cơ chế từ chối các yêu cầu không an toàn như xin token, mật khẩu, bypass bảo mật hoặc sửa điểm trái phép.
- Chatbot còn hỗ trợ các truy vấn cá nhân như:
  - Xem thông tin cá nhân.
  - Xem điểm rèn luyện gần nhất.
  - Xem tổng quan chuyên cần.
  - Cập nhật tên hoặc email của chính tài khoản hiện tại.

### 11. Nhật ký hoạt động

- Nhiều thao tác quan trọng đều gọi `writeActivityLog`.
- Đây là nền tảng quan trọng cho audit, debug và truy vết thay đổi.
- Dù route lịch sử trên UI hiện chưa mở ra đầy đủ như một module riêng, dữ liệu log ở backend đã có giá trị vận hành rõ ràng.

## Vai Trò Người Dùng

| Vai trò | Quyền chính |
| --- | --- |
| `ADMIN` | Toàn quyền với sinh viên, lớp, học kỳ, tài khoản, BCH, sự kiện, hỗ trợ, điểm rèn luyện, minh chứng, điểm danh và thống kê. |
| `BCH` | Quản lý lớp/phạm vi được giao, hỗ trợ duyệt DRL, theo dõi sinh viên, tổ chức điểm danh và xử lý nghiệp vụ trong phạm vi phụ trách. |
| `STUDENT` | Đăng nhập xem dashboard, điểm danh QR, theo dõi chuyên cần, nộp phiếu DRL, nộp minh chứng, xem hồ sơ và dùng chatbot. |

## Kiến Trúc Tổng Quan

```text
Browser
  |
  v
React 19 + Vite + Router + Zustand + Axios
  |
  |  Cookie auth / API calls
  v
Express 5 API
  |
  |  Prisma ORM
  v
PostgreSQL

Tùy chọn mở rộng:
- Cloudflare R2 cho file minh chứng
- Gmail SMTP cho mail quên mật khẩu / thông báo
- Google GenAI (Gemini) cho chatbot
```

## Công Nghệ Sử Dụng

### Backend

| Công nghệ | Vai trò |
| --- | --- |
| Node.js `>=20 <25` | Runtime cho API server |
| Express 5 | Tổ chức REST API |
| TypeScript | Kiểu dữ liệu và maintainability |
| Prisma 6 | ORM, migration, seed |
| PostgreSQL | Cơ sở dữ liệu chính |
| bcryptjs | Hash mật khẩu |
| jsonwebtoken | Sinh JWT cho phiên đăng nhập |
| cookie-parser | Xử lý cookie |
| Multer + Sharp | Upload và xử lý ảnh/file minh chứng |
| ExcelJS | Xuất dữ liệu Excel |
| Nodemailer | Gửi email |
| AWS S3 SDK | Kết nối Cloudflare R2 |
| Google GenAI SDK | Tích hợp chatbot AI |

### Frontend

| Công nghệ | Vai trò |
| --- | --- |
| React 19 | Giao diện người dùng |
| TypeScript | Kiểu dữ liệu phía client |
| Vite | Dev server và build tool |
| React Router DOM 7 | Routing và bảo vệ màn hình |
| Zustand | Quản lý auth state |
| Tailwind CSS | Xây dựng UI |
| Axios | Gọi API |
| Recharts | Dashboard và thống kê |
| html5-qrcode | Quét QR bằng camera |
| qrcode.react | Sinh mã QR |
| Framer Motion | Hiệu ứng giao diện |
| Lucide React | Icon |

## Cấu Trúc Thư Mục

```text
qlsv/
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   |-- seed.ts
|   |   `-- migrations/
|   |-- src/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- types/
|   |   `-- utils/
|   |-- package.json
|   `-- tsconfig.json
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- constants/
|   |   |-- layout/
|   |   |-- pages/
|   |   |-- store/
|   |   |-- types/
|   |   `-- utils/
|   |-- package.json
|   |-- vite.config.ts
|   `-- .env.example
|
`-- README.md
```

## Hướng Dẫn Chạy Dự Án Từ Đầu

### 1. Điều kiện cần

- Node.js từ `20` đến dưới `25`
- npm
- PostgreSQL
- Git nếu muốn clone và đồng bộ source

Kiểm tra nhanh:

```bash
node -v
npm -v
```

### 2. Cài dependency

Tại thư mục gốc của dự án:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Chuẩn bị môi trường backend

Backend có thể đọc biến môi trường từ:

- `backend/.env`
- hoặc `.env` ở thư mục gốc dự án

Thực tế an toàn nhất là tạo file `backend/.env`.

## Biến Môi Trường Backend

Tạo file `backend/.env`:

```env
# Runtime
NODE_ENV=development
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public

# Auth
JWT_SECRET=replace_with_a_strong_secret_32_chars_or_more
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
COOKIE_DOMAIN=
ALLOW_QUERY_TOKEN_AUTH=false

# Cloudflare R2 - optional
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_ENDPOINT=
R2_REGION=auto
R2_EVIDENCE_PREFIX=evidence

# Email - optional
GMAIL_USER=
GMAIL_APP_PASSWORD=
MAIL_FROM=

# AI chatbot - optional
GEMINI_API_KEY=
GOOGLE_GENAI_API_KEY=
GEMINI_MODEL=gemma-4-31b-it
```

### Ghi chú backend quan trọng

- `DATABASE_URL` là bắt buộc. Nếu thiếu, backend sẽ không khởi động.
- `JWT_SECRET` nên cấu hình ngay cả ở local để phiên ổn định giữa các lần restart.
- Nếu bỏ trống `JWT_SECRET` trong development, backend sẽ tự sinh secret tạm thời; restart server sẽ làm các phiên cũ hết hiệu lực.
- `FRONTEND_ORIGIN` phải khớp origin frontend thật, ví dụ `http://localhost:5173`.
- Nếu frontend và backend khác domain khi deploy, thường cần:
  - `COOKIE_SAME_SITE=none`
  - `COOKIE_SECURE=true`
- Muốn dùng chức năng quên mật khẩu qua email, cần cấu hình Gmail SMTP.
- Muốn chatbot sinh câu trả lời bằng AI, cần cấu hình key Gemini/Google GenAI.

## Biến Môi Trường Frontend

Tạo file `frontend/.env` từ file mẫu:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Hoặc:

```bash
cp frontend/.env.example frontend/.env
```

Giá trị local khuyến nghị:

```env
VITE_API_URL=/api
VITE_API_TARGET=http://localhost:5000
VITE_DEV_ALLOWED_HOSTS=
VITE_LOGIN_BACKGROUND_IMAGE_URL=
VITE_LOGIN_LOGO_URL=/logo-qlsv.png
VITE_MAPS_QUERY_URL=https://www.google.com/maps?q=
```

### Ghi chú frontend quan trọng

- `VITE_API_URL=/api` là cấu hình đẹp nhất cho local vì tận dụng Vite proxy và giữ request đồng origin.
- `VITE_API_TARGET=http://localhost:5000` là nơi Vite dev server chuyển tiếp request.
- Không đặt secret thật vào file `.env` của frontend.
- Khi deploy frontend riêng domain, đặt:

```env
VITE_API_URL=https://your-backend.example.com/api
VITE_API_TARGET=
```

## Khởi Tạo Database

Sau khi đã có `DATABASE_URL`, chạy:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Dữ liệu seed mặc định

| Loại | Giá trị |
| --- | --- |
| Username admin mẫu | `admin` |
| Mật khẩu mẫu | `admin123` |
| Lớp mẫu | `CNCD2511` |
| MSSV mẫu | `CNCD2511016` |

### Lưu ý sau seed

- Đổi mật khẩu mặc định ngay sau lần đăng nhập đầu tiên.
- Nếu cần kiểm tra dữ liệu trực quan:

```bash
cd backend
npx prisma studio
```

- Nếu tài khoản `admin` chưa có role `ADMIN`, có thể cập nhật thủ công:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE username = 'admin';
```

## Chạy Local Development

Mở 2 terminal riêng.

### Terminal 1: chạy backend

```bash
cd backend
npm run dev
```

Kỳ vọng:

- Backend chạy ở `http://localhost:5000`
- Health check:

```text
GET http://localhost:5000/
```

Kết quả mong đợi:

```text
Student Management System API is running
```

### Terminal 2: chạy frontend

```bash
cd frontend
npm run dev
```

Kỳ vọng:

- Frontend chạy ở `http://localhost:5173`
- Trang đăng nhập:

```text
http://localhost:5173/login
```

## Luồng Kiểm Tra Sau Khi Chạy

Sau khi cả hai service đã lên, nên kiểm tra theo thứ tự này:

1. Mở `http://localhost:5173/login`.
2. Đăng nhập bằng `admin / admin123`.
3. Kiểm tra backend có set cookie thành công.
4. Vào các màn hình quản trị như:
   - `/students`
   - `/classes`
   - `/semesters`
   - `/accounts`
5. Tạo hoặc kiểm tra học kỳ hoạt động.
6. Kiểm tra màn hình điểm danh QR và điểm rèn luyện.
7. Nếu có cấu hình email, thử luồng quên mật khẩu.
8. Nếu có cấu hình AI, thử chatbot với các câu hỏi như:
   - "Điểm rèn luyện của tôi"
   - "Số buổi vắng của tôi"
   - "Thông tin cá nhân của tôi"

## Route Và API Chính

### Route frontend đáng chú ý

| Route | Vai trò | Mô tả |
| --- | --- | --- |
| `/login` | Công khai | Đăng nhập |
| `/` | Tất cả sau đăng nhập | Dashboard theo vai trò |
| `/students` | `ADMIN`, `BCH` | Quản lý sinh viên |
| `/classes` | `ADMIN`, `BCH` | Quản lý lớp |
| `/semesters` | `ADMIN`, `BCH` | Quản lý học kỳ |
| `/accounts` | `ADMIN`, `BCH` | Quản lý tài khoản |
| `/bch` | `ADMIN` | Quản lý ban cán sự |
| `/training` | Tất cả | Xem điểm rèn luyện |
| `/training/evaluation/self` | `STUDENT` | Sinh viên tự đánh giá DRL |
| `/training/approval` | `ADMIN`, `BCH` | Duyệt phiếu DRL |
| `/training/statistics` | `ADMIN`, `BCH` | Thống kê DRL |
| `/evidence/submit` | `STUDENT` | Nộp minh chứng |
| `/evidence/review` | `ADMIN`, `BCH` | Duyệt minh chứng |
| `/attendance` | Tất cả | Chuyên cần và điểm danh |
| `/attendance/scan` | Tất cả | Quét QR |
| `/attendance/manage/class` | `ADMIN`, `BCH` | Tạo phiên QR theo lớp |
| `/attendance/manage/activity` | `ADMIN`, `BCH` | Tạo phiên QR cho hoạt động |
| `/events` | `ADMIN`, `BCH` | Quản lý sự kiện |
| `/support` | `ADMIN` | Quản lý yêu cầu hỗ trợ |
| `/profile` | Tất cả | Hồ sơ cá nhân |
| `/dangky` | Công khai | Trang đăng ký sự kiện |

### Nhóm API backend

Backend mount API dưới prefix `/api`:

| Prefix | Chức năng |
| --- | --- |
| `/api/auth` | Đăng nhập, phiên, cập nhật hồ sơ, đổi mật khẩu, quên mật khẩu |
| `/api/students` | Sinh viên |
| `/api/classes` | Lớp học |
| `/api/semesters` | Học kỳ |
| `/api/training` | DRL, tự đánh giá, xét duyệt, minh chứng, thống kê |
| `/api/attendance` | Điểm danh, phiên QR, chuyên cần, export |
| `/api/bch` | Phân công BCH |
| `/api/events` | Sự kiện và đăng ký |
| `/api/support` | Yêu cầu hỗ trợ |
| `/api/chatbot` | Chatbot sinh viên |
| `/api/activity-logs` | Nhật ký hoạt động |

## Build Và Triển Khai

### Build backend

```bash
cd backend
npm run build
npm start
```

`npm run build` sẽ:

- chạy `prisma generate`
- biên dịch TypeScript vào `backend/dist`

### Build frontend

```bash
cd frontend
npm run build
npm run preview
```

Output build frontend nằm ở:

```text
frontend/dist
```

### Production checklist ngắn

- Đặt `NODE_ENV=production`
- Dùng `JWT_SECRET` mạnh, tối thiểu 32 ký tự
- Kiểm tra `FRONTEND_ORIGIN` đúng domain frontend
- Nếu frontend/backend khác domain:
  - `COOKIE_SAME_SITE=none`
  - `COOKIE_SECURE=true`
- Dùng HTTPS
- Chạy migration production:

```bash
cd backend
npx prisma migrate deploy
```

- Nếu dùng Cloudflare R2, cấu hình đủ biến R2 trước khi bật upload minh chứng thật.

## Bảo Mật Và Vận Hành

### Các lớp bảo vệ hiện có

- Hash mật khẩu bằng `bcryptjs`
- JWT lưu bằng cookie
- `CORS` whitelist theo `FRONTEND_ORIGIN`
- Security headers middleware
- Rate limit cho:
  - đăng nhập
  - yêu cầu quên mật khẩu
  - xác nhận đặt lại mật khẩu
  - gửi hỗ trợ công khai
- Ghi nhật ký hoạt động ở nhiều nghiệp vụ quan trọng

### Điểm cần biết để đọc repo chính xác

- Hệ thống có cookie CSRF token và helper liên quan.
- Tuy nhiên, middleware kiểm tra CSRF trong `backend/src/middleware/csrf.middleware.ts` hiện đang bypass hoàn toàn.
- Nói cách khác: trạng thái thực tế hiện tại đang dựa chủ yếu vào `CORS whitelist + JWT auth + cookie policy + security headers + rate limit`.
- Nếu muốn tăng cường bảo vệ CSRF trong tương lai, cần khôi phục logic kiểm tra thay vì chỉ để middleware `next()`.

### Khuyến nghị vận hành

- Không commit `.env`, API key, mật khẩu, `DATABASE_URL`, `JWT_SECRET`
- Đổi tài khoản/mật khẩu seed sau khi setup
- Dùng PostgreSQL riêng cho production
- Tách bucket lưu minh chứng nếu triển khai môi trường thật
- Kiểm tra lại quyền `ADMIN/BCH/STUDENT` sau khi import dữ liệu

## Lỗi Thường Gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Backend báo thiếu `DATABASE_URL` | Tạo `backend/.env` hoặc `.env` ở gốc và cấu hình đúng biến này. |
| Frontend không gọi được API local | Kiểm tra `VITE_API_URL=/api` và `VITE_API_TARGET=http://localhost:5000`. |
| Đăng nhập xong nhưng lại quay về `/login` | Kiểm tra cookie, `FRONTEND_ORIGIN`, `COOKIE_SAME_SITE`, `COOKIE_SECURE`. |
| Bị lỗi CORS | Kiểm tra `FRONTEND_ORIGIN` có đúng origin frontend đang mở hay không. |
| Prisma migrate lỗi | Đảm bảo PostgreSQL đang chạy, user/password đúng, DB tồn tại. |
| Quên mật khẩu không gửi mail | Kiểm tra `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_FROM`. |
| Chatbot không trả lời bằng AI | Kiểm tra `GEMINI_API_KEY` hoặc `GOOGLE_GENAI_API_KEY`. Nếu không có key, chatbot sẽ fallback tri thức cục bộ. |
| QR scanner không mở được camera | Trình duyệt cần quyền camera; nên dùng `localhost` hoặc HTTPS. |
| Điểm danh vị trí bị từ chối | Kiểm tra GPS, tọa độ phiên, bán kính check-in và quyền location trên thiết bị. |
| Upload minh chứng lỗi | Kiểm tra cấu hình R2 nếu đang dùng storage từ xa. |

## Tác Giả

### Nhóm phát triển

Theo thông tin hiện có trong repo, dự án được phát triển bởi:

- **Lê Khánh Duy**
- **Phạm Thái Minh Đăng**

Thông tin liên hệ đang được khai báo trong README/repo:

- Email: `toi05022020@gmail.com`

### Giới thiệu tác giả và định hướng dự án

QLSV cho thấy định hướng xây dựng một sản phẩm không chỉ dừng ở giao diện CRUD cơ bản, mà đi vào các bài toán vận hành thật trong môi trường sinh viên:

- quản lý lớp và sinh viên theo cấu trúc rõ ràng
- tự động hóa quy trình duyệt điểm rèn luyện
- số hóa hoạt động điểm danh và xác minh tham gia
- giảm thao tác thủ công sau hoạt động
- tạo kênh hỗ trợ và tương tác trực tiếp cho sinh viên

Điểm đáng chú ý là dự án không phát triển rời rạc từng module, mà có tư duy gắn kết nghiệp vụ giữa dữ liệu, vai trò người dùng và thao tác thực tế. Đây là dấu hiệu của một đồ án hoặc sản phẩm được làm với mục tiêu ứng dụng thật, chứ không chỉ để trình diễn công nghệ.

## Bản Quyền

© 2026 Lê Khánh Duy. All Rights Reserved.

Toàn bộ mã nguồn, giao diện, cấu trúc dữ liệu và logic nghiệp vụ thuộc quyền sở hữu của tác giả theo tuyên bố hiện có trong dự án. Việc sao chép, chỉnh sửa, phân phối lại hoặc sử dụng cho mục đích thương mại nên có sự đồng ý phù hợp từ chủ sở hữu.
