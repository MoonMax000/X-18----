// Stripe Connect API client for frontend
import { backendApi } from './backend';

class StripeConnectApi {
  /**
   * Get Stripe Connect OAuth URL
   * User will be redirected to this URL to connect their Stripe account
   */
  async getOAuthUrl(): Promise<{ url: string }> {
    const response = await fetch(`${backendApi.API_BASE}/stripe-connect/oauth-url`, {
      headers: backendApi.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get OAuth URL');
    }

    return response.json();
  }

  /**
   * Handle OAuth callback after redirect
   */
  async handleCallback(code: string, state?: string): Promise<any> {
    const response = await fetch(`${backendApi.API_BASE}/stripe-connect/callback`, {
      method: 'POST',
      headers: {
        ...backendApi.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to connect account' }));
      throw new Error(error.error || 'Failed to connect account');
    }

    return response.json();
  }

  /**
   * Get connected account status
   */
  async getAccount(): Promise<{
    connected: boolean;
    account?: {
      id: string;
      stripeAccountId: string;
      email?: string;
      country?: string;
      defaultCurrency?: string;
      chargesEnabled: boolean;
      payoutsEnabled: boolean;
      detailsSubmitted: boolean;
      createdAt: string;
    };
  }> {
    const response = await fetch(`${backendApi.API_BASE}/stripe-connect/account`, {
      headers: backendApi.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get account');
    }

    return response.json();
  }

  /**
   * Disconnect Stripe account
   */
  async disconnectAccount(): Promise<void> {
    const response = await fetch(`${backendApi.API_BASE}/stripe-connect/account`, {
      method: 'DELETE',
      headers: backendApi.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect account');
    }
  }

  /**
   * Get Stripe dashboard link
   * Opens user's Stripe dashboard
   */
  async getDashboardLink(): Promise<{ url: string }> {
    const response = await fetch(`${backendApi.API_BASE}/stripe-connect/dashboard-link`, {
      headers: backendApi.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get dashboard link');
    }

    return response.json();
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{
    available: Array<{ amount: number; currency: string }>;
    pending: Array<{ amount: number; currency: string }>;
  }> {
    const response = await fetch(`${backendApi.API_BASE}/stripe-connect/balance`, {
      headers: backendApi.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get balance');
    }

    return response.json();
  }

  /**
   * Start Connect flow
   * Redirects user to Stripe OAuth
   */
  async startConnectFlow() {
    const { url } = await this.getOAuthUrl();
    window.location.href = url;
  }
}

export const stripeConnectApi = new StripeConnectApi();
