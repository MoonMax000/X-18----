import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { kycController } from '../controllers/kyc.controller';
import {
  submitKycSchema,
  updateVerificationSchema,
} from '../validators/kyc.validator';

const router = Router();

// Multer configuration for document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/kyc
 * @desc    Get KYC verification status
 * @access  Private
 */
router.get('/', kycController.getStatus);

/**
 * @route   POST /api/v1/kyc
 * @desc    Submit KYC documents
 * @access  Private
 */
router.post(
  '/',
  upload.single('document'),
  validateRequest(submitKycSchema),
  kycController.submitDocuments
);

/**
 * @route   GET /api/v1/kyc/documents
 * @desc    Get KYC documents
 * @access  Private
 */
router.get('/documents', kycController.getDocuments);

/**
 * @route   PUT /api/v1/kyc/:userId/status
 * @desc    Update KYC verification status (Admin only)
 * @access  Private (Admin)
 */
router.put(
  '/:userId/status',
  validateRequest(updateVerificationSchema),
  kycController.updateVerification
);

export default router;
