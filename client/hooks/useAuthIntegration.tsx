import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook for integrating authentication with existing modal windows
 * Usage in LoginModal, SignUpModal, VerificationModal
 */
export function useAuthIntegration() {
  const {
    login,
    signup,
    verifyCode,
    requestPasswordReset,
    resetPassword
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Handle signup
   */
  const handleSignup = async (data: {
    email?: string;
    phone?: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signup(data);
      
      if (result.success) {
        return {
          success: true,
          userId: result.userId
        };
      } else {
        setError(result.error || 'Signup failed');
        return { success: false };
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle login
   */
  const handleLogin = async (emailOrPhone: string, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await login(emailOrPhone, password);
      
      if (result.success) {
        if (result.requires2FA) {
          return {
            success: true,
            requires2FA: true,
            userId: result.userId,
            maskedContact: result.maskedContact
          };
        } else {
          return { success: true, requires2FA: false };
        }
      } else {
        setError(result.error || 'Login failed');
        return { success: false };
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle code verification
   */
  const handleVerifyCode = async (
    userId: string,
    code: string,
    type: 'email_verification' | 'phone_verification' | '2fa'
  ) => {
    setIsLoading(true);
    setError('');

    try {
      const success = await verifyCode(userId, code, type);
      
      if (!success) {
        setError('Invalid code. Please try again.');
      }
      
      return success;
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle password reset request
   */
  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    setError('');

    try {
      const success = await requestPasswordReset(email);
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle password reset
   */
  const handleResetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError('');

    try {
      const success = await resetPassword(token, newPassword);
      
      if (!success) {
        setError('Failed to reset password');
      }
      
      return success;
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    setError,
    handleSignup,
    handleLogin,
    handleVerifyCode,
    handleForgotPassword,
    handleResetPassword
  };
}
