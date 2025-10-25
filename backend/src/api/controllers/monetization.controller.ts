import { Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../../database/client';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

class MonetizationController {
  /**
   * Get earnings summary
   * GET /api/v1/monetization/earnings
   */
  async getEarnings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { startDate, endDate, groupBy = 'day' } = req.query;

      // Get transactions for this user
      const where: any = { userId: userId };
      
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      // Total earnings
      const earnings = await prisma.transaction.aggregate({
        where,
        _sum: {
          amount: true,
          fee: true,
        },
        _count: true,
      });

      // Earnings by type
      const earningsByType = await prisma.transaction.groupBy({
        by: ['type'],
        where,
        _sum: {
          amount: true,
        },
      });

      // Available balance (from Stripe Connect)
      let availableBalance = 0;
      const stripeAccount = await prisma.stripeConnectAccount.findUnique({
        where: { userId },
        select: { stripeAccountId: true },
      });

      if (stripeAccount) {
        try {
          const balance = await stripe.balance.retrieve({
            stripeAccount: stripeAccount.stripeAccountId,
          });
          availableBalance = balance.available[0]?.amount || 0;
        } catch (err) {
          logger.warn('Failed to fetch Stripe balance:', err);
        }
      }

      res.json({
        earnings: {
          totalEarnings: earnings._sum.amount || 0,
          platformFees: earnings._sum.fee || 0,
          netEarnings: (earnings._sum.amount || 0) - (earnings._sum.fee || 0),
          transactionCount: earnings._count,
          availableBalance,
          earningsByType: earningsByType.map(e => ({
            type: e.type,
            amount: e._sum.amount || 0,
          })),
        },
      });
    } catch (error) {
      logger.error('Get earnings error:', error);
      next(error);
    }
  }

  /**
   * Get detailed analytics
   * GET /api/v1/monetization/analytics
   */
  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Subscriber count
      const subscriberCount = await prisma.subscription.count({
        where: {
          subscribedToId: userId,
          status: 'active',
        },
      });

      // Post purchases
      const postPurchases = await prisma.transaction.count({
        where: {
          userId: userId,
          type: 'post_purchase',
        },
      });

      // Tips received
      const tipsReceived = await prisma.transaction.aggregate({
        where: {
          userId: userId,
          type: 'tip',
        },
        _sum: { amount: true },
        _count: true,
      });

      res.json({
        analytics: {
          subscriberCount,
          postPurchases,
          tipsCount: tipsReceived._count,
          totalTipsAmount: tipsReceived._sum.amount || 0,
        },
      });
    } catch (error) {
      logger.error('Get analytics error:', error);
      next(error);
    }
  }

  /**
   * Request payout
   * POST /api/v1/monetization/payout
   */
  async requestPayout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { amount, currency = 'usd', method = 'stripe' } = req.body;

      // Get Stripe Connect account
      const stripeAccount = await prisma.stripeConnectAccount.findUnique({
        where: { userId },
      });

      if (!stripeAccount) {
        return res.status(400).json({
          error: 'Stripe account not connected',
          message: 'Please connect your Stripe account first',
        });
      }

      if (!stripeAccount.payoutsEnabled) {
        return res.status(400).json({
          error: 'Payouts not enabled',
          message: 'Your Stripe account is not enabled for payouts',
        });
      }

      // Create payout record
      const payout = await prisma.payout.create({
        data: {
          userId,
          amount,
          currency,
          method,
          status: 'pending',
        },
      });

      // Trigger Stripe payout (if using Stripe)
      if (method === 'stripe') {
        try {
          await stripe.payouts.create(
            {
              amount,
              currency,
            },
            {
              stripeAccount: stripeAccount.stripeAccountId,
            }
          );

          await prisma.payout.update({
            where: { id: payout.id },
            data: { status: 'processing' },
          });
        } catch (stripeError: any) {
          logger.error('Stripe payout error:', stripeError);
          await prisma.payout.update({
            where: { id: payout.id },
            data: { 
              status: 'failed',
              failureReason: stripeError.message,
            },
          });
          throw stripeError;
        }
      }

      logger.info(`Payout requested for user: ${userId}, amount: ${amount}`);

      res.json({
        message: 'Payout requested successfully',
        payout: {
          id: payout.id,
          amount: payout.amount,
          currency: payout.currency,
          status: payout.status,
          createdAt: payout.createdAt,
        },
      });
    } catch (error) {
      logger.error('Request payout error:', error);
      next(error);
    }
  }

  /**
   * Get payout history
   * GET /api/v1/monetization/payouts
   */
  async getPayoutHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const payouts = await prisma.payout.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({ payouts });
    } catch (error) {
      logger.error('Get payout history error:', error);
      next(error);
    }
  }

  /**
   * Create Stripe Checkout session
   * POST /api/v1/monetization/create-checkout
   */
  async createCheckoutSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        type,
        postId,
        authorId,
        amount,
        plan,
        successUrl,
        cancelUrl,
      } = req.body;

      // Get author's Stripe Connect account
      const targetUserId = authorId || userId;
      const stripeAccount = await prisma.stripeConnectAccount.findUnique({
        where: { userId: targetUserId },
      });

      if (!stripeAccount) {
        return res.status(400).json({
          error: 'Stripe account not connected',
          message: 'The creator has not connected their Stripe account',
        });
      }

      // Get or create Stripe customer
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      let stripeCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId },
      });

      if (!stripeCustomer) {
        const customer = await stripe.customers.create({
          email: user!.email,
        });

        stripeCustomer = await prisma.stripeCustomer.create({
          data: {
            userId,
            stripeCustomerId: customer.id,
          },
        });
      }

      // Create Stripe Checkout Session
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: stripeCustomer.stripeCustomerId,
        mode: type === 'subscription' ? 'subscription' : 'payment',
        success_url: successUrl || `${FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${FRONTEND_URL}/payment/cancel`,
        metadata: {
          userId,
          type,
          ...(postId && { postId }),
          ...(authorId && { authorId }),
        },
      };

      if (type === 'subscription') {
        // TODO: Create price object in Stripe for subscription plans
        sessionParams.line_items = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan} Subscription`,
            },
            recurring: {
              interval: plan === 'yearly' ? 'year' : 'month',
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        }];
      } else {
        // One-time payment
        sessionParams.line_items = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: type === 'tip' ? 'Tip' : 'Unlock Content',
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        }];
        sessionParams.payment_intent_data = {
          application_fee_amount: Math.floor(amount * 0.1 * 100), // 10% platform fee
          transfer_data: {
            destination: stripeAccount.stripeAccountId,
          },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      logger.info(`Checkout session created: ${session.id} for user: ${userId}`);

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error: any) {
      logger.error('Create checkout session error:', error);
      next(error);
    }
  }
}

export const monetizationController = new MonetizationController();
