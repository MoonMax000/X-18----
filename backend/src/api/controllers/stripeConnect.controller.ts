import { Response, NextFunction } from 'express';
import { stripeConnectService } from '../../services/stripe/stripeConnect.service';
import { AuthRequest } from '../middleware/auth';

class StripeConnectController {
  /**
   * Get Stripe Connect OAuth URL
   */
  async getOAuthUrl(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const url = stripeConnectService.generateOAuthUrl(userId);
      
      res.json({ url });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { code, state } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code required' });
      }

      // Verify state matches userId (CSRF protection)
      if (state && state !== userId) {
        return res.status(400).json({ error: 'Invalid state parameter' });
      }

      const account = await stripeConnectService.completeOAuth(userId, code);
      
      res.json({
        message: 'Stripe account connected successfully',
        account: {
          id: account.id,
          stripeAccountId: account.stripeAccountId,
          email: account.email,
          country: account.country,
          chargesEnabled: account.chargesEnabled,
          payoutsEnabled: account.payoutsEnabled,
          detailsSubmitted: account.detailsSubmitted,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get connected account info
   */
  async getAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const account = await stripeConnectService.getConnectedAccount(userId);
      
      if (!account) {
        return res.json({ connected: false });
      }

      res.json({
        connected: true,
        account: {
          id: account.id,
          stripeAccountId: account.stripeAccountId,
          email: account.email,
          country: account.country,
          defaultCurrency: account.defaultCurrency,
          chargesEnabled: account.chargesEnabled,
          payoutsEnabled: account.payoutsEnabled,
          detailsSubmitted: account.detailsSubmitted,
          createdAt: account.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Disconnect Stripe account
   */
  async disconnectAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await stripeConnectService.disconnectAccount(userId);
      
      res.json({ message: 'Stripe account disconnected successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Stripe dashboard link
   */
  async getDashboardLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const url = await stripeConnectService.getAccountDashboardLink(userId);
      
      res.json({ url });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get account balance
   */
  async getBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const balance = await stripeConnectService.getAccountBalance(userId);
      
      res.json({
        available: balance.available,
        pending: balance.pending,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const stripeConnectController = new StripeConnectController();
