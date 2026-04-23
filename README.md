# 🎓 Hệ thống Quản trị Sinh viên Thông minh & Đánh giá Điểm rèn luyện Toàn diện

![Version](https://img.shields.io/badge/version-2.0.0--stable-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-Copyrighted-red?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

**Hệ thống Quản lý Sinh viên (QLSV)** là giải pháp phần mềm cấp doanh nghiệp được thiết kế để chuẩn hóa và tự động hóa quy trình quản lý học thuật, đánh giá rèn luyện và theo dõi chuyên cần. Dự án tập trung vào trải nghiệm người dùng cao cấp (Premium UX), bảo mật dữ liệu và hiệu năng tối ưu trên quy mô lớn.

---

## 💎 Điểm nổi bật về công nghệ (Technical Excellence)

Hệ thống kế thừa sức mạnh từ các công nghệ hiện đại nhất:

-   **Frontend Architecture**: Kiến trúc Atomic Component dựa trên React 18, kết hợp với Tailwind CSS cho phép tùy biến giao diện linh hoạt (Glassmorphism UI). Sử dụng Vite cho tốc độ bundle cực nhanh.
-   **State Management**: Quản lý trạng thái tập trung với Zustand, giảm thiểu việc re-render không cần thiết, tối ưu hóa bộ nhớ trình duyệt.
-   **Backend Core**: Xây dựng trên nền tảng Node.js/Express với mô hình kiến trúc Layered Architecture (Controller - Service - Repository), đảm bảo tính mở rộng và dễ bảo trì.
-   **Data Integrity**: Sử dụng Prisma ORM kết hợp với Database (MySQL/Postgres) mạnh mẽ, đảm bảo tính nhất quán của dữ liệu qua các Transaction phức tạp.
-   **Evidence Storage**: Tích hợp hệ thống lưu trữ Cloudflare R2 (S3-compatible) cho phép xử lý hàng nghìn tệp minh chứng với độ trễ thấp và bảo mật cao.

---

## 🛠️ Hệ thống Tính năng Đẳng cấp

### 1. Phân hệ Điểm rèn luyện (DRL Evaluation)
-   **Cơ chế đánh giá đa tầng**: Sinh viên tự chấm -> Lớp kiểm tra -> Admin phê duyệt.
-   **Evidence Management**: Hệ thống quản lý minh chứng thông minh, cho phép upload đa định dạng.
-   **Premium Viewer**: Trình xem ảnh/PDF tích hợp Portal, hỗ trợ xoay, thu phóng và điều hướng mượt mà không làm gián đoạn luồng làm việc.

### 2. Phân hệ Chuyên cần QR (Smart Attendance)
-   **Dynamic QR Generation**: Mã QR được tạo động theo thời gian thực và vị trí lớp học.
-   **Security Check-in**: Ngăn chặn gian lận điểm danh qua cơ chế xác thực phiên làm việc.

### 3. Quản trị Học kỳ & Lớp học
-   **Flexible Scoping**: Cấu hình học kỳ linh hoạt, áp dụng cho toàn hệ thống hoặc từng đơn vị lớp cụ thể.
-   **Data Migration**: Nhập xuất dữ liệu hàng loạt qua Excel với công cụ xử lý dữ liệu (Bulk Import/Export) tối ưu.

---

## 📂 Cấu trúc Hệ thống (System Structure)

```text
qlsv/
├── backend/                # Server-side High Performance Core
│   ├── prisma/             # Database Schemas & Migrations
│   ├── src/                # Business Logic Implementation
│   │   ├── controllers/    # API Request Handlers
│   │   ├── middleware/     # Security & Auth Guards
│   │   ├── routes/         # API Endpoint Definitions
│   │   └── services/       # Core Business Logic
│   └── uploads/            # Local Backup Storage
├── frontend/               # Premium Client Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components (Bento Grid, Glassmorphism)
│   │   ├── layout/         # Application Shells & Navigation
│   │   ├── pages/          # Feature Modules (Evaluation, Dashboard, Admin)
│   │   └── store/          # Global State Store (Zustand)
│   └── public/             # Static Assets & Icons
├── skills/                 # Internal Tooling & Deployment Scripts
└── README.md               # Professional Documentation
```

---

## ⚡ Hướng dẫn Triển khai (Deployment Guide)

### Bước 1: Chuẩn bị Môi trường
-   Yêu cầu: Node.js (phiên bản Long Term Support), NPM/Yarn.
-   Cơ sở dữ liệu: MySQL 8.0+ hoặc PostgreSQL 14+.

### Bước 2: Thiết lập Backend
```bash
cd backend
npm install
# Cấu hình file .env dựa trên .env.example (DATABASE_URL, JWT_SECRET, R2_CONFIG)
npx prisma generate
npx prisma db push
npm run dev
```

### Bước 3: Thiết lập Frontend
```bash
cd frontend
npm install
# Cấu hình file .env dựa trên .env.example (VITE_API_URL)
npm run dev
```

---

## 🔒 Bản quyền & Bảo mật (Copyright & Security)

> [!IMPORTANT]
> **THÔNG BÁO BẢN QUYỀN TRÍ TUỆ**
> 
> Toàn bộ mã nguồn, thiết kế giao diện (UI/UX), cấu trúc dữ liệu và logic nghiệp vụ thuộc quyền sở hữu trí tuệ của **LÊ KHÁNH DUY**. 
> 
> 1. **Nghiêm cấm sao chép**: Không được phép sao chép, chỉnh sửa hoặc tái phân phối bất kỳ phần nào của dự án này khi chưa có sự đồng ý bằng văn bản của tác giả.
> 2. **Sử dụng thương mại**: Việc sử dụng dự án cho mục đích thương mại mà không có giấy phép hợp lệ là vi phạm pháp luật.
> 3. **Bảo mật**: Mọi hành vi xâm nhập trái phép hoặc can thiệp vào mã nguồn nhằm mục đích phá hoại sẽ bị xử lý theo quy định.

**© 2024 LÊ KHÁNH DUY. All Rights Reserved.**

---

## 📞 Liên hệ (Contact Information)

Mọi thắc mắc về bản quyền, hỗ trợ kỹ thuật hoặc yêu cầu tùy biến hệ thống, vui lòng liên hệ qua:

-   **Tác giả**: Lê Khánh Duy
-   **Vai trò**: Fullstack Developer / System Architect
-   **Email**: [duy.le@example.com]
-   **Dự án**: Hệ thống QLSV v2.0
