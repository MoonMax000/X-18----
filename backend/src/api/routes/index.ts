import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import stripeRoutes from './stripe.routes';
import stripeConnectRoutes from './stripeConnect.routes';
import paymentMethodsRoutes from './paymentMethods.routes';
import notificationsRoutes from './notifications.routes';
import apiKeysRoutes from './apiKeys.routes';
import kycRoutes from './kyc.routes';
import referralsRoutes from './referrals.routes';
import monetizationRoutes from './monetization.routes';
import billingRoutes from './billing.routes';

const router = Router();

// Auth routes (public)
router.use('/auth', authRoutes);

// All other routes require authentication (see individual route files)
router.use('/profile', profileRoutes);
router.use('/stripe-settings', stripeRoutes);
router.use('/stripe-connect', stripeConnectRoutes);
router.use('/payment-methods', paymentMethodsRoutes);
router.use('/notification-settings', notificationsRoutes);
router.use('/api-keys', apiKeysRoutes);
router.use('/kyc', kycRoutes);
router.use('/referrals', referralsRoutes);
router.use('/monetization', monetizationRoutes);
router.use('/billing', billingRoutes);

export default router;
