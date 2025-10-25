import Stripe from 'stripe';
import { prisma } from '../../database/client';

interface StripeSettingsUpdate {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
}

class StripeServiceClass {
  /**
   * Get Stripe settings for user
   * NOTE: StripeSettings model doesn't exist in schema
   * Using StripeConnectAccount instead
   */
  async getSettings(userId: string) {
    const account = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    });
    
    if (!account) {
      return null;
    }
    
    return {
      stripeAccountId: account.stripeAccountId,
      isActive: account.isActive,
    };
  }

  /**
   * Update Stripe settings
   * NOTE: This is a placeholder since StripeSettings doesn't exist
   */
  async updateSettings(userId: string, data: StripeSettingsUpdate) {
    throw new Error('Stripe settings update not implemented - use StripeConnectAccount instead');
  }

  /**
   * Delete Stripe settings
   */
  async deleteSettings(userId: string) {
    throw new Error('Stripe settings deletion not implemented - use StripeConnectAccount instead');
  }

  /**
   * Test Stripe connection
   */
  async testConnection(userId: string) {
    const account = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    });
    
    if (!account?.stripeAccountId) {
      throw new Error('Stripe account not connected');
    }
    
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-10-16',
      });
      
      // Retrieve the Connect account
      const stripeAccount = await stripe.accounts.retrieve(account.stripeAccountId);
      
      return {
        success: true,
        accountId: stripeAccount.id,
        email: stripeAccount.email,
        country: stripeAccount.country,
        chargesEnabled: stripeAccount.charges_enabled,
        payoutsEnabled: stripeAccount.payouts_enabled,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get Stripe account info
   */
  async getAccountInfo(userId: string) {
    const account = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    });
    
    if (!account?.stripeAccountId) {
      throw new Error('Stripe not configured');
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
    
    const stripeAccount = await stripe.accounts.retrieve(account.stripeAccountId);
    
    return {
      id: stripeAccount.id,
      email: stripeAccount.email,
      country: stripeAccount.country,
      currency: stripeAccount.default_currency,
      chargesEnabled: stripeAccount.charges_enabled,
      payoutsEnabled: stripeAccount.payouts_enabled,
      detailsSubmitted: stripeAccount.details_submitted,
    };
  }

  /**
   * Test Stripe key validity
   */
  private async testStripeKey(secretKey: string) {
    try {
      const stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
      
      await stripe.balance.retrieve();
      return true;
    } catch (error: any) {
      throw new Error(`Invalid Stripe key: ${error.message}`);
    }
  }

  /**
   * Get Stripe client for platform
   */
  async getStripeClient(): Promise<Stripe> {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('Stripe not configured - missing STRIPE_SECRET_KEY');
    }
    
    return new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }
}

export const stripeService = new StripeServiceClass();
