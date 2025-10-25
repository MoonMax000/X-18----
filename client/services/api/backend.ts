// Backend API client - все запросы к нашему backend серверу
// После переноса backend на отдельный сервер, просто ��бнови BACKEND_URL

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3001';
const API_BASE = `${BACKEND_URL}/api/v1`;

class BackendApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeader(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============================================
  // STRIPE SETTINGS
  // ============================================

  async getStripeSettings() {
    return this.request<{
      hasSecretKey: boolean;
      hasPublishableKey: boolean;
      hasWebhookSecret: boolean;
      publishableKey: string | null;
      stripeAccountId: string | null;
      isActive: boolean;
      onboardingComplete: boolean;
    }>('/stripe-settings');
  }

  async updateStripeSettings(data: {
    secretKey?: string;
    publishableKey?: string;
    webhookSecret?: string;
  }) {
    return this.request('/stripe-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStripeSettings() {
    return this.request('/stripe-settings', {
      method: 'DELETE',
    });
  }

  async testStripeConnection() {
    return this.request<{
      success: boolean;
      accountId?: string;
      email?: string;
      country?: string;
      chargesEnabled?: boolean;
      payoutsEnabled?: boolean;
      error?: string;
    }>('/stripe-settings/test', {
      method: 'POST',
    });
  }

  async getStripeAccountInfo() {
    return this.request<{
      id: string;
      email: string;
      country: string;
      currency: string;
      chargesEnabled: boolean;
      payoutsEnabled: boolean;
      detailsSubmitted: boolean;
    }>('/stripe-settings/account');
  }

  // ============================================
  // PROFILE
  // ============================================

  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
    role?: string;
    sectors?: string[];
  }) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE}/profile/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    return response.json();
  }

  async uploadCover(file: File) {
    const formData = new FormData();
    formData.append('cover', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE}/profile/cover`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload cover');
    }

    return response.json();
  }

  // ============================================
  // NOTIFICATION SETTINGS
  // ============================================

  async getNotificationSettings() {
    return this.request('/notification-settings');
  }

  async updateNotificationSettings(settings: Record<string, boolean>) {
    return this.request('/notification-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ============================================
  // API KEYS
  // ============================================

  async getApiKeys() {
    return this.request<Array<{
      id: string;
      name: string;
      key: string;
      scopes: string[];
      isActive: boolean;
      lastUsedAt: string | null;
      createdAt: string;
    }>>('/api-keys');
  }

  async createApiKey(data: { name: string; scopes: string[] }) {
    return this.request<{ id: string; name: string; key: string }>('/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteApiKey(id: string) {
    return this.request(`/api-keys/${id}`, {
      method: 'DELETE',
    });
  }

  async regenerateApiKey(id: string) {
    return this.request<{ key: string }>(`/api-keys/${id}/regenerate`, {
      method: 'PUT',
    });
  }

  // ============================================
  // MONETIZATION
  // ============================================

  async getMonetizationStats() {
    return this.request('/monetization/stats');
  }

  async getRevenueData(range: '1M' | '3M' | '1Y' = '1M') {
    return this.request(`/monetization/revenue?range=${range}`);
  }

  async getTransactions(page = 1, limit = 20) {
    return this.request(`/monetization/transactions?page=${page}&limit=${limit}`);
  }

  async requestPayout(amount: number, method: string) {
    return this.request('/monetization/payout', {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    });
  }

  // ============================================
  // BILLING
  // ============================================

  async getPaymentMethods() {
    return this.request('/billing/payment-methods');
  }

  async addPaymentMethod(paymentMethodId: string) {
    return this.request('/billing/payment-methods', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId }),
    });
  }

  async deletePaymentMethod(id: string) {
    return this.request(`/billing/payment-methods/${id}`, {
      method: 'DELETE',
    });
  }

  async getInvoices() {
    return this.request('/billing/invoices');
  }

  async getSubscription() {
    return this.request('/billing/subscription');
  }

  // ============================================
  // KYC
  // ============================================

  async getKycStatus() {
    return this.request('/kyc/status');
  }

  async submitKyc(data: any) {
    return this.request('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadKycDocument(file: File, type: string) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE}/kyc/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    return response.json();
  }

  // ============================================
  // REFERRALS
  // ============================================

  async getReferralStats() {
    return this.request('/referrals/stats');
  }

  async getReferralList() {
    return this.request('/referrals/list');
  }

  async generateReferralLink() {
    return this.request('/referrals/generate-link', {
      method: 'POST',
    });
  }
}

export const backendApi = new BackendApiClient();
