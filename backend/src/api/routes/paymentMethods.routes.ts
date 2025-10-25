import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { paymentMethodsController } from '../controllers/paymentMethods.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/payment-methods/setup-intent
 * @desc    Create Setup Intent for adding card
 * @access  Private
 */
router.post('/setup-intent', paymentMethodsController.createSetupIntent);

/**
 * @route   POST /api/v1/payment-methods
 * @desc    Add payment method after Setup Intent
 * @access  Private
 */
router.post('/', paymentMethodsController.addPaymentMethod);

/**
 * @route   GET /api/v1/payment-methods
 * @desc    List payment methods
 * @access  Private
 */
router.get('/', paymentMethodsController.listPaymentMethods);

/**
 * @route   DELETE /api/v1/payment-methods/:id
 * @desc    Remove payment method
 * @access  Private
 */
router.delete('/:id', paymentMethodsController.removePaymentMethod);

/**
 * @route   PUT /api/v1/payment-methods/:id/default
 * @desc    Set default payment method
 * @access  Private
 */
router.put('/:id/default', paymentMethodsController.setDefaultPaymentMethod);

export default router;
