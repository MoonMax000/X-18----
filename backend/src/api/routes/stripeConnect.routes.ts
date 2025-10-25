import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { stripeConnectController } from '../controllers/stripeConnect.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/stripe-connect/oauth-url
 * @desc    Get Stripe Connect OAuth URL
 * @access  Private
 */
router.get('/oauth-url', stripeConnectController.getOAuthUrl);

/**
 * @route   POST /api/v1/stripe-connect/callback
 * @desc    Handle Stripe Connect OAuth callback
 * @access  Private
 */
router.post('/callback', stripeConnectController.handleCallback);

/**
 * @route   GET /api/v1/stripe-connect/account
 * @desc    Get connected Stripe account info
 * @access  Private
 */
router.get('/account', stripeConnectController.getAccount);

/**
 * @route   DELETE /api/v1/stripe-connect/account
 * @desc    Disconnect Stripe account
 * @access  Private
 */
router.delete('/account', stripeConnectController.disconnectAccount);

/**
 * @route   GET /api/v1/stripe-connect/dashboard-link
 * @desc    Get Stripe dashboard link
 * @access  Private
 */
router.get('/dashboard-link', stripeConnectController.getDashboardLink);

/**
 * @route   GET /api/v1/stripe-connect/balance
 * @desc    Get account balance
 * @access  Private
 */
router.get('/balance', stripeConnectController.getBalance);

export default router;
