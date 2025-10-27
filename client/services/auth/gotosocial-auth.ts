interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
  created_at: number;
}

interface OAuthClient {
  client_id: string;
  client_secret: string;
}

interface UserAccount {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  locked: boolean;
  bot: boolean;
  created_at: string;
  note: string;
  url: string;
  avatar: string;
  header: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  email?: string;
}

class GoToSocialAuthService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  private clientId: string | null = null;
  private clientSecret: string | null = null;

  /**
   * Initialize OAuth application
   * Creates a new OAuth app if one doesn't exist in localStorage
   */
  async initializeApp(): Promise<void> {
    // Check if OAuth client already exists
    const stored = localStorage.getItem('gts_oauth_client');
    if (stored) {
      try {
        const { client_id, client_secret } = JSON.parse(stored) as OAuthClient;
        this.clientId = client_id;
        this.clientSecret = client_secret;
        console.log('✅ OAuth client loaded from localStorage');
        return;
      } catch (error) {
        console.warn('Failed to parse stored OAuth client, creating new one');
        localStorage.removeItem('gts_oauth_client');
      }
    }

    // Create new OAuth application
    console.log('Creating new OAuth application...');
    const response = await fetch(`${this.baseUrl}/api/v1/apps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'Tyrian Trading Platform',
        redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
        scopes: 'read write follow',
        website: window.location.origin,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create OAuth app');
    }

    const data = await response.json();
    this.clientId = data.client_id;
    this.clientSecret = data.client_secret;

    // Store OAuth client credentials
    localStorage.setItem(
      'gts_oauth_client',
      JSON.stringify({
        client_id: data.client_id,
        client_secret: data.client_secret,
      })
    );

    console.log('✅ OAuth application created successfully');
  }

  /**
   * Register a new user account
   * @param params - Registration parameters (username, email, password)
   * @returns Auth response with access token
   */
  async register({ username, email, password }: RegisterParams): Promise<AuthResponse> {
    console.log('=== GoToSocial Registration ===');
    console.log('Username:', username);
    console.log('Email:', email);

    const response = await fetch(`${this.baseUrl}/api/v1/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        password,
        agreement: true,
        locale: 'en',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Registration failed:', error);
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    console.log('✅ Registration successful');
    return data;
  }

  /**
   * Login with email and password using OAuth Password Grant
   * @param params - Login parameters (email, password)
   * @returns Auth response with access token
   */
  async login({ email, password }: LoginParams): Promise<AuthResponse> {
    console.log('=== GoToSocial Login ===');
    console.log('Email:', email);

    // Initialize OAuth app if needed
    await this.initializeApp();

    if (!this.clientId || !this.clientSecret) {
      throw new Error('OAuth app not initialized');
    }

    // Request access token using password grant
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      username: email,
      password: password,
      scope: 'read write follow',
    });

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Login failed:', error);
      throw new Error(error.error_description || error.error || 'Login failed');
    }

    const data = await response.json();
    console.log('✅ Login successful');
    return data;
  }

  /**
   * Verify user credentials with the provided access token
   * @param token - Access token
   * @returns User account information
   */
  async verifyCredentials(token: string): Promise<UserAccount> {
    const response = await fetch(`${this.baseUrl}/api/v1/accounts/verify_credentials`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to verify credentials:', error);
      throw new Error('Failed to verify credentials');
    }

    const data = await response.json();
    console.log('✅ Credentials verified:', data.username);
    return data;
  }

  /**
   * Get current user from localStorage
   * @returns User account or null if not logged in
   */
  getCurrentUser(): UserAccount | null {
    const stored = localStorage.getItem('gts_user');
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
    return localStorage.getItem('gts_token');
  }

  /**
   * Check if user is currently logged in
   * @returns true if user has valid token
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Logout the current user
   * Clears token and user data from localStorage
   */
  logout(): void {
    localStorage.removeItem('gts_token');
    localStorage.removeItem('gts_user');
    console.log('✅ User logged out');
  }
}

// Export singleton instance
export const gtsAuth = new GoToSocialAuthService();
