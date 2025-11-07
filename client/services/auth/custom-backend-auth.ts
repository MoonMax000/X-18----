interface RegisterParams {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface AuthResponse {
  user: UserAccount;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  requires_2fa?: boolean;
}

interface UserAccount {
  id: string;
  username: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  header_url: string;
  verified: boolean;
  subscription_price: number;
  followers_count: number;
  following_count: number;
  posts_count: number;
  private_account: boolean;
  role?: string;
  created_at: string;
}

class CustomBackendAuthService {
  private baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  /**
   * Register a new user account
   * @param params - Registration parameters (username, email, password)
   * @returns Auth response with access token or requires_email_verification flag
   */
  async register({ username, email, password, display_name }: RegisterParams): Promise<any> {
    console.log('=== Custom Backend Registration ===');
    console.log('Username:', username);
    console.log('Email:', email);

    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Включаем cookies
      body: JSON.stringify({
        username,
        email,
        password,
        display_name: display_name || username,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Registration failed:', error);
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    console.log('✅ Registration successful');

    // Проверяем требуется ли email verification
    if (data.requires_email_verification) {
      console.log('📧 Email verification required');
      return data; // Возвращаем без сохранения токенов
    }

    // Старая логика - если вернулись токены (для обратной совместимости)
    if (data.access_token) {
      localStorage.setItem('custom_token', data.access_token);
      localStorage.setItem('custom_user', JSON.stringify(data.user));
    }

    return data;
  }

  /**
   * Verify email with code
   * @param email - User email
   * @param code - Verification code from email
   * @returns Auth response with tokens
   */
  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    console.log('=== Custom Backend Email Verification ===');
    console.log('Email:', email);

    const response = await fetch(`${this.baseUrl}/auth/verify/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email,
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Email verification failed:', error);
      throw new Error(error.error || 'Verification failed');
    }

    const data = await response.json();
    console.log('✅ Email verified successfully');

    // Сохраняем токены ТОЛЬКО после успешной verification
    localStorage.setItem('custom_token', data.access_token);
    localStorage.setItem('custom_user', JSON.stringify(data.user));

    return data;
  }

  /**
   * Login with email and password
   * @param params - Login parameters (email, password)
   * @returns Auth response with user data (tokens are in httpOnly cookies)
   */
  async login({ email, password }: LoginParams): Promise<AuthResponse> {
    console.log('=== Custom Backend Login ===');
    console.log('Email:', email);

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Cookies will be set automatically
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Login failed:', error);
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    console.log('✅ Login successful - tokens in httpOnly cookies');

    // Store ONLY user data for UI (NOT tokens)
    localStorage.setItem('custom_user', JSON.stringify(data.user));

    return data;
  }

  /**
   * Get current user information
   * @param token - Access token
   * @returns User account information
   */
  async getCurrentUserFromAPI(token: string): Promise<UserAccount> {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to get current user:', error);
      throw new Error('Failed to get current user');
    }

    const data = await response.json();
    console.log('✅ Current user retrieved:', data.username);
    return data;
  }

  /**
   * Get current user from localStorage
   * @returns User account or null if not logged in
   */
  getCurrentUser(): UserAccount | null {
    const stored = localStorage.getItem('custom_user');
    if (!stored) return null;

    try {
      return JSON.parse(stored) as UserAccount;
    } catch {
      return null;
    }
  }

  /**
   * Get current access token from localStorage
   * @returns Always null (tokens are in httpOnly cookies now)
   * @deprecated Tokens are now in httpOnly cookies, not localStorage
   */
  getAccessToken(): string | null {
    return null;
  }

  /**
   * Get refresh token from localStorage
   * @returns Always null (tokens are in httpOnly cookies now)
   * @deprecated Tokens are now in httpOnly cookies, not localStorage
   */
  getRefreshToken(): string | null {
    return null;
  }

  /**
   * Check if user is currently logged in
   * @returns true if user data exists in localStorage
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Refresh access token using httpOnly cookie
   * @returns New auth response with updated user data
   */
  async refreshToken(): Promise<AuthResponse> {
    // Предотвращаем множественные одновременные запросы обновления
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((_token: string) => {
          // Tokens are in cookies, we just need user data
          const user = this.getCurrentUser();
          resolve({
            user: user!,
            access_token: '', // Not used
            refresh_token: '', // Not used
            token_type: 'Bearer',
            expires_in: 900,
          } as AuthResponse);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send httpOnly cookies (refresh_token)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Token refresh failed:', error);
        this.logout(); // Clear user data
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      console.log('✅ Token refreshed successfully - new access_token in cookie');

      // Update user data if provided
      if (data.user) {
        localStorage.setItem('custom_user', JSON.stringify(data.user));
      }

      // Уведомляем всех ожидающих
      this.refreshSubscribers.forEach((callback) => callback('refreshed'));
      this.refreshSubscribers = [];

      return data;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Добавить перехватчик для автоматического обновления токена
   * @param originalRequest - Функция для повторного выполнения запроса
   * @returns Promise с результатом
   */
  async withTokenRefresh<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        try {
          await this.refreshToken();
          return await request();
        } catch (refreshError) {
          throw refreshError;
        }
      }
      throw error;
    }
  }

  /**
   * Logout the current user
   * Clears user data from localStorage and httpOnly cookies via backend
   */
  async logout(): Promise<void> {
    // Call backend logout endpoint to clear httpOnly cookies
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies to be cleared
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }

    // Clear local storage (only user data, no tokens)
    localStorage.removeItem('custom_user');
    console.log('✅ User logged out - cookies cleared');
  }
}

// Export singleton instance
export const customAuth = new CustomBackendAuthService();
