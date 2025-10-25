import { Response, NextFunction } from 'express';
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
        stripeAccountId: settings?.stripeAccountId || null,
        isActive: settings?.isActive || false,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Stripe keys
   * NOTE: Not implemented - use StripeConnectAccount instead
   */
  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.status(501).json({
        error: 'Not implemented',
        message: 'Use Stripe Connect integration instead'
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
