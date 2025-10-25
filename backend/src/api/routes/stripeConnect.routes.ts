import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { stripeConnectController } from '../controllers/stripeConnect.controller';

const router = Router();

/**
 * @route   GET /api/v1/stripe-connect/oauth-url
 * @desc    Get Stripe Connect OAuth URL
 * @access  Private
 */
router.get('/oauth-url', authenticate, stripeConnectController.getOAuthUrl);

/**
 * @route   GET /api/v1/stripe-connect/callback
 * @desc    Handle Stripe Connect OAuth callback (from Stripe redirect)
 * @access  Public (uses state parameter for user identification)
 */
router.get('/callback', stripeConnectController.handleCallbackGet);

/**
 * @route   POST /api/v1/stripe-connect/callback
 * @desc    Handle Stripe Connect OAuth callback (legacy)
 * @access  Private
 */
router.post('/callback', authenticate, stripeConnectController.handleCallback);

/**
 * @route   GET /api/v1/stripe-connect/account
 * @desc    Get connected Stripe account info
 * @access  Private
 */
router.get('/account', authenticate, stripeConnectController.getAccount);

/**
 * @route   DELETE /api/v1/stripe-connect/account
 * @desc    Disconnect Stripe account
 * @access  Private
 */
router.delete('/account', authenticate, stripeConnectController.disconnectAccount);

/**
 * @route   GET /api/v1/stripe-connect/dashboard-link
 * @desc    Get Stripe dashboard link
 * @access  Private
 */
router.get('/dashboard-link', authenticate, stripeConnectController.getDashboardLink);

/**
 * @route   GET /api/v1/stripe-connect/balance
 * @desc    Get account balance
 * @access  Private
 */
router.get('/balance', authenticate, stripeConnectController.getBalance);

export default router;
