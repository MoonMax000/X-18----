import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (data: SignupData) => Promise<SignupResult>;
  logout: () => Promise<void>;
  verifyCode: (userId: string, code: string, type: VerificationType) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updatedUser: Partial<User>) => void;
}

interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
  userId?: string;
  maskedContact?: string;
  error?: string;
}

interface SignupResult {
  success: boolean;
  userId?: string;
  error?: string;
}

interface SignupData {
  email?: string;
  phone?: string;
  password: string;
}

type VerificationType = 'email_verification' | 'phone_verification' | '2fa';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize user state from localStorage immediately to persist across HMR
const getInitialUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Failed to parse stored user:', error);
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token and refresh if needed on mount
  useEffect(() => {
    const loadUser = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (accessToken && storedUser) {
        // Don't try to refresh on every HMR - just verify we have tokens
        // Token will be refreshed automatically when API calls fail
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<LoginResult> => {
    try {
      const isEmail = emailOrPhone.includes('@');
      const response = await authApi.login({
        email: isEmail ? emailOrPhone : undefined,
        phone: isEmail ? undefined : emailOrPhone,
        password
      });

      if (response.requires2FA) {
        // In development, log 2FA code to console
        console.log('🔐 2FA Code (DEV MODE): 111111');
        console.log('💡 In development, the code is always 111111');

        return {
          success: true,
          requires2FA: true,
          userId: response.userId,
          maskedContact: response.maskedContact
        };
      }

      if (response.accessToken && response.user) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken!);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const signup = async (data: SignupData): Promise<SignupResult> => {
    try {
      const response = await authApi.signup(data);
      return {
        success: response.success,
        userId: response.userId
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Signup failed'
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const verifyCode = async (
    userId: string,
    code: string,
    type: VerificationType
  ): Promise<boolean> => {
    try {
      const response = await authApi.verifyCode({ userId, code, type });
      return response.success;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const response = await authApi.requestPasswordReset(email);
      return response.success;
    } catch (error) {
      console.error('Password reset request error:', error);
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await authApi.resetPassword(token, newPassword);
      return response.success;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) return false;

      const response = await authApi.refreshToken(refreshTokenValue);
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // Only logout if we get a 401/403 - token is actually invalid
      // Don't logout on network errors or other issues during development
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('Token is invalid, logging out...');
        await logout();
      } else {
        console.log('Token refresh failed, but keeping user logged in (might be a temporary network issue)');
      }
      return false;
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    verifyCode,
    requestPasswordReset,
    resetPassword,
    refreshToken,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
