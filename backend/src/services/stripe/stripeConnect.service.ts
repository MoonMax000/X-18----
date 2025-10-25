import Stripe from 'stripe';
import { prisma } from '../../database/client';

// Master Stripe client (platform account)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

class StripeConnectService {
  /**
   * Generate Stripe Connect OAuth URL
   * Пользователь будет перенаправлен на Stripe для подключения аккаунта
   */
  generateOAuthUrl(userId: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: STRIPE_CLIENT_ID,
      state: state || userId, // State для защиты от CSRF
      scope: 'read_write', // Полные права на аккаунт
      redirect_uri: `${FRONTEND_URL}/stripe-connect/callback`,
      'stripe_user[email]': '', // Можно передать email пользователя
    });

    return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange OAuth code for Stripe account
   * Вызывается после редиректа с Stripe
   */
  async completeOAuth(userId: string, code: string) {
    try {
      // Exchange code for access token
      const response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code,
      });

      const stripeAccountId = response.stripe_user_id;
      const accessToken = response.access_token;
      const refreshToken = response.refresh_token;
      const scope = response.scope;

      // Get account details
      const account = await stripe.accounts.retrieve(stripeAccountId);

      // Save to database
      const connectAccount = await prisma.stripeConnectAccount.upsert({
        where: { userId },
        create: {
          userId,
          stripeAccountId,
          accessToken,
          refreshToken,
          scope,
          email: account.email || undefined,
          country: account.country || undefined,
          defaultCurrency: account.default_currency || undefined,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted || false,
          isActive: true,
        },
        update: {
          accessToken,
          refreshToken,
          scope,
          email: account.email || undefined,
          country: account.country || undefined,
          defaultCurrency: account.default_currency || undefined,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted || false,
          isActive: true,
          updatedAt: new Date(),
        },
      });

      return connectAccount;
    } catch (error: any) {
      console.error('Stripe Connect OAuth error:', error);
      throw new Error(`Failed to connect Stripe account: ${error.message}`);
    }
  }

  /**
   * Get connected account info
   */
  async getConnectedAccount(userId: string) {
    const connectAccount = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    });

    if (!connectAccount) {
      return null;
    }

    // Refresh account details from Stripe
    try {
      const account = await stripe.accounts.retrieve(connectAccount.stripeAccountId);

      // Update database with latest info
      await prisma.stripeConnectAccount.update({
        where: { userId },
        data: {
          email: account.email || undefined,
          country: account.country || undefined,
          defaultCurrency: account.default_currency || undefined,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted || false,
        },
      });

      return {
        ...connectAccount,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        email: account.email,
      };
    } catch (error) {
      console.error('Failed to refresh Stripe account:', error);
      return connectAccount;
    }
  }

  /**
   * Disconnect Stripe account
   */
  async disconnectAccount(userId: string) {
    const connectAccount = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    });

    if (!connectAccount) {
      throw new Error('Stripe account not connected');
    }

    // Deauthorize on Stripe
    try {
      await stripe.oauth.deauthorize({
        client_id: STRIPE_CLIENT_ID,
        stripe_user_id: connectAccount.stripeAccountId,
      });
    } catch (error) {
      console.error('Failed to deauthorize Stripe account:', error);
    }

    // Delete from database
    await prisma.stripeConnectAccount.delete({
      where: { userId },
    });
  }

  /**
   * Get account dashboard link
   * Allows user to access their Stripe dashboard
   */
  async getAccountDashboardLink(userId: string): Promise<string> {
    const connectAccount = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    });

    if (!connectAccount) {
      throw new Error('Stripe account not connected');
    }

    const link = await stripe.accounts.createLoginLink(connectAccount.stripeAccountId);
    return link.url;
  }

  /**
   * Create payment with platform fee
   * Это вызывается когда кто-то покупает контент автора
   */
  async createPaymentIntent(params: {
    authorUserId: string; // Автор контента (получатель)
    buyerCustomerId: string; // Покупатель (Stripe Customer ID)
    amount: number; // Сумма в центах ($10 = 1000)
    currency?: string;
    description?: string;
    platformFeePercent?: number; // Комиссия платформы (по умолчанию 10%)
  }) {
    const {
      authorUserId,
      buyerCustomerId,
      amount,
      currency = 'usd',
      description,
      platformFeePercent = 10, // 10% комиссия
    } = params;

    // Get author's Stripe Connect account
    const connectAccount = await this.getConnectedAccount(authorUserId);
    
    if (!connectAccount) {
      throw new Error('Author has not connected Stripe account');
    }

    if (!connectAccount.chargesEnabled) {
      throw new Error('Author Stripe account cannot accept charges yet');
    }

    // Calculate platform fee
    const platformFeeAmount = Math.round((amount * platformFeePercent) / 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: buyerCustomerId,
      description: description || 'Content purchase',
      application_fee_amount: platformFeeAmount, // Платформа получает это
      transfer_data: {
        destination: connectAccount.stripeAccountId, // Автор получает остальное
      },
      metadata: {
        authorUserId,
        platformFeePercent: platformFeePercent.toString(),
      },
    });

    return paymentIntent;
  }

  /**
   * Create subscription for author's content
   * Для подписок на автора (месячные/годовые)
   */
  async createSubscription(params: {
    authorUserId: string;
    buyerCustomerId: string;
    priceId: string; // Stripe Price ID (created for author)
    platformFeePercent?: number;
  }) {
    const {
      authorUserId,
      buyerCustomerId,
      priceId,
      platformFeePercent = 10,
    } = params;

    const connectAccount = await this.getConnectedAccount(authorUserId);
    
    if (!connectAccount) {
      throw new Error('Author has not connected Stripe account');
    }

    // Create subscription with platform fee
    const subscription = await stripe.subscriptions.create({
      customer: buyerCustomerId,
      items: [{ price: priceId }],
      application_fee_percent: platformFeePercent, // 10% комиссия на каждый платеж
      transfer_data: {
        destination: connectAccount.stripeAccountId,
      },
    });

    return subscription;
  }

  /**
   * Get balance for connected account
   */
  async getAccountBalance(userId: string) {
    const connectAccount = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    });

    if (!connectAccount) {
      throw new Error('Stripe account not connected');
    }

    const balance = await stripe.balance.retrieve({
      stripeAccount: connectAccount.stripeAccountId,
    });

    return balance;
  }

  /**
   * Request payout to bank account
   */
  async createPayout(userId: string, amount: number, currency = 'usd') {
    const connectAccount = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    });

    if (!connectAccount) {
      throw new Error('Stripe account not connected');
    }

    if (!connectAccount.payoutsEnabled) {
      throw new Error('Payouts not enabled for this account');
    }

    const payout = await stripe.payouts.create(
      {
        amount,
        currency,
      },
      {
        stripeAccount: connectAccount.stripeAccountId,
      }
    );

    return payout;
  }
}

export const stripeConnectService = new StripeConnectService();
