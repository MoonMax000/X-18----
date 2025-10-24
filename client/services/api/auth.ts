import type {
  LoginRequest,
  SignUpRequest,
  AuthResponse,
  VerifyCodeRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  APIError,
} from '@/types/api';
import { apiClient } from './client';

/**
 * Authentication API Service
 * Ready to connect to your backend API
 * 
 * TODO: Update BASE_URL in client.ts to your backend URL
 */
export const authAPI = {
  /**
   * Login with email or phone
   * POST /api/auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  },

  /**
   * Sign up with email or phone
   * POST /api/auth/signup
   */
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', data);
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Sign up failed');
    }
  },

  /**
   * Verify email or phone with code
   * POST /api/auth/verify
   */
  async verifyCode(data: VerifyCodeRequest): Promise<void> {
    try {
      await apiClient.post('/auth/verify', data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Verification failed');
    }
  },

  /**
   * Request password reset
   * POST /api/auth/request-reset
   */
  async requestPasswordReset(data: RequestPasswordResetRequest): Promise<void> {
    try {
      await apiClient.post('/auth/request-reset', data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Password reset request failed');
    }
  },

  /**
   * Reset password with code
   * POST /api/auth/reset-password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Password reset failed');
    }
  },

  /**
   * Refresh authentication token
   * POST /api/auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refreshToken,
      });
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Token refresh failed');
    }
  },

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors, clear local storage anyway
      console.error('Logout error:', error);
    }
  },
};
