# Quy trình Nộp và Duyệt Minh Chứng (Điểm Rèn Luyện)

Tài liệu này mô tả chi tiết luồng xử lý nộp minh chứng (dành cho sinh viên) và duyệt minh chứng (dành cho Admin/Ban Chấp Hành) ở cả hai phía Backend và Frontend trong dự án QLSV kèm theo mã nguồn (source code) tương ứng.

---

## 1. Nộp Minh Chứng (Upload Evidence)

### 1.1. Phía Backend (BE)
- **API Endpoint:** `POST /api/training/upload-evidence`
- **File xử lý:** `backend/src/controllers/upload.controller.ts`
"import type { RequestHandler, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import prisma from '../utils/prisma';
import { getObjectFromR2, isR2Configured, uploadBufferToR2, validateR2Access } from '../utils/r2';
import {
  getSemesterClosedMessage,
  getSemesterSubmissionStatus,
  getSemesterWithScope,
  normalizeSemesterName,
} from '../utils/semester';

const uploadRootDir = path.join(process.cwd(), 'uploads', 'evidence');
if (!fs.existsSync(uploadRootDir)) fs.mkdirSync(uploadRootDir, { recursive: true });

const ALLOWED_EVIDENCE_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp']);
const ALLOWED_EVIDENCE_MIME_TO_EXTENSIONS = new Map<string, string[]>([
  ['application/pdf', ['.pdf']],
  ['application/msword', ['.doc']],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', ['.docx']],
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/pjpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/gif', ['.gif']],
  ['image/webp', ['.webp']],
]);

const CONTENT_TYPE_BY_EXTENSION = new Map<string, string>([
  ['.pdf', 'application/pdf'],
  ['.doc', 'application/msword'],
  ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
]);

const criterionIdRegex = /^\d+\.\d+$/;

const resolveEvidenceExtension = (file: Express.Multer.File) => {
  const ext = path.extname(String(file.originalname || '')).toLowerCase();
  const mimetype = String(file.mimetype || '').toLowerCase();

  const allowedExtByMime = ALLOWED_EVIDENCE_MIME_TO_EXTENSIONS.get(mimetype) || [];
  if (ext && ALLOWED_EVIDENCE_EXTENSIONS.has(ext) && allowedExtByMime.includes(ext)) {
    return ext;
  }

  return allowedExtByMime[0] || '';
};

const hasAllowedEvidenceType = (file: Express.Multer.File) => Boolean(resolveEvidenceExtension(file));

export const upload: RequestHandler = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
    fields: 12,
    fieldSize: 64 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!hasAllowedEvidenceType(file)) {
      cb(new Error('Chi ho tro: PDF, Word, hinh anh'));
      return;
    }
    cb(null, true);
  },
}).array('files', 10);

const sanitizeSegment = (value: string) => {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned || 'unknown';
};

const parseDetails = (raw: unknown): Record<string, any> => {
  let parsed: unknown = raw;
  for (let i = 0; i < 3; i += 1) {
    if (typeof parsed !== 'string') break;
    try {
      parsed = JSON.parse(parsed);
    } catch {
      break;
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  return parsed as Record<string, any>;
};

const normalizeStoredFiles = (raw: unknown): Array<{ path: string; name?: string; size?: number }> => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') {
        return { path: item };
      }
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const filePath = typeof record.path === 'string' ? record.path : '';
      if (!filePath) return null;
      return {
        path: filePath,
        name: typeof record.name === 'string' ? record.name : undefined,
        size: typeof record.size === 'number' ? record.size : undefined,
      };
    })
    .filter((item): item is { path: string; name?: string; size?: number } => Boolean(item));
};

const toCriterionToken = (criterionId: string) => criterionId.replace(/\D/g, '');

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const fileBaseWithoutExt = (filePath: string) => {
  const normalizedPath = filePath
    .replace(/^r2:/i, '')
    .replace(/^uploads\/evidence\//i, '')
    .replace(/\\/g, '/');
  const fileName = path.posix.basename(normalizedPath);
  const ext = path.posix.extname(fileName);
  return ext ? fileName.slice(0, -ext.length) : fileName;
};

const getExtensionForFile = (file: Express.Multer.File) => {
  return resolveEvidenceExtension(file);
};

const decodeEvidenceKey = (rawKey: string) => {
  try {
    return decodeURIComponent(rawKey);
  } catch {
    return rawKey;
  }
};

const normalizeLocalEvidenceKey = (value: string) =>
  String(value || '')
    .replace(/^uploads\/evidence\//i, '')
    .replace(/^\/+/, '')
    .replace(/\\/g, '/')
    .trim();

const resolveLocalEvidencePath = (rawKey: string) => {
  const normalized = normalizeLocalEvidenceKey(rawKey);
  if (!normalized || normalized.includes('\0')) return null;

  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  if (segments.some((segment) => segment === '.' || segment === '..')) return null;

  const basePath = path.resolve(uploadRootDir);
  const candidatePath = path.resolve(basePath, ...segments);
  if (candidatePath !== basePath && !candidatePath.startsWith(`${basePath}${path.sep}`)) {
    return null;
  }

  return candidatePath;
};

const applyCommonEvidenceHeaders = (res: Response) => {
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.setHeader('X-Content-Type-Options', 'nosniff');
};

const getNextIndexForCriterion = async (studentId: number, studentCode: string, criterionToken: string) => {
  const pattern = new RegExp(`^${escapeRegex(studentCode)}-${escapeRegex(criterionToken)}-(\\d+)$`, 'i');
  const rows = await (prisma.trainingScore as any).findMany({
    where: { student_id: studentId },
    select: { details: true },
  });

  let maxIndex = 0;

  for (const row of rows) {
    const details = parseDetails(row.details);
    for (const detail of Object.values(details)) {
      if (!detail || typeof detail !== 'object') continue;
      const files = normalizeStoredFiles((detail as Record<string, unknown>).files);

      for (const file of files) {
        const base = fileBaseWithoutExt(file.path);
        const matched = base.match(pattern);
        if (!matched) continue;
        const parsedIndex = Number(matched[1]);
        if (!Number.isNaN(parsedIndex) && parsedIndex > maxIndex) {
          maxIndex = parsedIndex;
        }
      }
    }
  }

  return maxIndex + 1;
};

const saveLocally = async (
  file: Express.Multer.File,
  classFolder: string,
  studentFolder: string,
  finalFileName: string,
) => {
  const relativePath = path.posix.join(classFolder, studentFolder, finalFileName);
  const fullPath = path.join(uploadRootDir, classFolder, studentFolder, finalFileName);
  await fsp.mkdir(path.dirname(fullPath), { recursive: true });
  await fsp.writeFile(fullPath, file.buffer);

  return {
    name: finalFileName,
    path: relativePath,
    size: file.size,
  };
};

const saveToR2 = async (
  file: Express.Multer.File,
  classFolder: string,
  studentFolder: string,
  finalFileName: string,
) => {
  const objectKey = `${classFolder}/${studentFolder}/${finalFileName}`;
  const key = await uploadBufferToR2({
    buffer: file.buffer,
    contentType: file.mimetype,
    originalName: finalFileName,
    objectKey,
  });

  return {
    name: finalFileName,
    path: `r2:${key}`,
    size: file.size,
  };
};

const upsertEvidenceToTrainingScore = async ({
  studentId,
  semester,
  criterionId,
  files,
}: {
  studentId: number;
  semester: string;
  criterionId: string;
  files: Array<{ name: string; path: string; size: number }>;
}) => {
  const existing = await (prisma.trainingScore as any).findFirst({
    where: {
      student_id: studentId,
      semester_id: semester,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!existing) {
    return (prisma.trainingScore as any).create({
      data: {
        student_id: studentId,
        semester_id: semester,
        y_thuc: 0,
        hoat_dong: 0,
        ky_luat: 0,
        total: 0,
        status: 'PENDING',
        details: {
          [criterionId]: {
            score: 0,
            files,
          },
        },
      },
    });
  }

  const details = parseDetails(existing.details);
  const currentCriterion = details[criterionId] && typeof details[criterionId] === 'object'
    ? (details[criterionId] as Record<string, unknown>)
    : {};
  const existingFiles = normalizeStoredFiles(currentCriterion.files);

  details[criterionId] = {
    ...currentCriterion,
    score: Number(currentCriterion.score || 0),
    files: [...existingFiles, ...files],
  };

  return (prisma.trainingScore as any).update({
    where: { id: existing.id },
    data: {
      details,
      status: 'PENDING',
      admin_y_thuc: null,
      admin_hoat_dong: null,
      admin_ky_luat: null,
      admin_total: null,
      admin_details: null,
      admin_notes: null,
    },
  });
};

export const uploadEvidence = (req: AuthRequest, res: Response) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    const files = (req as any).files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Khong co file nao duoc gui' });
    }

    const criterionId = String((req.body as any)?.criterionId || '').trim();
    const semester = normalizeSemesterName((req.body as any)?.semester);
    const bodyStudentId = Number((req.body as any)?.student_id || (req.body as any)?.studentId || 0);
    const requestRole = String(req.user?.role || '').toUpperCase();
    const studentIdFromToken = Number(req.user?.studentId || 0);

    if (!criterionId || !criterionIdRegex.test(criterionId)) {
      return res.status(400).json({ message: 'criterionId khong hop le' });
    }
    if (!semester) {
      return res.status(400).json({ message: 'Thieu hoc ky (semester)' });
    }

    const studentId = requestRole === 'STUDENT' ? studentIdFromToken : bodyStudentId;
    if (!studentId || Number.isNaN(studentId)) {
      return res.status(400).json({ message: 'Khong xac dinh duoc sinh vien upload' });
    }

    const criterionToken = toCriterionToken(criterionId);
    if (!criterionToken) {
      return res.status(400).json({ message: 'Muc minh chung khong hop le' });
    }

    try {
      const student = await (prisma.student as any).findUnique({
        where: { id: studentId },
        select: { id: true, student_code: true, class_id: true },
      });

      if (!student) {
        return res.status(404).json({ message: 'Khong tim thay sinh vien' });
      }

      const classId = String(student.class_id || '').trim().toUpperCase();
      const semesterConfig = await getSemesterWithScope(semester);
      const submissionStatus = getSemesterSubmissionStatus({
        semesterName: semester,
        semester: semesterConfig,
        classId,
      });

      if (!submissionStatus.isOpen) {
        return res.status(400).json({
          message: getSemesterClosedMessage(submissionStatus),
          submission: submissionStatus,
        });
      }

      const studentCode = sanitizeSegment(String(student.student_code || `SV${studentId}`)).toUpperCase();
      const classFolder = sanitizeSegment(String(student.class_id || 'unknown-class'));
      const studentFolder = studentCode;
      const startIndex = await getNextIndexForCriterion(studentId, studentCode, criterionToken);
      const useR2 = isR2Configured();

      if (useR2) {
        const validation = await validateR2Access();
        if (!validation.ok) {
          return res.status(500).json({
            message: `R2 chua san sang: ${validation.message}`,
          });
        }
      }

      const saved = await Promise.all(
        files.map(async (file, offset) => {
          const index = startIndex + offset;
          const extension = getExtensionForFile(file);
          const finalFileName = `${studentCode}-${criterionToken}-${index}${extension}`;
          return useR2
            ? saveToR2(file, classFolder, studentFolder, finalFileName)
            : saveLocally(file, classFolder, studentFolder, finalFileName);
        }),
      );

      const updatedScore = await upsertEvidenceToTrainingScore({
        studentId,
        semester,
        criterionId,
        files: saved,
      });

      return res.json({
        message: useR2 ? 'Upload thanh cong len Cloudflare R2' : 'Upload thanh cong',
        files: saved,
        storage: useR2 ? 'r2' : 'local',
        criterionId,
        semester,
        trainingScoreId: updatedScore?.id,
      });
    } catch (uploadError: any) {
      console.error('Evidence upload failed:', uploadError);
      return res.status(500).json({ message: uploadError?.message || 'Khong the luu minh chung' });
    }
  });
};

export const getEvidenceFile = async (req: AuthRequest, res: Response) => {
  const rawKey = String(req.params.encodedKey || '').trim();
  if (!rawKey) {
    return res.status(400).json({ message: 'Thieu ma file minh chung' });
  }

  const decodedKey = decodeEvidenceKey(rawKey);

  const streamFromR2 = async (objectKey: string) => {
    const response = await getObjectFromR2(objectKey);
    if (!response) return false;

    if (response.contentType) res.setHeader('Content-Type', response.contentType);
    if (response.contentLength) res.setHeader('Content-Length', response.contentLength);
    if (response.eTag) res.setHeader('ETag', response.eTag);
    if (response.lastModified) res.setHeader('Last-Modified', response.lastModified.toUTCString());
    applyCommonEvidenceHeaders(res);

    response.body.on('error', (streamError) => {
      console.error('Evidence R2 stream failed:', streamError);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Khong the doc minh chung tu Cloudflare R2' });
      } else {
        res.destroy(streamError as Error);
      }
    });

    response.body.pipe(res);
    return true;
  };

  try {
    if (decodedKey.toLowerCase().startsWith('r2:')) {
      if (!isR2Configured()) {
        return res.status(500).json({ message: 'Cloudflare R2 chua duoc cau hinh' });
      }

      const served = await streamFromR2(decodedKey.slice(3));
      if (!served) {
        return res.status(404).json({ message: 'Khong tim thay minh chung' });
      }
      return;
    }

    const localFilePath = resolveLocalEvidencePath(decodedKey);
    if (localFilePath) {
      try {
        const stats = await fsp.stat(localFilePath);
        if (!stats.isFile()) {
          return res.status(404).json({ message: 'Khong tim thay minh chung' });
        }

        const extension = path.extname(localFilePath).toLowerCase();
        const contentType = CONTENT_TYPE_BY_EXTENSION.get(extension);
        if (contentType) res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', String(stats.size));
        applyCommonEvidenceHeaders(res);

        const localStream = fs.createReadStream(localFilePath);
        localStream.on('error', (streamError) => {
          console.error('Evidence local stream failed:', streamError);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Khong the doc minh chung tu bo nho cuc bo' });
          } else {
            res.destroy(streamError as Error);
          }
        });

        localStream.pipe(res);
        return;
      } catch (error: any) {
        if (error?.code !== 'ENOENT') {
          throw error;
        }
      }
    }

    if (isR2Configured()) {
      const served = await streamFromR2(decodedKey);
      if (served) return;
    }

    return res.status(404).json({ message: 'Khong tim thay minh chung' });
  } catch (error) {
    console.error('Evidence proxy failed:', error);
    return res.status(500).json({ message: 'Khong the doc minh chung' });
  }
};
"
- **Mã nguồn:**

```typescript
export const uploadEvidence = (req: AuthRequest, res: Response) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    const files = (req as any).files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Không có file nào được gửi' });
    }

    const criterionId = String((req.body as any)?.criterionId || '').trim();
    const semester = normalizeSemesterName((req.body as any)?.semester);
    const bodyStudentId = Number((req.body as any)?.student_id || (req.body as any)?.studentId || 0);
    const requestRole = String(req.user?.role || '').toUpperCase();
    const studentIdFromToken = Number(req.user?.studentId || 0);

    // Xác thực đầu vào
    if (!criterionId || !criterionIdRegex.test(criterionId)) {
      return res.status(400).json({ message: 'criterionId không hợp lệ' });
    }
    if (!semester) {
      return res.status(400).json({ message: 'Thiếu học kỳ (semester)' });
    }

    const studentId = requestRole === 'STUDENT' ? studentIdFromToken : bodyStudentId;
    if (!studentId || Number.isNaN(studentId)) {
      return res.status(400).json({ message: 'Không xác định được sinh viên upload' });
    }

    const criterionToken = toCriterionToken(criterionId);
    if (!criterionToken) {
      return res.status(400).json({ message: 'Mục minh chứng không hợp lệ' });
    }

    try {
      // Xác minh sinh viên
      const student = await (prisma.student as any).findUnique({
        where: { id: studentId },
        select: { id: true, student_code: true, class_id: true },
      });

      if (!student) {
        return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
      }

      const classId = String(student.class_id || '').trim().toUpperCase();
      const semesterConfig = await getSemesterWithScope(semester);
      
      // Kiểm tra xem thời gian nộp minh chứng (hạn nộp) còn mở không
      const submissionStatus = getSemesterSubmissionStatus({
        semesterName: semester,
        semester: semesterConfig,
        classId,
      });

      if (!submissionStatus.isOpen) {
        return res.status(400).json({
          message: getSemesterClosedMessage(submissionStatus),
          submission: submissionStatus,
        });
      }

      // Xác định thông tin lưu trữ và cấu trúc file
      const studentCode = sanitizeSegment(String(student.student_code || `SV${studentId}`)).toUpperCase();
      const classFolder = sanitizeSegment(String(student.class_id || 'unknown-class'));
      const studentFolder = studentCode;
      const startIndex = await getNextIndexForCriterion(studentId, studentCode, criterionToken);
      const useR2 = isR2Configured();

      if (useR2) {
        const validation = await validateR2Access();
        if (!validation.ok) {
          return res.status(500).json({
            message: `R2 chưa sẵn sàng: ${validation.message}`,
          });
        }
      }

      // Lưu file đồng loạt bằng Promise.all
      const saved = await Promise.all(
        files.map(async (file, offset) => {
          const index = startIndex + offset;
          const extension = getExtensionForFile(file);
          const finalFileName = `${studentCode}-${criterionToken}-${index}${extension}`;
          
          return useR2
            ? saveToR2(file, classFolder, studentFolder, finalFileName)
            : saveLocally(file, classFolder, studentFolder, finalFileName);
        }),
      );

      // Lưu thông tin file vào database Prisma (Details JSON)
      const updatedScore = await upsertEvidenceToTrainingScore({
        studentId,
        semester,
        criterionId,
        files: saved,
      });

      return res.json({
        message: useR2 ? 'Upload thành công lên Cloudflare R2' : 'Upload thành công',
        files: saved,
        storage: useR2 ? 'r2' : 'local',
        criterionId,
        semester,
        trainingScoreId: updatedScore?.id,
      });
    } catch (uploadError: any) {
      console.error('Evidence upload failed:', uploadError);
      return res.status(500).json({ message: uploadError?.message || 'Không thể lưu minh chứng' });
    }
  });
};
```

### 1.2. Phía Frontend (FE)
- **File xử lý:** `frontend/src/components/DetailedEvaluationForm.tsx`
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { EVALUATION_DATA } from '../constants/evaluationData';
import type { Section } from '../constants/evaluationData';
import { normalizeEvidenceList } from '../utils/evidence';
import BottomBar from './drl/BottomBar';
import CriteriaRow from './drl/CriteriaRow';
import PreviewModal from './drl/PreviewModal';
import SectionCard from './drl/SectionCard';

interface Props {
  initialData?: any;
  studentDetails?: any;
  adminData?: any;
  studentId?: number;
  semester?: string;
  onSubmit: (data: any) => void;
  loading?: boolean;
  isAdminMode?: boolean;
  onExport?: () => void;
  onClose?: () => void;
}

const DetailedEvaluationForm: React.FC<Props> = ({
  initialData,
  studentDetails,
  adminData,
  studentId,
  semester,
  onSubmit,
  loading,
  isAdminMode,
  onExport,
  onClose,
}) => {
  const [scores, setScores] = useState<Record<string, number | undefined>>({});
  const [adminScores, setAdminScores] = useState<Record<string, number | undefined>>({});
  const [evidence, setEvidence] = useState<Record<string, any[]>>({});
  const [expandedSections, setExpandedSections] = useState<string[]>(['sec-1']);
  const [previewData, setPreviewData] = useState<{ files: any[]; initialIndex: number; criterionId: string } | null>(null);

  useEffect(() => {
    const studentScoreMap: Record<string, number | undefined> = {};
    const adminScoreMap: Record<string, number | undefined> = {};
    const evidenceMap: Record<string, any[]> = {};

    EVALUATION_DATA.forEach((section) => {
      section.criteria.forEach((criterion) => {
        if (studentDetails?.[criterion.id]) {
          studentScoreMap[criterion.id] = Number(studentDetails[criterion.id].score || 0);
          evidenceMap[criterion.id] = normalizeEvidenceList(studentDetails[criterion.id].files || []);
        } else if (initialData?.scores?.[criterion.id] !== undefined) {
          studentScoreMap[criterion.id] = Number(initialData.scores[criterion.id] || 0);
          evidenceMap[criterion.id] = normalizeEvidenceList(initialData.evidence?.[criterion.id] || []);
        } else {
          studentScoreMap[criterion.id] = undefined;
          evidenceMap[criterion.id] = [];
        }

        if (adminData?.[criterion.id] !== undefined) {
          adminScoreMap[criterion.id] = Number(adminData[criterion.id]);
        } else if (isAdminMode) {
          adminScoreMap[criterion.id] = studentScoreMap[criterion.id];
        } else {
          adminScoreMap[criterion.id] = undefined;
        }
      });
    });

    setScores(studentScoreMap);
    setAdminScores(adminScoreMap);
    setEvidence(evidenceMap);
  }, [studentDetails, adminData, initialData, isAdminMode]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => (prev.includes(id) ? prev.filter((sectionId) => sectionId !== id) : [...prev, id]));
  };

  const calculateSectionTotal = (section: Section, scoreSet: Record<string, number | undefined>) => {
    let total = 0;
    section.criteria.forEach((criterion) => {
      total += Number(scoreSet[criterion.id] || 0);
    });
    return Math.min(total, section.maxPoints);
  };

  const grandTotal = EVALUATION_DATA.reduce((acc, section) => acc + calculateSectionTotal(section, scores), 0);
  const adminGrandTotal = EVALUATION_DATA.reduce((acc, section) => acc + calculateSectionTotal(section, adminScores), 0);

  const handleFileUpload = async (criterionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    if (!studentId) {
      toast.error('Khong tim thay thong tin sinh vien de upload minh chung');
      event.target.value = '';
      return;
    }
    if (!semester) {
      toast.error('Vui long chon hoc ky truoc khi upload minh chung');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    formData.append('criterionId', criterionId);
    formData.append('semester', semester);
    formData.append('student_id', String(studentId));

    try {
      const res = await api.post('/training/upload-evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setEvidence((prev) => ({
        ...prev,
        [criterionId]: [...(prev[criterionId] || []), ...normalizeEvidenceList(res.data.files)],
      }));
      const savedCount = res.data.files?.length || files.length;
      const storageLabel = res.data.storage === 'r2' ? 'Cloudflare R2' : 'local server';
      toast.success(`Da upload ${savedCount} minh chung (${storageLabel})`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Upload minh chung that bai');
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveEvidence = (criterionId: string, path: string) => {
    setEvidence((prev) => ({
      ...prev,
      [criterionId]: normalizeEvidenceList(prev[criterionId] || []).filter((file) => file.path !== path),
    }));
  };

  const handleRemoveFromPreview = (index: number) => {
    if (!previewData) return;
    const fileToRemove = previewData.files[index];
    if (!fileToRemove) return;
    
    handleRemoveEvidence(previewData.criterionId, fileToRemove.path);
    
    // Update local preview state to remove the file
    const newFiles = [...previewData.files];
    newFiles.splice(index, 1);
    
    if (newFiles.length === 0) {
      setPreviewData(null);
    } else {
      setPreviewData({
        ...previewData,
        files: newFiles,
        initialIndex: Math.min(index, newFiles.length - 1)
      });
    }
  };

  const handleSubmit = () => {
    if (isAdminMode) {
      onSubmit({
        admin_details: adminScores,
        admin_total: adminGrandTotal,
        admin_y_thuc: calculateSectionTotal(EVALUATION_DATA[0], adminScores),
        admin_hoat_dong: calculateSectionTotal(EVALUATION_DATA[1], adminScores) + calculateSectionTotal(EVALUATION_DATA[2], adminScores),
        admin_ky_luat: calculateSectionTotal(EVALUATION_DATA[3], adminScores) + calculateSectionTotal(EVALUATION_DATA[4], adminScores),
      });
      return;
    }

    const normalizedScores = Object.fromEntries(
      Object.keys(scores).map((id) => [id, Number(scores[id] || 0)]),
    );

    const details: Record<string, any> = {};
    Object.keys(normalizedScores).forEach((id) => {
      details[id] = { score: normalizedScores[id], files: evidence[id] || [] };
    });

    onSubmit({
      scores: normalizedScores,
      total: grandTotal,
      details,
      y_thuc: calculateSectionTotal(EVALUATION_DATA[0], scores),
      hoat_dong: calculateSectionTotal(EVALUATION_DATA[1], scores) + calculateSectionTotal(EVALUATION_DATA[2], scores),
      ky_luat: calculateSectionTotal(EVALUATION_DATA[3], scores) + calculateSectionTotal(EVALUATION_DATA[4], scores),
    });
  };

  return (
    <>
      <div className="animate-in slide-in-from-bottom-10 fade-in space-y-4 md:space-y-8 pb-32 duration-700">
        {EVALUATION_DATA.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            studentSecTotal={calculateSectionTotal(section, scores)}
            adminSecTotal={calculateSectionTotal(section, adminScores)}
            isExpanded={expandedSections.includes(section.id)}
            isAdminMode={isAdminMode}
            onToggle={() => toggleSection(section.id)}
          >
            {section.criteria.map((criterion) => (
              <CriteriaRow
                key={criterion.id}
                criterion={criterion}
                studentScore={scores[criterion.id]}
                adminScore={adminScores[criterion.id]}
                evidence={evidence[criterion.id] || []}
                isAdminMode={isAdminMode}
                onStudentScoreChange={(value) => setScores((prev) => ({ ...prev, [criterion.id]: value }))}
                onAdminScoreChange={(value) => setAdminScores((prev) => ({ ...prev, [criterion.id]: value }))}
                onUpload={(event) => handleFileUpload(criterion.id, event)}
                onViewEvidence={(path) => {
                   const files = evidence[criterion.id] || [];
                   const index = files.findIndex(f => f.path === path);
                   setPreviewData({ 
                     files, 
                     initialIndex: index >= 0 ? index : 0, 
                     criterionId: criterion.id 
                   });
                 }}
              />
            ))}
          </SectionCard>
        ))}

        <BottomBar
          grandTotal={grandTotal}
          adminGrandTotal={adminGrandTotal}
          onSave={handleSubmit}
          onExport={onExport}
          onClose={onClose}
          loading={loading}
          isAdminMode={isAdminMode}
        />
      </div>

      <PreviewModal
        files={previewData?.files || []}
        initialIndex={previewData?.initialIndex}
        onClose={() => setPreviewData(null)}
        onRemove={isAdminMode ? undefined : handleRemoveFromPreview}
      />
    </>
  );
};

export default DetailedEvaluationForm;

"
- **Mã nguồn:**

```typescript
const handleFileUpload = async (criterionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;
  
  if (!studentId) {
    toast.error('Không tìm thấy thông tin sinh viên để upload minh chứng');
    event.target.value = '';
    return;
  }
  if (!semester) {
    toast.error('Vui lòng chọn học kỳ trước khi upload minh chứng');
    event.target.value = '';
    return;
  }

  // Khởi tạo form data chuẩn bị đẩy file multipart
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  formData.append('criterionId', criterionId);
  formData.append('semester', semester);
  formData.append('student_id', String(studentId));

  try {
    const res = await api.post('/training/upload-evidence', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Cập nhật State giao diện để hiển thị file mới nhất ngay tức thì
    setEvidence((prev) => ({
      ...prev,
      [criterionId]: [...(prev[criterionId] || []), ...normalizeEvidenceList(res.data.files)],
    }));
    
    const savedCount = res.data.files?.length || files.length;
    const storageLabel = res.data.storage === 'r2' ? 'Cloudflare R2' : 'local server';
    toast.success(`Đã upload ${savedCount} minh chứng (${storageLabel})`);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Upload minh chứng thất bại');
  } finally {
    event.target.value = '';
  }
};
```

---

## 2. Duyệt Minh Chứng (Approve Evidence)

### 2.1. Phía Backend (BE)
- **API Endpoint:** `PATCH /api/training/:id/approve`
- **File xử lý:** `backend/src/controllers/training.controller.ts`
- **Mã nguồn:**

```typescript
export const approveTrainingScore = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, admin_y_thuc, admin_hoat_dong, admin_ky_luat, admin_notes, admin_details, criteria_meta } = req.body;
  
  // Tính tổng điểm do Admin chấm
  let adminTotal = (admin_y_thuc !== undefined && admin_hoat_dong !== undefined && admin_ky_luat !== undefined)
    ? (Number(admin_y_thuc) + Number(admin_hoat_dong) + Number(admin_ky_luat))
    : undefined;

  if (admin_details && typeof admin_details === 'object' && adminTotal === undefined) {
    adminTotal = Object.values(admin_details).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
  }

  const criteriaMeta = Array.isArray(criteria_meta) ? criteria_meta as CriterionReportMeta[] : [];

  try {
    const updateData: Record<string, any> = {};
    if (status !== undefined) updateData.status = status;
    if (admin_y_thuc !== undefined) updateData.admin_y_thuc = Number(admin_y_thuc) || 0;
    if (admin_hoat_dong !== undefined) updateData.admin_hoat_dong = Number(admin_hoat_dong) || 0;
    if (admin_ky_luat !== undefined) updateData.admin_ky_luat = Number(admin_ky_luat) || 0;
    if (adminTotal !== undefined) updateData.admin_total = Number(adminTotal) || 0;
    if (admin_notes !== undefined) updateData.admin_notes = String(admin_notes);
    if (admin_details) updateData.admin_details = admin_details;

    let updated: any;
    try {
      // Dùng Raw SQL để bỏ qua lỗi cache/schema của Prisma Client khi xử lý kiểu jsonb
      await (prisma as any).$executeRaw`
        UPDATE "TrainingScore"
        SET 
          status = ${status},
          admin_y_thuc = ${updateData.admin_y_thuc ?? 0},
          admin_hoat_dong = ${updateData.admin_hoat_dong ?? 0},
          admin_ky_luat = ${updateData.admin_ky_luat ?? 0},
          admin_total = ${updateData.admin_total ?? 0},
          admin_notes = ${updateData.admin_notes ?? ''},
          admin_details = ${updateData.admin_details ? JSON.stringify(updateData.admin_details) : null}::jsonb,
          "updatedAt" = NOW()
        WHERE id = ${Number(id)}
      `;

      // Sau khi cập nhật, truy vấn lại dữ liệu trả về cho Frontend
      updated = await (prisma.trainingScore as any).findUnique({
        where: { id: Number(id) },
        include: {
          student: true,
          semester: true
        }
      });

      if (!updated) {
        throw new Error('Không tìm thấy phiếu sau khi cập nhật');
      }
    } catch (dbError) {
      return res.status(500).json({ 
        message: 'Lỗi khi cập nhật vào cơ sở dữ liệu (SQL)', 
        error: String(dbError) 
      });
    }

    // Trả kết quả về Frontend ngay để có UX tốt (không bắt đợi email gửi)
    res.json({
      ...updated,
      notification: {
        approvalEmail: { sent: false, queued: true, message: 'Email đang được gửi ngầm...' }
      },
    });

    // Luồng Background (Fire-and-forget) chạy ngầm gửi email
    if (updated.student?.email) {
      (async () => {
        try {
          let adminName = req.user?.username || 'Ban Chấp Hành';
          let adminEmail = '';
          let adminPhone = '';
          
          if (req.user?.id) {
            const adminUser = await (prisma.user as any).findUnique({
              where: { id: Number(req.user.id) }
            });
            if (adminUser?.name) adminName = adminUser.name;
            if (adminUser?.email) adminEmail = adminUser.email;
            if (adminUser?.phone) adminPhone = adminUser.phone;
          }

          // Gửi mail cho sinh viên báo kết quả duyệt/từ chối
          await sendApprovalEmail({
            studentEmail: updated.student.email,
            studentName: updated.student.name,
            studentId: updated.student.student_code,
            semester: typeof updated.semester === 'object' ? updated.semester?.name : updated.semester_id,
            classId: updated.student.class_id,
            rejectionFeedback: updated.admin_notes || '',
            adminName,
            adminEmail,
            adminPhone,
            reportData: {
              details: updated.details,
              adminDetails: updated.admin_details,
              selfScore: updated.total,
              classScore: updated.admin_total ?? 0,
              finalScore: updated.admin_total ?? updated.total,
              status: updated.status,
              criteria: criteriaMeta,
            },
          });
        } catch (emailError: any) {
          console.error(`[Email] Background approval email failed for #${id}:`, emailError);
        }
      })();
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

### 2.2. Phía Frontend (FE)
- **File xử lý:** `frontend/src/pages/TrainingScoreDetail.tsx`
- **Mã nguồn:**

```typescript
// Chuẩn bị payload dữ liệu trước khi gửi request lưu / duyệt minh chứng
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

// Hàm gọi khi bấm "Duyệt" hoặc "Từ chối"
const handleSave = async (status: 'APPROVED' | 'REJECTED') => {
  setSavingStatus(status);
  try {
    // Gửi thay đổi lên server
    await api.patch(`/training/${id}/approve`, buildPayload(status));
    
    // Cập nhật state nội bộ để giữ lại thông tin mà không cần load lại form
    setData((prev: any) => ({
      ...prev,
      status,
      admin_notes: adminNotes,
      admin_details: adminScores,
      admin_total: adminTotal,
    }));
    
    toast.success(status === 'APPROVED' ? 'Đã duyệt phiếu thành công' : 'Đã cập nhật kết quả chấm');
    navigate('/drl'); // Điều hướng trở về danh sách phiếu
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || 'Không thể lưu kết quả duyệt';
    const detail = error?.response?.data?.error;
    toast.error(detail ? `${errMsg}: ${detail}` : errMsg);
  } finally {
    setSavingStatus(null);
  }
};
```
