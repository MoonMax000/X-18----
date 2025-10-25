import { Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../../database/client';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

class BillingController {
  /**
   * Get billing invoices
   * GET /api/v1/billing/invoices
   */
  async getInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { limit = '10', startingAfter, status } = req.query;

      // Get Stripe customer
      const stripeCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId },
      });

      if (!stripeCustomer) {
        return res.json({ invoices: [] });
      }

      // Fetch invoices from Stripe
      const invoices = await stripe.invoices.list({
        customer: stripeCustomer.stripeCustomerId,
        limit: parseInt(limit as string),
        starting_after: startingAfter as string,
        ...(status && { status: status as any }),
      });

      res.json({
        invoices: invoices.data.map(invoice => ({
          id: invoice.id,
          number: invoice.number,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: invoice.status,
          date: new Date(invoice.created * 1000),
          dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
          pdfUrl: invoice.invoice_pdf,
          hostedUrl: invoice.hosted_invoice_url,
        })),
        hasMore: invoices.has_more,
      });
    } catch (error) {
      logger.error('Get invoices error:', error);
      next(error);
    }
  }

  /**
   * Get current subscription
   * GET /api/v1/billing/subscription
   */
  async getSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get active subscriptions from database
      const subscriptions = await prisma.subscription.findMany({
        where: {
          subscriberId: userId,
          status: 'active',
        },
        include: {
          subscribedTo: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });

      // Get Stripe customer
      const stripeCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId },
      });

      let stripeSubscriptions: any[] = [];

      if (stripeCustomer) {
        try {
          const subs = await stripe.subscriptions.list({
            customer: stripeCustomer.stripeCustomerId,
            status: 'active',
          });

          stripeSubscriptions = subs.data.map(sub => ({
            id: sub.id,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            plan: sub.items.data[0]?.price.recurring?.interval,
            amount: sub.items.data[0]?.price.unit_amount || 0,
            currency: sub.items.data[0]?.price.currency,
          }));
        } catch (err) {
          logger.warn('Failed to fetch Stripe subscriptions:', err);
        }
      }

      res.json({
        subscriptions,
        stripeSubscriptions,
      });
    } catch (error) {
      logger.error('Get subscription error:', error);
      next(error);
    }
  }

  /**
   * Update subscription plan
   * PUT /api/v1/billing/subscription
   */
  async updatePlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { plan, priceId } = req.body;

      // Get Stripe customer
      const stripeCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId },
      });

      if (!stripeCustomer) {
        return res.status(404).json({
          error: 'No active subscription found',
        });
      }

      // Get active subscription from Stripe
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomer.stripeCustomerId,
        status: 'active',
        limit: 1,
      });

      if (subs.data.length === 0) {
        return res.status(404).json({
          error: 'No active subscription found',
        });
      }

      const subscription = subs.data[0];

      // Update subscription
      const updated = await stripe.subscriptions.update(subscription.id, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
        proration_behavior: 'always_invoice',
      });

      logger.info(`Subscription updated for user: ${userId}, plan: ${plan}`);

      res.json({
        message: 'Subscription plan updated successfully',
        subscription: {
          id: updated.id,
          status: updated.status,
          currentPeriodEnd: new Date(updated.current_period_end * 1000),
          plan: updated.items.data[0]?.price.recurring?.interval,
        },
      });
    } catch (error: any) {
      logger.error('Update subscription plan error:', error);
      next(error);
    }
  }

  /**
   * Cancel subscription
   * DELETE /api/v1/billing/subscription
   */
  async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { reason, feedback, cancelAtPeriodEnd = true } = req.body;

      // Get Stripe customer
      const stripeCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId },
      });

      if (!stripeCustomer) {
        return res.status(404).json({
          error: 'No active subscription found',
        });
      }

      // Get active subscription from Stripe
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomer.stripeCustomerId,
        status: 'active',
        limit: 1,
      });

      if (subs.data.length === 0) {
        return res.status(404).json({
          error: 'No active subscription found',
        });
      }

      const subscription = subs.data[0];

      // Cancel subscription
      let canceled;
      if (cancelAtPeriodEnd) {
        // Cancel at end of current period
        canceled = await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
          metadata: {
            cancellation_reason: reason || 'User requested',
            cancellation_feedback: feedback || '',
          },
        });
      } else {
        // Cancel immediately
        canceled = await stripe.subscriptions.cancel(subscription.id);
      }

      // Update database
      await prisma.subscription.updateMany({
        where: {
          subscriberId: userId,
          status: 'active',
        },
        data: {
          status: cancelAtPeriodEnd ? 'canceling' : 'canceled',
          canceledAt: new Date(),
        },
      });

      logger.info(`Subscription canceled for user: ${userId}, reason: ${reason}`);

      res.json({
        message: cancelAtPeriodEnd
          ? 'Subscription will be canceled at the end of the current period'
          : 'Subscription canceled successfully',
        subscription: {
          id: canceled.id,
          status: canceled.status,
          cancelAtPeriodEnd: canceled.cancel_at_period_end,
          currentPeriodEnd: new Date(canceled.current_period_end * 1000),
        },
      });
    } catch (error: any) {
      logger.error('Cancel subscription error:', error);
      next(error);
    }
  }

  /**
   * Get payment methods
   * GET /api/v1/billing/payment-methods
   */
  async getPaymentMethods(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get Stripe customer
      const stripeCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId },
      });

      if (!stripeCustomer) {
        return res.json({ paymentMethods: [] });
      }

      // Get payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomer.stripeCustomerId,
        type: 'card',
      });

      res.json({
        paymentMethods: paymentMethods.data.map(pm => ({
          id: pm.id,
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
          isDefault: pm.id === stripeCustomer.defaultPaymentMethodId,
        })),
      });
    } catch (error) {
      logger.error('Get payment methods error:', error);
      next(error);
    }
  }
}

export const billingController = new BillingController();
