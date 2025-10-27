import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { customAuth } from '@/services/auth/custom-backend-auth';

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

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, display_name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = customAuth.getCurrentUser();
        const token = customAuth.getAccessToken();

        if (storedUser && token) {
          // Verify token is still valid by fetching current user
          try {
            const freshUser = await customAuth.getCurrentUserFromAPI(token);
            setUser(freshUser);
          } catch (error) {
            // Token might be expired, try refresh
            try {
              const refreshed = await customAuth.refreshToken();
              setUser(refreshed.user);
            } catch {
              // Refresh failed, clear auth
              await customAuth.logout();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await customAuth.login({ email, password });
    setUser(response.user);
  };

  const register = async (username: string, email: string, password: string, display_name?: string) => {
    const response = await customAuth.register({ username, email, password, display_name });
    setUser(response.user);
  };

  const logout = async () => {
    await customAuth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const token = customAuth.getAccessToken();
    if (token) {
      try {
        const freshUser = await customAuth.getCurrentUserFromAPI(token);
        setUser(freshUser);
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
