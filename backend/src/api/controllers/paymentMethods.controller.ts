import { Response, NextFunction } from 'express';
import { stripeCustomerService } from '../../services/stripe/stripeCustomer.service';
import { AuthRequest } from '../middleware/auth';

class PaymentMethodsController {
  /**
   * Create Setup Intent
   */
  async createSetupIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await stripeCustomerService.createSetupIntent(userId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { paymentMethodId, setupIntentId } = req.body;

      let paymentMethod;

      if (setupIntentId) {
        // Add via Setup Intent (recommended)
        paymentMethod = await stripeCustomerService.confirmSetupIntent(userId, setupIntentId);
      } else if (paymentMethodId) {
        // Add directly via payment method ID
        paymentMethod = await stripeCustomerService.addPaymentMethod(userId, paymentMethodId);
      } else {
        return res.status(400).json({ error: 'paymentMethodId or setupIntentId required' });
      }
      
      res.json({
        message: 'Payment method added successfully',
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          brand: paymentMethod.brand,
          last4: paymentMethod.last4,
          expMonth: paymentMethod.expMonth,
          expYear: paymentMethod.expYear,
          isDefault: paymentMethod.isDefault,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List payment methods
   */
  async listPaymentMethods(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const paymentMethods = await stripeCustomerService.listPaymentMethods(userId);
      
      res.json({
        paymentMethods: paymentMethods.map(pm => ({
          id: pm.id,
          type: pm.type,
          brand: pm.brand,
          last4: pm.last4,
          expMonth: pm.expMonth,
          expYear: pm.expYear,
          isDefault: pm.isDefault,
          createdAt: pm.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      
      await stripeCustomerService.removePaymentMethod(userId, id);
      
      res.json({ message: 'Payment method removed successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      
      await stripeCustomerService.setDefaultPaymentMethod(userId, id);
      
      res.json({ message: 'Default payment method updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentMethodsController = new PaymentMethodsController();
