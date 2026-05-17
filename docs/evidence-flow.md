# Quy trình Nộp và Duyệt Minh Chứng (Điểm Rèn Luyện)

Tài liệu này mô tả luồng xử lý nộp minh chứng của sinh viên và duyệt minh chứng của Admin/Ban Chấp Hành trong dự án QLSV. Nội dung bên dưới bám theo source code hiện tại của repo để người đọc có thể đối chiếu trực tiếp khi phát triển hoặc kiểm thử.

## 1. Nộp Minh Chứng

### 1.1 Backend

- API: `POST /api/training/upload-evidence`
- File xử lý: [backend/src/controllers/upload.controller.ts](../backend/src/controllers/upload.controller.ts)

Luồng chính:

1. Nhận nhiều file qua `multer` với giới hạn `10MB/file`, tối đa `10` file mỗi lần upload.
2. Kiểm tra định dạng hợp lệ: PDF, Word, JPG/JPEG, PNG, GIF, WEBP.
3. Xác thực `criterionId`, `semester`, `student_id` và quyền của người gọi.
4. Kiểm tra sinh viên có tồn tại, học kỳ có đang mở nộp hay không.
5. Sinh tên file theo mẫu `MSSV-criterionToken-index.ext`.
6. Lưu file vào local storage hoặc Cloudflare R2 tùy cấu hình.
7. Ghi metadata file vào JSON `details` của `TrainingScore` và đưa trạng thái về `PENDING`.

Payload đầu vào chính:

```ts
const formData = new FormData();
Array.from(files).forEach((file) => formData.append('files', file));
formData.append('criterionId', criterionId);
formData.append('semester', semester);
formData.append('student_id', String(studentId));
```

Kết quả trả về:

```ts
{
  message: 'Upload thanh cong' | 'Upload thanh cong len Cloudflare R2',
  files: [{ name, path, size }],
  storage: 'local' | 'r2',
  criterionId,
  semester,
  trainingScoreId
}
```

### 1.2 Frontend

- File xử lý: [frontend/src/components/DetailedEvaluationForm.tsx](../frontend/src/components/DetailedEvaluationForm.tsx)

Luồng UI:

1. Người dùng chọn file tại từng tiêu chí minh chứng.
2. Frontend tạo `FormData` và gọi `POST /training/upload-evidence`.
3. Nếu upload thành công, danh sách minh chứng của tiêu chí đó được cập nhật ngay trên giao diện.
4. Người dùng có thể xem lại file vừa upload bằng preview modal.

Payload gửi lên server:

```ts
const formData = new FormData();
Array.from(files).forEach((file) => formData.append('files', file));
formData.append('criterionId', criterionId);
formData.append('semester', semester);
formData.append('student_id', String(studentId));
```

Xử lý sau khi nhận response:

```ts
setEvidence((prev) => ({
  ...prev,
  [criterionId]: [...(prev[criterionId] || []), ...normalizeEvidenceList(res.data.files)],
}));
```

## 2. Duyệt Minh Chứng

### 2.1 Backend

- API: `PATCH /api/training/:id/approve`
- File xử lý: [backend/src/controllers/training.controller.ts](../backend/src/controllers/training.controller.ts)

Luồng chính:

1. Nhận `status`, `admin_y_thuc`, `admin_hoat_dong`, `admin_ky_luat`, `admin_notes`, `admin_details`, `criteria_meta`.
2. Tính `admin_total` từ 3 nhóm điểm hoặc từ `admin_details` nếu cần.
3. Cập nhật bản ghi `TrainingScore` bằng raw SQL để tránh lỗi cache/schema của Prisma ở cột JSON.
4. Query lại dữ liệu đã cập nhật để trả về cho frontend.
5. Nếu sinh viên có email, hệ thống gửi email thông báo duyệt/từ chối ở luồng nền.

Payload xử lý ở controller:

```ts
const updateData: Record<string, any> = {};
if (status !== undefined) updateData.status = status;
if (admin_y_thuc !== undefined) updateData.admin_y_thuc = Number(admin_y_thuc) || 0;
if (admin_hoat_dong !== undefined) updateData.admin_hoat_dong = Number(admin_hoat_dong) || 0;
if (admin_ky_luat !== undefined) updateData.admin_ky_luat = Number(admin_ky_luat) || 0;
if (adminTotal !== undefined) updateData.admin_total = Number(adminTotal) || 0;
if (admin_notes !== undefined) updateData.admin_notes = String(admin_notes);
if (admin_details) updateData.admin_details = admin_details;
```

### 2.2 Frontend

- File xử lý: [frontend/src/pages/TrainingScoreDetail.tsx](../frontend/src/pages/TrainingScoreDetail.tsx)

Luồng UI:

1. Admin mở chi tiết phiếu điểm rèn luyện.
2. Giao diện gom điểm theo từng tiêu chí và tính tổng điểm lớp chấm.
3. Khi bấm `Duyệt` hoặc `Từ chối`, frontend gửi payload lên `PATCH /training/:id/approve`.
4. Sau khi server trả về thành công, state nội bộ được cập nhật và điều hướng về danh sách DRL.

Payload frontend gửi đi:

```ts
const buildPayload = (status: 'APPROVED' | 'REJECTED') => ({
  status,
  admin_details: adminScores,
  admin_total: adminTotal,
  admin_y_thuc: calculateSectionTotal(EVALUATION_DATA[0], adminScores),
  admin_hoat_dong: calculateSectionTotal(EVALUATION_DATA[1], adminScores) + calculateSectionTotal(EVALUATION_DATA[2], adminScores),
  admin_ky_luat: calculateSectionTotal(EVALUATION_DATA[3], adminScores) + calculateSectionTotal(EVALUATION_DATA[4], adminScores),
  admin_notes: adminNotes,
  criteria_meta: EVALUATION_DATA.flatMap((section) =>
    section.criteria.map((criterion) => ({
      id: criterion.id,
      content: criterion.content,
      sectionTitle: section.title,
      maxPoints: criterion.maxPoints,
    })),
  ),
});
```

Gọi lưu:

```ts
await api.patch(`/training/${id}/approve`, buildPayload(status));
```

## 3. Ghi chú triển khai

- Local storage được lưu dưới thư mục `uploads/evidence`.
- Khi Cloudflare R2 được cấu hình, file sẽ được đẩy sang R2 và đường dẫn được lưu với tiền tố `r2:`.
- Các file minh chứng được normalize trước khi render để frontend có thể hiển thị đồng nhất dù dữ liệu đến từ local hay R2.
- Trạng thái `PENDING` được dùng sau upload để chờ lớp/admin duyệt.

## 4. File liên quan

- [backend/src/controllers/upload.controller.ts](../backend/src/controllers/upload.controller.ts)
- [backend/src/controllers/training.controller.ts](../backend/src/controllers/training.controller.ts)
- [frontend/src/components/DetailedEvaluationForm.tsx](../frontend/src/components/DetailedEvaluationForm.tsx)
- [frontend/src/pages/TrainingScoreDetail.tsx](../frontend/src/pages/TrainingScoreDetail.tsx)
