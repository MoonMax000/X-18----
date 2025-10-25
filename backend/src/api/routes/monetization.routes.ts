import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { monetizationController } from '../controllers/monetization.controller';
import {
  getEarningsSchema,
  requestPayoutSchema,
  createCheckoutSchema,
} from '../validators/monetization.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/monetization/earnings
 * @desc    Get earnings summary
 * @access  Private
 */
router.get(
  '/earnings',
  validateRequest(getEarningsSchema),
  monetizationController.getEarnings
);

/**
 * @route   GET /api/v1/monetization/analytics
 * @desc    Get detailed analytics
 * @access  Private
 */
router.get('/analytics', monetizationController.getAnalytics);

/**
 * @route   POST /api/v1/monetization/payout
 * @desc    Request payout
 * @access  Private
 */
router.post(
  '/payout',
  validateRequest(requestPayoutSchema),
  monetizationController.requestPayout
);

/**
 * @route   GET /api/v1/monetization/payouts
 * @desc    Get payout history
 * @access  Private
 */
router.get('/payouts', monetizationController.getPayoutHistory);

/**
 * @route   POST /api/v1/monetization/create-checkout
 * @desc    Create Stripe Checkout session
 * @access  Private
 */
router.post(
  '/create-checkout',
  validateRequest(createCheckoutSchema),
  monetizationController.createCheckoutSession
);

export default router;
