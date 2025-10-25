import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { stripeController } from '../controllers/stripe.controller';
import { updateStripeKeysSchema } from '../validators/stripe.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/stripe-settings
 * @desc    Get Stripe settings (без секретных ключей)
 * @access  Private
 */
router.get('/', stripeController.getSettings);

/**
 * @route   PUT /api/v1/stripe-settings
 * @desc    Update Stripe keys
 * @access  Private
 */
router.put(
  '/',
  validateRequest(updateStripeKeysSchema),
  stripeController.updateSettings
);

/**
 * @route   DELETE /api/v1/stripe-settings
 * @desc    Remove Stripe integration
 * @access  Private
 */
router.delete('/', stripeController.deleteSettings);

/**
 * @route   POST /api/v1/stripe-settings/test
 * @desc    Test Stripe connection
 * @access  Private
 */
router.post('/test', stripeController.testConnection);

/**
 * @route   GET /api/v1/stripe-settings/account
 * @desc    Get Stripe account info
 * @access  Private
 */
router.get('/account', stripeController.getAccountInfo);

export default router;
