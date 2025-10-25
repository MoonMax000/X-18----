import Stripe from 'stripe';
import { prisma } from '../../database/client';
import { encrypt, decrypt } from '../../utils/crypto';

interface StripeSettingsUpdate {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
}

class StripeServiceClass {
  /**
   * Get Stripe settings for user
   */
  async getSettings(userId: string) {
    const settings = await prisma.stripeSettings.findUnique({
      where: { userId },
    });
    
    if (!settings) {
      return null;
    }
    
    // Decrypt keys if they exist
    return {
      ...settings,
      secretKey: settings.secretKey ? decrypt(settings.secretKey) : null,
      publishableKey: settings.publishableKey,
      webhookSecret: settings.webhookSecret ? decrypt(settings.webhookSecret) : null,
    };
  }

  /**
   * Update Stripe settings
   */
  async updateSettings(userId: string, data: StripeSettingsUpdate) {
    // Encrypt sensitive keys
    const encryptedData: any = {};
    
    if (data.secretKey) {
      encryptedData.secretKey = encrypt(data.secretKey);
    }
    
    if (data.publishableKey) {
      encryptedData.publishableKey = data.publishableKey;
    }
    
    if (data.webhookSecret) {
      encryptedData.webhookSecret = encrypt(data.webhookSecret);
    }
    
    // Test connection before saving
    if (data.secretKey) {
      await this.testStripeKey(data.secretKey);
    }
    
    // Upsert settings
    const settings = await prisma.stripeSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...encryptedData,
        isActive: true,
      },
      update: {
        ...encryptedData,
        isActive: true,
        updatedAt: new Date(),
      },
    });
    
    return {
      ...settings,
      secretKey: data.secretKey || null,
      publishableKey: data.publishableKey || settings.publishableKey,
      webhookSecret: data.webhookSecret || null,
    };
  }

  /**
   * Delete Stripe settings
   */
  async deleteSettings(userId: string) {
    await prisma.stripeSettings.delete({
      where: { userId },
    });
  }

  /**
   * Test Stripe connection
   */
  async testConnection(userId: string) {
    const settings = await this.getSettings(userId);
    
    if (!settings?.secretKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    try {
      const stripe = new Stripe(settings.secretKey, {
        apiVersion: '2023-10-16',
      });
      
      // Test API call
      const account = await stripe.account.retrieve();
      
      // Update stripe account ID
      await prisma.stripeSettings.update({
        where: { userId },
        data: {
          stripeAccountId: account.id,
          onboardingComplete: true,
        },
      });
      
      return {
        success: true,
        accountId: account.id,
        email: account.email,
        country: account.country,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
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
    const settings = await this.getSettings(userId);
    
    if (!settings?.secretKey) {
      throw new Error('Stripe not configured');
    }
    
    const stripe = new Stripe(settings.secretKey, {
      apiVersion: '2023-10-16',
    });
    
    const account = await stripe.account.retrieve();
    
    return {
      id: account.id,
      email: account.email,
      country: account.country,
      currency: account.default_currency,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
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
      
      await stripe.account.retrieve();
      return true;
    } catch (error: any) {
      throw new Error(`Invalid Stripe key: ${error.message}`);
    }
  }

  /**
   * Get Stripe client for user
   */
  async getStripeClient(userId: string): Promise<Stripe> {
    const settings = await this.getSettings(userId);
    
    if (!settings?.secretKey) {
      throw new Error('Stripe not configured for this user');
    }
    
    return new Stripe(settings.secretKey, {
      apiVersion: '2023-10-16',
    });
  }
}

export const stripeService = new StripeServiceClass();
