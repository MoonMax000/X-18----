import { Request, Response, NextFunction } from 'express';
import { stripeService } from '../../services/stripe/stripe.service';
import { AuthRequest } from '../middleware/auth';

class StripeController {
  /**
   * Get Stripe settings (without secret keys)
   */
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const settings = await stripeService.getSettings(userId);
      
      res.json({
        hasSecretKey: !!settings?.secretKey,
        hasPublishableKey: !!settings?.publishableKey,
        hasWebhookSecret: !!settings?.webhookSecret,
        publishableKey: settings?.publishableKey || null,
        stripeAccountId: settings?.stripeAccountId || null,
        isActive: settings?.isActive || false,
        onboardingComplete: settings?.onboardingComplete || false,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Stripe keys
   */
  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { secretKey, publishableKey, webhookSecret } = req.body;
      
      const settings = await stripeService.updateSettings(userId, {
        secretKey,
        publishableKey,
        webhookSecret,
      });
      
      res.json({
        message: 'Stripe settings updated successfully',
        hasSecretKey: !!settings.secretKey,
        hasPublishableKey: !!settings.publishableKey,
        hasWebhookSecret: !!settings.webhookSecret,
        publishableKey: settings.publishableKey,
        isActive: settings.isActive,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Stripe settings
   */
  async deleteSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await stripeService.deleteSettings(userId);
      
      res.json({ message: 'Stripe settings deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test Stripe connection
   */
  async testConnection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await stripeService.testConnection(userId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Stripe account info
   */
  async getAccountInfo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const accountInfo = await stripeService.getAccountInfo(userId);
      
      res.json(accountInfo);
    } catch (error) {
      next(error);
    }
  }
}

export const stripeController = new StripeController();
