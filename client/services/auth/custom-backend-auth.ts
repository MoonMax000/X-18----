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
  created_at: string;
}

class CustomBackendAuthService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  /**
   * Register a new user account
   * @param params - Registration parameters (username, email, password)
   * @returns Auth response with access token
   */
  async register({ username, email, password, display_name }: RegisterParams): Promise<AuthResponse> {
    console.log('=== Custom Backend Registration ===');
    console.log('Username:', username);
    console.log('Email:', email);

    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    // Store token and user
    localStorage.setItem('custom_token', data.access_token);
    localStorage.setItem('custom_refresh_token', data.refresh_token);
    localStorage.setItem('custom_user', JSON.stringify(data.user));

    return data;
  }

  /**
   * Login with email and password
   * @param params - Login parameters (email, password)
   * @returns Auth response with access token
   */
  async login({ email, password }: LoginParams): Promise<AuthResponse> {
    console.log('=== Custom Backend Login ===');
    console.log('Email:', email);

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    console.log('✅ Login successful');

    // Store token and user
    localStorage.setItem('custom_token', data.access_token);
    localStorage.setItem('custom_refresh_token', data.refresh_token);
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
   * @returns Access token or null if not logged in
   */
  getAccessToken(): string | null {
    return localStorage.getItem('custom_token');
  }

  /**
   * Get refresh token from localStorage
   * @returns Refresh token or null if not logged in
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('custom_refresh_token');
  }

  /**
   * Check if user is currently logged in
   * @returns true if user has valid token
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Refresh access token
   * @returns New auth response
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Token refresh failed:', error);
      this.logout(); // Clear invalid tokens
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    console.log('✅ Token refreshed successfully');

    // Update stored tokens
    localStorage.setItem('custom_token', data.access_token);
    localStorage.setItem('custom_refresh_token', data.refresh_token);
    if (data.user) {
      localStorage.setItem('custom_user', JSON.stringify(data.user));
    }

    return data;
  }

  /**
   * Logout the current user
   * Clears token and user data from localStorage
   */
  async logout(): Promise<void> {
    const token = this.getAccessToken();
    
    // Call backend logout endpoint if token exists
    if (token) {
      try {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }

    // Clear local storage
    localStorage.removeItem('custom_token');
    localStorage.removeItem('custom_refresh_token');
    localStorage.removeItem('custom_user');
    console.log('✅ User logged out');
  }
}

// Export singleton instance
export const customAuth = new CustomBackendAuthService();
