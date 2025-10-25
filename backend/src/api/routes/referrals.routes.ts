import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { referralsController } from '../controllers/referrals.controller';
import {
  generateLinkSchema,
  trackClickSchema,
  getStatsSchema,
} from '../validators/referrals.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/referrals/stats
 * @desc    Get referral statistics
 * @access  Private
 */
router.get(
  '/stats',
  validateRequest(getStatsSchema),
  referralsController.getStats
);

/**
 * @route   GET /api/v1/referrals
 * @desc    Get referral list
 * @access  Private
 */
router.get('/', referralsController.getReferrals);

/**
 * @route   POST /api/v1/referrals/generate
 * @desc    Generate referral link
 * @access  Private
 */
router.post(
  '/generate',
  validateRequest(generateLinkSchema),
  referralsController.generateLink
);

/**
 * @route   POST /api/v1/referrals/track
 * @desc    Track referral click
 * @access  Private
 */
router.post(
  '/track',
  validateRequest(trackClickSchema),
  referralsController.trackClick
);

export default router;
