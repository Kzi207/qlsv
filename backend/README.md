# QLSV Backend

REST API backend cho hệ thống quản lý sinh viên. Được xây dựng bằng Express.js, TypeScript và Prisma ORM với database PostgreSQL.

## 🚀 Công Nghệ Sử Dụng

| Công nghệ | Phiên bản | Mục đích |
| --- | --- | --- |
| **Node.js** | `>=20 <25` | Runtime |
| **Express** | 5.x | Web framework |
| **TypeScript** | 6.x | Type safety |
| **Prisma** | 6.x | ORM & Migration |
| **PostgreSQL** | - | Database |
| **JWT + Cookie** | - | Authentication |
| **Multer + Sharp** | - | File/Image upload |
| **ExcelJS** | - | Excel processing |
| **Nodemailer** | - | Email service |
| **AWS S3 SDK** | - | Cloudflare R2 integration |
| **Google GenAI** | - | Chatbot AI (optional) |

## 📁 Cấu Trúc Thư Mục

```
backend/
├── src/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Express app setup
│   ├── controllers/             # Request handlers
│   ├── routes/                  # API routes
│   ├── middleware/              # Custom middleware
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Helper functions
│   ├── migrate-*.ts             # Migration scripts
│   └── scratch/                 # Test files
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Database seeding
│   ├── migrations/              # Database migrations
│   └── cleanup-*.ts             # Data cleanup scripts
├── dist/                        # Compiled JS (build output)
├── .env.example                 # Environment template
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript config
```

## 🛠️ Setup & Installation

### Yêu cầu
- **Node.js**: >=20 <25
- **PostgreSQL**: Cấu hình sẵn hoặc container
- **npm** hoặc **yarn**

### Bước 1: Cài đặt Dependencies

```bash
cd backend
npm install
```

### Bước 2: Cấu hình Environment

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

**Cấu hình chính**:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/qlsv"

# Server
PORT=5000
NODE_ENV=development

# JWT & Security
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Tùy chọn: Gmail SMTP
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password

# Tùy chọn: Cloudflare R2
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
R2_BUCKET_NAME=your_bucket

# Tùy chọn: Google GenAI Chatbot
GOOGLE_GENAI_API_KEY=your_gemini_key
```

### Bước 3: Khởi tạo Database

```bash

# Chạy migration
npm run prisma:migrate

# Seed dữ liệu mẫu (nếu cần)
npm run prisma:seed
```

## 🏃 Chạy Dự Án

### Development Mode
```bash
npm run dev
```
- Server chạy ở `http://localhost:5000` (hoặc port trong `.env`)
- Auto-reload khi thay đổi code
- TypeScript được transpile tự động

### Build Production
```bash
npm run build
```
- Tạo thư mục `dist/` chứa JavaScript đã biên dịch

### Chạy Production
```bash
npm start
```
- Chạy từ file `dist/index.js`

## 📚 API Endpoints

### Xác Thực
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Sinh Viên
- `GET /api/students` - Danh sách
- `POST /api/students` - Tạo mới
- `GET /api/students/:id` - Chi tiết
- `PUT /api/students/:id` - Cập nhật
- `DELETE /api/students/:id` - Xóa

### Lớp Học
- `GET /api/classes` - Danh sách lớp
- `POST /api/classes` - Tạo lớp
- `GET /api/classes/:id` - Chi tiết lớp
- `PUT /api/classes/:id` - Cập nhật lớp
- `DELETE /api/classes/:id` - Xóa lớp

### Học Kỳ
- `GET /api/semesters` - Danh sách học kỳ
- `POST /api/semesters` - Tạo học kỳ
- `PUT /api/semesters/:id` - Cập nhật

### Điểm Rèn Luyện & Minh Chứng
- `GET /api/training` - Danh sách điểm rèn luyện
- `POST /api/training` - Nộp tự đánh giá
- `GET /api/training/:id/evidence` - Xem minh chứng

### Điểm Danh QR
- `POST /api/attendance/session` - Tạo phiên
- `POST /api/attendance/check-in` - Quét QR
- `GET /api/attendance/session/:id` - Chi tiết phiên

### Sự Kiện
- `GET /api/events` - Danh sách sự kiện
- `POST /api/events` - Tạo sự kiện
- `POST /api/events/:id/register` - Đăng ký (công khai)

### Nhật Ký Hoạt Động
- `GET /api/activity-log` - Lịch sử theo dõi

### Hỗ Trợ
- `GET /api/support` - Danh sách yêu cầu
- `POST /api/support` - Tạo yêu cầu mới
- `PUT /api/support/:id` - Trả lời/cập nhật

**Chi tiết đầy đủ**: Xem file route tương ứng trong `src/routes/`

## 🔐 Bảo Mật

### Xác Thực
- **JWT**: Token lưu trong HTTP-only cookie
- **CSRF Protection**: CSRF token cho mỗi request thay đổi dữ liệu
- **Password Hashing**: bcryptjs với salt rounds

### Middleware
- `auth.middleware.ts` - Kiểm tra JWT & phân quyền
- `csrf.middleware.ts` - Xác minh CSRF token
- `rate-limit.middleware.ts` - Giới hạn request
- `security-headers.middleware.ts` - Security headers (CORS, X-Frame, etc.)

### Best Practices
- Environment variables cho secrets
- HTTPS trên production
- Database connection pool
- Input validation
- Prepared statements (Prisma)

## 📊 Database Schema

Xem chi tiết tại `prisma/schema.prisma`:
- **Users** - Tài khoản (admin, BCH, sinh viên)
- **Students** - Thông tin sinh viên
- **Classes** - Lớp học
- **Semesters** - Học kỳ
- **TrainingEvaluations** - Điểm rèn luyện
- **Evidence** - Minh chứng
- **AttendanceSessions** - Phiên điểm danh
- **Attendance** - Chi tiết điểm danh
- **Events** - Sự kiện
- **EventRegistrations** - Đăng ký sự kiện
- **SupportRequests** - Yêu cầu hỗ trợ
- **ActivityLogs** - Nhật ký hoạt động

## 🔄 Database Migration

### Tạo migration mới
```bash
npm run prisma:migrate
# Nhập tên migration
```

### Xem migrations
```bash
ls -la prisma/migrations/
```

### Reset database (⚠️ Xóa tất cả data)
```bash
npx prisma migrate reset
```

## 🎯 Các Script Tiện Ích

### Migration Data
```bash
# Di chuyển dữ liệu lớp học
npx ts-node src/migrate-classes.ts

# Di chuyển dữ liệu học kỳ
npx ts-node src/migrate-semesters.ts
```

### Cleanup
```bash
# Xóa duplicate
npx ts-node prisma/cleanup-duplicates.ts

# Xóa tất cả duplicate
npx ts-node prisma/cleanup-all-duplicates.ts
```

### Load Test Nhanh
```bash
# Chạy test tải theo domain mặc định https://be.khanhduy.id.vn/
python scratch/load_tester.py --start-rps 5 --step-rps 5 --max-rps 100 --duration-per-step 5

# Test một endpoint cụ thể
python scratch/load_tester.py --url https://be.khanhduy.id.vn/api/auth/login --method POST --json '{"email":"a@b.com","password":"123456"}'
```

Script sẽ in latency từng mức tải trên console và tự dừng khi phản hồi chậm hoặc bắt đầu lỗi/nghẽn.

## 📝 Environment Variables Đầy Đủ

```env
# Core
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/qlsv

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=7d

# CORS & Security
CORS_ORIGIN=http://localhost:5173
CSRF_TOKEN_LENGTH=64

# Email (For notifications)
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=app_specific_password

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# Cloudflare R2 (Optional)
R2_ENABLED=false
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_ENDPOINT=https://abc.r2.cloudflarestorage.com
R2_BUCKET_NAME=qlsv-bucket
R2_PUBLIC_URL=https://qlsv.example.com

# Google GenAI Chatbot (Optional)
GEMINI_ENABLED=false
GOOGLE_GENAI_API_KEY=your_key
```

## 🐛 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
| --- | --- | --- |
| `Port already in use` | Port đang được sử dụng | Đổi PORT trong `.env` |
| `Database connection failed` | Connection string sai | Kiểm tra DATABASE_URL & PostgreSQL status |
| `Prisma client not generated` | Chưa chạy generate | Chạy `npm run prisma:generate` |
| `JWT token invalid` | Secret key thay đổi | Đồng bộ JWT_SECRET giữa các instance |
| `CSRF token missing` | Request không có token | Gửi kèm header `X-CSRF-Token` |

## 📦 Build & Deploy

### Build Docker Image
```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY prisma ./prisma

EXPOSE 5000
CMD ["npm", "start"]
```

### Environment trên Production
```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/qlsv_prod
CORS_ORIGIN=https://yourdomain.com
```

## 👥 Vai Trò & Quyền

| Vai trò | Quyền |
| --- | --- |
| **ADMIN** | Toàn quyền, quản lý tất cả entities |
| **BCH** | Quản lý lớp được phân công, duyệt điểm rèn luyện/minh chứng |
| **STUDENT** | Xem dữ liệu cá nhân, nộp minh chứng, tự đánh giá |

Kiểm tra quyền tại `src/middleware/auth.middleware.ts`

## 📞 Support & Issues

- Để lại issue trên repository
- Kiểm tra `Lỗi thường gặp` trong README chính
- Xem log trong `backend/dist/` hoặc console

## 📄 License

ISC

---

**Phát triển**: QLSV Team | **Cập nhật**: June 2026
