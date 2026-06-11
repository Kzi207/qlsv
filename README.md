# QLSV | Hệ Thống Quản Lý Sinh Viên

<div align="center">
  <img src="./frontend/public/logo-qlsv-clean.png" alt="QLSV Logo" width="150" />
  <h3>Nền tảng quản lý sinh viên, điểm rèn luyện, điểm danh QR và vận hành lớp học bằng TypeScript full-stack</h3>
  <p>
    <img src="https://img.shields.io/badge/Node.js-%3E%3D20%20%3C25-2F855A?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-6.x-2563EB?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-19-0EA5E9?style=for-the-badge&logo=react&logoColor=06263A" alt="React" />
    <img src="https://img.shields.io/badge/Express-5-111827?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Prisma-6-334155?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Ready-0F766E?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
</div>

> QLSV là dự án web quản lý sinh viên được xây dựng để số hóa các nghiệp vụ thực tế như quản lý lớp, học kỳ, tài khoản, điểm rèn luyện, minh chứng, điểm danh QR, sự kiện và hỗ trợ sinh viên trong cùng một hệ thống.

## Mục Lục

- [1. Giới Thiệu Dự Án](#1-giới-thiệu-dự-án)
- [2. Giới Thiệu Tác Giả](#2-giới-thiệu-tác-giả)
- [3. Logic Dự Án Và Cách Hệ Thống Hoạt Động](#3-logic-dự-án-và-cách-hệ-thống-hoạt-động)
- [4. Tính Năng Chính](#4-tính-năng-chính)
- [5. Công Nghệ Sử Dụng](#5-công-nghệ-sử-dụng)
- [6. Kiến Trúc Hệ Thống](#6-kiến-trúc-hệ-thống)
- [7. Cấu Trúc Thư Mục](#7-cấu-trúc-thư-mục)
- [8. Hướng Dẫn Chạy Local](#8-hướng-dẫn-chạy-local)
- [9. API Backend](#9-api-backend)
- [10. Cách Deploy Server](#10-cách-deploy-server)
- [11. Lỗi Thường Gặp](#11-lỗi-thường-gặp)
- [12. Chính Sách Bảo Mật](#12-chính-sách-bảo-mật)
- [13. Điều Khoản Sử Dụng](#13-điều-khoản-sử-dụng)
- [14. Thông Tin Tác Giả](#14-thông-tin-tác-giả)
- [15. Bản Quyền](#15-bản-quyền)

## 1. Giới Thiệu Dự Án

QLSV được xây dựng cho bối cảnh quản lý sinh viên theo lớp và học kỳ, nơi một đơn vị đào tạo cần tập trung nhiều quy trình vận hành vào một hệ thống duy nhất thay vì xử lý bằng file Excel, biểu mẫu rời rạc hoặc nhóm chat.

Hệ thống này hướng tới các nhu cầu thực tế:

- Quản lý sinh viên, tài khoản, lớp học và học kỳ.
- Tổ chức tự đánh giá điểm rèn luyện theo đợt.
- Thu thập, xét duyệt và lưu minh chứng cho từng tiêu chí.
- Điểm danh theo mã QR với thông tin vị trí, thời gian và thiết bị.
- Theo dõi hoạt động, sự kiện, yêu cầu hỗ trợ và lịch sử thao tác.
- Hỗ trợ sinh viên bằng chatbot nội bộ.

Điểm mạnh của dự án là không làm từng chức năng riêng lẻ, mà liên kết nghiệp vụ giữa chúng. Ví dụ: một hoạt động có thể tạo phiên điểm danh QR, và phiên điểm danh đó có thể cộng điểm trực tiếp vào tiêu chí rèn luyện nếu được cấu hình phù hợp.

## 2. Giới Thiệu Tác Giả

Dự án hiện thể hiện thông tin tác giả và nhóm phát triển gồm:

- **Lê Khánh Duy**
- **Phạm Thái Minh Đăng**

QLSV cho thấy định hướng phát triển của nhóm theo hướng làm sản phẩm có giá trị ứng dụng thật, không chỉ là một bài demo giao diện. Tư duy thể hiện khá rõ ở cách nhóm tổ chức dữ liệu, phân quyền người dùng, liên kết điểm danh với điểm rèn luyện, cũng như xây dựng luồng hỗ trợ và ghi log để phục vụ vận hành lâu dài.

## 3. Logic Dự Án Và Cách Hệ Thống Hoạt Động

### 3.1. Phân quyền người dùng

Hệ thống chia ba vai trò chính:

- `ADMIN`: quản trị toàn hệ thống.
- `BCH`: ban cán sự hoặc người phụ trách lớp/phạm vi được giao.
- `STUDENT`: sinh viên cuối.

Mỗi vai trò chỉ được truy cập đúng màn hình và đúng API tương ứng. Điều này giúp giảm rủi ro sửa sai dữ liệu và làm rõ trách nhiệm vận hành.

### 3.2. Luồng dữ liệu chính

1. `ADMIN` tạo dữ liệu nền như lớp, sinh viên, tài khoản, học kỳ.
2. `ADMIN` hoặc `BCH` mở đợt chấm điểm rèn luyện.
3. `STUDENT` tự đánh giá, nộp minh chứng, theo dõi trạng thái duyệt.
4. `ADMIN` hoặc `BCH` xem danh sách phiếu, duyệt hoặc từ chối minh chứng, điều chỉnh điểm.
5. `ADMIN` hoặc `BCH` tạo phiên điểm danh QR theo lớp hoặc hoạt động.
6. `STUDENT` quét QR để ghi nhận tham gia.
7. Nếu phiên QR có gắn tiêu chí DRL, hệ thống tự cộng điểm vào chi tiết tiêu chí liên quan.
8. Tất cả thao tác quan trọng được ghi vào `ActivityLog` để audit và truy vết.

### 3.3. Logic điểm rèn luyện

Điểm rèn luyện không chỉ lưu một con số tổng, mà lưu cả chi tiết theo từng tiêu chí trong trường `details`.

Mỗi phiếu có thể chứa:

- điểm tự khai của sinh viên
- hoạt động được cộng từ QR attendance
- minh chứng tự nộp
- điểm được duyệt
- ghi chú của admin/BCH
- trạng thái `PENDING`, `APPROVED`, `REJECTED`

Khi một minh chứng hoặc hoạt động được duyệt, hệ thống tính lại tổng điểm theo từng nhóm tiêu chí rồi cập nhật tổng phiếu.

### 3.4. Logic điểm danh QR

Mỗi phiên điểm danh có:

- tiêu đề
- loại phiên `QR_CLASS` hoặc `ACTIVITY`
- lớp áp dụng
- tọa độ, bán kính check-in
- thời gian mở và đóng check-in
- token QR riêng
- tùy chọn liên kết với tiêu chí điểm rèn luyện

Khi sinh viên quét mã, hệ thống có thể kiểm tra:

- phiên có đang hoạt động không
- vị trí có nằm trong bán kính cho phép không
- sinh viên đã điểm danh chưa
- dữ liệu nền điểm danh trước đó của sinh viên

### 3.5. Logic hỗ trợ và chatbot

Hệ thống có trang hỗ trợ công khai tại `thongtinlienhe.html`, cho phép gửi yêu cầu mà không cần đăng nhập. Các yêu cầu này được đẩy vào dashboard quản trị để xử lý theo trạng thái `NEW`, `IN_PROGRESS`, `RESOLVED`.

Chatbot nội bộ ưu tiên kiến thức cục bộ trước. Nếu có cấu hình Gemini/Google GenAI, chatbot có thể sinh phản hồi tự nhiên hơn, nhưng vẫn bị giới hạn bởi các luật an toàn và không trả lời các yêu cầu nhạy cảm như token, mật khẩu, bypass bảo mật hay sửa điểm trái phép.

## 4. Tính Năng Chính

- Đăng nhập, đổi mật khẩu, quên mật khẩu qua email.
- Quản lý sinh viên, lớp học, học kỳ và tài khoản.
- Gán BCH theo lớp hoặc theo khoảng số thứ tự sinh viên.
- Tự đánh giá điểm rèn luyện theo học kỳ.
- Nộp và duyệt minh chứng cho từng tiêu chí.
- Thống kê tình trạng nộp phiếu DRL theo lớp.
- Tạo phiên điểm danh QR theo lớp hoặc hoạt động.
- Điểm danh có kiểm tra thời gian, vị trí, IP, thiết bị.
- Tự động cộng điểm hoạt động vào DRL nếu phiên có cấu hình.
- Quản lý sự kiện và trang đăng ký công khai `/dangky`.
- Tiếp nhận yêu cầu hỗ trợ công khai.
- Chatbot hỗ trợ sinh viên.
- Nhật ký hoạt động để truy vết thao tác.
- Export dữ liệu Excel cho nhiều nghiệp vụ.

## 5. Công Nghệ Sử Dụng

### Backend

| Công nghệ | Vai trò |
| --- | --- |
| Node.js `>=20 <25` | Runtime backend |
| Express 5 | Xây dựng REST API |
| TypeScript | Kiểu dữ liệu, maintainability |
| Prisma 6 | ORM, schema, migrate, seed |
| PostgreSQL | Cơ sở dữ liệu chính |
| bcryptjs | Hash mật khẩu |
| jsonwebtoken | JWT auth |
| cookie-parser | Xử lý cookie |
| Multer | Upload file |
| Sharp | Xử lý ảnh minh chứng |
| ExcelJS | Xuất Excel |
| Nodemailer | Gửi email |
| AWS S3 SDK | Kết nối Cloudflare R2 |
| Google GenAI SDK | Chatbot AI tùy chọn |

### Frontend

| Công nghệ | Vai trò |
| --- | --- |
| React 19 | Xây dựng giao diện |
| TypeScript | Kiểu dữ liệu client |
| Vite | Dev server và build |
| React Router DOM 7 | Điều hướng màn hình |
| Zustand | Lưu auth state |
| Tailwind CSS | UI styling |
| Axios | Gọi API |
| Recharts | Biểu đồ thống kê |
| html5-qrcode | Quét QR |
| qrcode.react | Tạo QR |
| Framer Motion | Motion UI |
| Lucide React | Icon |

## 6. Kiến Trúc Hệ Thống

```text
Frontend React/Vite
        |
        | Axios / cookie auth
        v
Backend Express API
        |
        | Prisma ORM
        v
PostgreSQL

Tùy chọn mở rộng:
- Cloudflare R2 cho file minh chứng
- Gmail SMTP cho email
- Google GenAI cho chatbot
```

## 7. Cấu Trúc Thư Mục

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
|   `-- package.json
|
|-- frontend/
|   |-- public/
|   |   |-- chinhsachbaomat.html
|   |   |-- dieukhoansudung.html
|   |   `-- thongtinlienhe.html
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- layout/
|   |   |-- pages/
|   |   |-- store/
|   |   `-- utils/
|   |-- vercel.json
|   `-- package.json
|
`-- README.md
```

## 8. Hướng Dẫn Chạy Local

### 8.1. Yêu cầu

- Node.js từ `20` đến dưới `25`
- npm
- PostgreSQL

### 8.2. Cài dependency

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 8.3. Tạo `backend/.env`

```env
NODE_ENV=development
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public
JWT_SECRET=replace_with_a_strong_secret_32_chars_or_more
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
COOKIE_DOMAIN=
ALLOW_QUERY_TOKEN_AUTH=false

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_ENDPOINT=
R2_REGION=auto
R2_EVIDENCE_PREFIX=evidence

GMAIL_USER=
GMAIL_APP_PASSWORD=
MAIL_FROM=

GEMINI_API_KEY=
GOOGLE_GENAI_API_KEY=
GEMINI_MODEL=gemma-4-31b-it
```

### 8.4. Tạo `frontend/.env`

```env
VITE_API_URL=/api
VITE_API_TARGET=http://localhost:5000
VITE_DEV_ALLOWED_HOSTS=
VITE_LOGIN_BACKGROUND_IMAGE_URL=
VITE_LOGIN_LOGO_URL=/logo-qlsv.png
VITE_MAPS_QUERY_URL=https://www.google.com/maps?q=
```

### 8.5. Khởi tạo database

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 8.6. Chạy dự án

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

### 8.7. Tài khoản seed mặc định

- Username: `admin`
- Password: `admin123`

Nếu cần, mở Prisma Studio:

```bash
cd backend
npx prisma studio
```

## 9. API Backend

Backend mount toàn bộ API dưới prefix `/api`.

### 9.1. Nhóm API chính

| Prefix | Chức năng |
| --- | --- |
| `/api/auth` | Đăng nhập, lấy phiên, cập nhật hồ sơ, đổi mật khẩu, quên mật khẩu |
| `/api/students` | Quản lý sinh viên |
| `/api/classes` | Quản lý lớp |
| `/api/semesters` | Quản lý học kỳ |
| `/api/training` | Điểm rèn luyện, minh chứng, thống kê |
| `/api/attendance` | Điểm danh, phiên QR, chuyên cần, export |
| `/api/bch` | Phân công BCH |
| `/api/events` | Sự kiện và đăng ký sự kiện |
| `/api/support` | Yêu cầu hỗ trợ |
| `/api/chatbot` | Chatbot sinh viên |
| `/api/activity-logs` | Nhật ký hoạt động |

### 9.2. Một số endpoint quan trọng

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Đăng nhập |
| `GET` | `/api/auth/me` | Lấy thông tin phiên hiện tại |
| `PATCH` | `/api/auth/profile` | Cập nhật hồ sơ |
| `PATCH` | `/api/auth/change-password` | Đổi mật khẩu |
| `POST` | `/api/auth/forgot-password/request` | Gửi mã quên mật khẩu |
| `POST` | `/api/auth/forgot-password/confirm` | Xác nhận đặt lại mật khẩu |
| `GET` | `/api/training` | Lấy danh sách phiếu DRL |
| `POST` | `/api/training` | Nộp hoặc cập nhật phiếu DRL |
| `POST` | `/api/attendance/sessions` | Tạo phiên điểm danh QR |
| `POST` | `/api/attendance/check-in` | Sinh viên check-in QR |
| `POST` | `/api/support/public` | Gửi yêu cầu hỗ trợ công khai |
| `POST` | `/api/chatbot/message` | Gửi câu hỏi cho chatbot |

### 9.3. Health check

```text
GET /
```

Kết quả mong đợi:

```text
Student Management System API is running
```

## 10. Cách Deploy Server

Phù hợp nhất với repo này là tách:

- **Frontend** deploy trên **Vercel**
- **Backend** chạy trên VPS, máy Windows/Linux, hoặc máy nội bộ rồi public qua **Cloudflared Tunnel**

### 10.1. Deploy frontend bằng Vercel

Repo đã có sẵn file [frontend/vercel.json](./frontend/vercel.json) cho Vite SPA.

#### Cách làm

1. Push code lên GitHub.
2. Vào Vercel, import repository.
3. Chọn **Root Directory** là `frontend`.
4. Vercel sẽ dùng:
   - `installCommand`: `npm install`
   - `buildCommand`: `npm run build`
   - `outputDirectory`: `dist`
5. Cấu hình biến môi trường frontend:

```env
VITE_API_URL=https://api.tenmiencuaban.com/api
VITE_API_TARGET=
VITE_LOGIN_LOGO_URL=/logo-qlsv.png
VITE_MAPS_QUERY_URL=https://www.google.com/maps?q=
```

6. Deploy.

#### Lưu ý

- Nếu frontend gọi backend khác domain, backend phải cấu hình `FRONTEND_ORIGIN` đúng domain Vercel.
- Ví dụ:

```env
FRONTEND_ORIGIN=https://qlsv-your-project.vercel.app
COOKIE_SAME_SITE=none
COOKIE_SECURE=true
```

### 10.2. Deploy backend trên server riêng

Backend nên chạy trên:

- VPS Linux
- máy Windows luôn bật
- mini PC / máy nội bộ
- server nội bộ trường/lớp

#### Các bước cơ bản

1. Clone repo.
2. Vào `backend`.
3. Tạo `.env` production.
4. Cài dependency:

```bash
npm install
```

5. Chạy migrate:

```bash
npx prisma migrate deploy
```

6. Build:

```bash
npm run build
```

7. Start:

```bash
npm start
```

#### Biến môi trường backend production gợi ý

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public
JWT_SECRET=your_super_strong_secret_32_chars_or_more
FRONTEND_ORIGIN=https://your-frontend.vercel.app
COOKIE_SAME_SITE=none
COOKIE_SECURE=true
COOKIE_DOMAIN=
ALLOW_QUERY_TOKEN_AUTH=false
```

### 10.3. Public backend bằng Cloudflared Tunnel

Cloudflared Tunnel rất hợp nếu:

- server backend không có public IP
- bạn không muốn mở port trực tiếp ra Internet
- bạn muốn đưa backend nội bộ lên domain HTTPS ổn định

#### Luồng triển khai

1. Cài `cloudflared` trên máy chạy backend.
2. Đăng nhập Cloudflare:

```bash
cloudflared tunnel login
```

3. Tạo tunnel:

```bash
cloudflared tunnel create qlsv-backend
```

4. Tạo DNS route:

```bash
cloudflared tunnel route dns qlsv-backend api.tenmiencuaban.com
```

5. Tạo file cấu hình `config.yml`:

```yaml
tunnel: qlsv-backend
credentials-file: /path/to/your/credentials.json

ingress:
  - hostname: api.tenmiencuaban.com
    service: http://localhost:5000
  - service: http_status:404
```

6. Chạy tunnel:

```bash
cloudflared tunnel run qlsv-backend
```

#### Cấu hình cần đồng bộ

Frontend:

```env
VITE_API_URL=https://api.tenmiencuaban.com/api
```

Backend:

```env
FRONTEND_ORIGIN=https://your-frontend.vercel.app
COOKIE_SAME_SITE=none
COOKIE_SECURE=true
```

#### Gợi ý vận hành ổn định

- Linux: chạy backend bằng `pm2` hoặc `systemd`
- Windows: chạy backend bằng PM2 hoặc NSSM
- Cloudflared cũng nên chạy như service nền

### 10.4. Kịch bản deploy khuyến nghị

**Phương án 1: ổn định và dễ dùng**

- Frontend: Vercel
- Backend: VPS hoặc máy nội bộ
- Public backend: Cloudflared Tunnel
- Database: PostgreSQL riêng

**Phương án 2: nội bộ nhanh**

- Frontend: Vercel
- Backend: máy local luôn bật
- Public backend: Cloudflared Tunnel

**Phương án 3: tự host toàn bộ**

- Frontend build static
- Backend Node.js
- Reverse proxy bằng Nginx/Caddy
- Không dùng Vercel

## 11. Lỗi Thường Gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Backend báo thiếu `DATABASE_URL` | Tạo `backend/.env` và cấu hình đúng chuỗi kết nối PostgreSQL. |
| Đăng nhập xong lại quay về `/login` | Kiểm tra `FRONTEND_ORIGIN`, cookie settings, `COOKIE_SAME_SITE`, `COOKIE_SECURE`. |
| Frontend bị lỗi CORS | Kiểm tra `FRONTEND_ORIGIN` có đúng domain frontend thật không. |
| Vite local không proxy API | Kiểm tra `VITE_API_URL=/api` và `VITE_API_TARGET=http://localhost:5000`. |
| Prisma migrate lỗi | Kiểm tra PostgreSQL đang chạy, user/password đúng, DB đã tồn tại. |
| Không gửi được email quên mật khẩu | Kiểm tra `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_FROM`. |
| Chatbot không trả lời bằng AI | Kiểm tra `GEMINI_API_KEY` hoặc `GOOGLE_GENAI_API_KEY`. |
| Quét QR không bật camera | Trình duyệt chưa cấp quyền camera hoặc môi trường không phải `localhost`/`https`. |
| Điểm danh bị báo sai vị trí | Kiểm tra GPS thiết bị, tọa độ phiên, bán kính check-in. |
| Frontend trên Vercel gọi backend không được | Kiểm tra `VITE_API_URL`, tunnel Cloudflared và `FRONTEND_ORIGIN` của backend. |
| Cookie không hoạt động khi frontend/backend khác domain | Bật `COOKIE_SAME_SITE=none` và `COOKIE_SECURE=true`, đồng thời dùng HTTPS. |

## 12. Chính Sách Bảo Mật

Tài liệu chính sách bảo mật giao diện công khai đã có tại:

- [frontend/public/chinhsachbaomat.html](./frontend/public/chinhsachbaomat.html)

Tóm tắt chính sách bảo mật của hệ thống:

- Hệ thống thu thập dữ liệu cần thiết cho quản lý sinh viên, học tập, điểm danh, minh chứng và vận hành.
- Dữ liệu được truy cập theo phân quyền người dùng.
- Không nên chia sẻ dữ liệu cá nhân cho bên thứ ba nếu không có căn cứ phù hợp.
- Hệ thống có các lớp bảo vệ như JWT, cookie auth, CORS whitelist, security headers, rate limit và activity log.
- Không commit `.env`, secret, token, database URL hoặc thông tin nhạy cảm lên repository.

### Lưu ý kỹ thuật thực tế

Repo hiện có middleware CSRF nhưng đang để bypass trong mã nguồn hiện tại. Vì vậy khi triển khai production, nên hiểu rằng lớp bảo vệ chính đang là:

- `CORS whitelist`
- `cookie policy`
- `JWT auth`
- `security headers`
- `rate limit`

Nếu muốn nâng mức an toàn, nên khôi phục hoặc triển khai lại kiểm tra CSRF đúng chuẩn trước khi đưa vào môi trường lớn.

## 13. Điều Khoản Sử Dụng

Tài liệu điều khoản sử dụng giao diện công khai đã có tại:

- [frontend/public/dieukhoansudung.html](./frontend/public/dieukhoansudung.html)

Tóm tắt điều khoản sử dụng:

- Người dùng phải tự bảo vệ tài khoản và mật khẩu.
- Không được chia sẻ tài khoản trái phép.
- Không được khai thác lỗ hổng, sửa dữ liệu ngoài quyền hạn hoặc dùng hệ thống cho mục đích trái pháp luật.
- Tài khoản vi phạm có thể bị giới hạn hoặc khóa để bảo vệ dữ liệu và vận hành.

## 14. Thông Tin Tác Giả

### Nhóm phát triển

- **Lê Khánh Duy**
- **Phạm Thái Minh Đăng**

### Liên hệ

- Email hiện được khai báo trong repo: `toi05022020@gmail.com`
- Trang hỗ trợ công khai: [frontend/public/thongtinlienhe.html](./frontend/public/thongtinlienhe.html)

## 15. Bản Quyền

© 2026 Lê Khánh Duy. All Rights Reserved.

Toàn bộ mã nguồn, giao diện, cấu trúc dữ liệu, mô hình nghiệp vụ và logic xử lý trong dự án thuộc quyền sở hữu của tác giả theo tuyên bố hiện có trong repository. Việc sao chép, chỉnh sửa, phân phối lại hoặc sử dụng cho mục đích thương mại nên có sự đồng ý phù hợp từ chủ sở hữu.
