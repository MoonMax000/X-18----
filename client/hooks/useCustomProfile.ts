// useCustomProfile - Hook for managing user profile data from Custom Backend
import { useState, useEffect, useCallback } from 'react';
import { customBackendAPI, type User } from '@/services/api/custom-backend';

interface UseCustomProfileReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
}

export function useCustomProfile(userId?: string): UseCustomProfileReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      // Load current user if no userId provided
      try {
        const currentUser = await customBackendAPI.getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        console.error('Error loading current user:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user');
        setUser(null);
      }
    } else {
      // Load specific user
      try {
        const userData = await customBackendAPI.getUser(userId);
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, [userId]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadProfile();
  }, [loadProfile]);

  const followUser = useCallback(async (targetUserId: string) => {
    try {
      await customBackendAPI.followUser(targetUserId);
      await refresh();
    } catch (err) {
      console.error('Error following user:', err);
      throw err;
    }
  }, [refresh]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    try {
      await customBackendAPI.unfollowUser(targetUserId);
      await refresh();
    } catch (err) {
      console.error('Error unfollowing user:', err);
      throw err;
    }
  }, [refresh]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    user,
    isLoading,
    error,
    refresh,
    followUser,
    unfollowUser,
  };
}
