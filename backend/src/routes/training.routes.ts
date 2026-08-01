import { Router } from 'express';
import { 
  createOrUpdateTrainingScore, 
  getTrainingScoreByStudent, 
  getTrainingScores, 
  getTrainingStatistics,
  getTrainingScoreById,
  approveTrainingScore,
  createTrainingScore,
  getSubmissionStatus,
  exportTrainingScoresExcel,
  submitStudentCustomEvidence,
  getStudentCustomEvidence,
  getAllCustomEvidence,
  reviewCustomEvidence,
  importTrainingScoresExcel,
  importFinalDRLExcel,
} from '../controllers/training.controller.js';
import { getEvidenceFile, uploadEvidence } from '../controllers/upload.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';

const ALLOWED_EXCEL_EXTENSIONS = new Set(['.xlsx', '.xls']);
const ALLOWED_EXCEL_MIMES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/octet-stream',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(String(file.originalname || '')).toLowerCase();
    const mimetype = String(file.mimetype || '').toLowerCase();

    if (!ALLOWED_EXCEL_EXTENSIONS.has(ext) || !ALLOWED_EXCEL_MIMES.has(mimetype)) {
      cb(new Error('Chỉ chấp nhận tệp Excel (.xlsx, .xls)'));
      return;
    }

    cb(null, true);
  },
});

const router = Router();

router.use(authMiddleware);

router.get('/export', roleMiddleware(['ADMIN', 'BCH']), exportTrainingScoresExcel);
router.get('/statistics', roleMiddleware(['ADMIN', 'BCH']), getTrainingStatistics);
router.get('/submission-status', getSubmissionStatus);
router.get('/evidence/student', getStudentCustomEvidence);
router.get('/evidence/all', roleMiddleware(['ADMIN', 'BCH']), getAllCustomEvidence);
router.post('/evidence/review', roleMiddleware(['ADMIN', 'BCH']), reviewCustomEvidence);
router.post('/evidence/submit', submitStudentCustomEvidence);
router.get('/evidence/:encodedKey', getEvidenceFile);
router.post('/import-excel', roleMiddleware(['ADMIN', 'BCH']), upload.single('file'), importTrainingScoresExcel);
router.post('/import-final-drl', roleMiddleware(['ADMIN', 'BCH']), upload.single('file'), importFinalDRLExcel);

router.get('/', (req, res, next) => {
  const { studentId } = req.query;
  if (studentId) return getTrainingScoreByStudent(req, res);
  return getTrainingScores(req, res);
});
router.get('/student/:studentId', getTrainingScoreByStudent);
router.get('/:id', getTrainingScoreById);
router.patch('/:id/approve', roleMiddleware(['ADMIN', 'BCH']), approveTrainingScore);
router.post('/upload-evidence', uploadEvidence);
router.post('/', createTrainingScore);

export default router;
