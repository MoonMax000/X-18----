import { useState, useCallback } from 'react';
import { authAPI } from '@/services/api/auth';
import type { 
  LoginRequest, 
  SignUpRequest, 
  AuthResponse,
  VerifyCodeRequest,
  ResetPasswordRequest 
} from '@/types/api';

/**
 * Authentication hook for API integration
 * Ready to connect to backend API
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login with email or phone
   */
  const login = useCallback(async (data: LoginRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(data);
      
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign up with email or phone
   */
  const signUp = useCallback(async (data: SignUpRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.signUp(data);
      
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify email or phone with code
   */
  const verifyCode = useCallback(async (data: VerifyCodeRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authAPI.verifyCode(data);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async (identifier: string, method: 'email' | 'phone'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authAPI.requestPasswordReset({ identifier, method });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset request failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password with code
   */
  const resetPassword = useCallback(async (data: ResetPasswordRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authAPI.resetPassword(data);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback((): boolean => {
    return !!localStorage.getItem('auth_token');
  }, []);

  /**
   * Get current user
   */
  const getCurrentUser = useCallback(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  return {
    login,
    signUp,
    verifyCode,
    requestPasswordReset,
    resetPassword,
    logout,
    isAuthenticated,
    getCurrentUser,
    isLoading,
    error,
  };
}
