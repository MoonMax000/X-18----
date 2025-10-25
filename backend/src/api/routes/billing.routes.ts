import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { billingController } from '../controllers/billing.controller';
import {
  getInvoicesSchema,
  updatePlanSchema,
  cancelSubscriptionSchema,
} from '../validators/billing.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/billing/invoices
 * @desc    Get billing invoices
 * @access  Private
 */
router.get(
  '/invoices',
  validateRequest(getInvoicesSchema),
  billingController.getInvoices
);

/**
 * @route   GET /api/v1/billing/subscription
 * @desc    Get current subscription
 * @access  Private
 */
router.get('/subscription', billingController.getSubscription);

/**
 * @route   PUT /api/v1/billing/subscription
 * @desc    Update subscription plan
 * @access  Private
 */
router.put(
  '/subscription',
  validateRequest(updatePlanSchema),
  billingController.updatePlan
);

/**
 * @route   DELETE /api/v1/billing/subscription
 * @desc    Cancel subscription
 * @access  Private
 */
router.delete(
  '/subscription',
  validateRequest(cancelSubscriptionSchema),
  billingController.cancelSubscription
);

/**
 * @route   GET /api/v1/billing/payment-methods
 * @desc    Get payment methods
 * @access  Private
 */
router.get('/payment-methods', billingController.getPaymentMethods);

export default router;
