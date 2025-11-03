import { useState, useEffect, useCallback } from 'react';
import { customBackendAPI, User } from '@/services/api/custom-backend';

interface UseSubscriptionsReturn {
  followers: User[];
  following: User[];
  isLoadingFollowers: boolean;
  isLoadingFollowing: boolean;
  error: string | null;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useSubscriptions = (userId?: string): UseSubscriptionsReturn => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowers = useCallback(async () => {
    if (!userId) return;

    setIsLoadingFollowers(true);
    setError(null);

    try {
      console.log('[useSubscriptions] Fetching followers for user:', userId);
      const response = await customBackendAPI.getFollowers(userId, { limit: 100 });
      console.log('[useSubscriptions] Followers response:', response);
      setFollowers(response || []);
    } catch (err: any) {
      console.error('[useSubscriptions] Error fetching followers:', err);
      setError(err.message || 'Failed to fetch followers');
      setFollowers([]);
    } finally {
      setIsLoadingFollowers(false);
    }
  }, [userId]);

  const fetchFollowing = useCallback(async () => {
    if (!userId) return;

    setIsLoadingFollowing(true);
    setError(null);

    try {
      console.log('[useSubscriptions] Fetching following for user:', userId);
      const response = await customBackendAPI.getFollowing(userId, { limit: 100 });
      console.log('[useSubscriptions] Following response:', response);
      setFollowing(response || []);
    } catch (err: any) {
      console.error('[useSubscriptions] Error fetching following:', err);
      setError(err.message || 'Failed to fetch following');
      setFollowing([]);
    } finally {
      setIsLoadingFollowing(false);
    }
  }, [userId]);

  const followUser = useCallback(async (targetUserId: string) => {
    try {
      console.log('[useSubscriptions] Following user:', targetUserId);
      await customBackendAPI.followUser(targetUserId);
      
      // Refresh following list
      await fetchFollowing();
    } catch (err: any) {
      console.error('[useSubscriptions] Error following user:', err);
      throw err;
    }
  }, [fetchFollowing]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    try {
      console.log('[useSubscriptions] Unfollowing user:', targetUserId);
      await customBackendAPI.unfollowUser(targetUserId);
      
      // Refresh following list
      await fetchFollowing();
    } catch (err: any) {
      console.error('[useSubscriptions] Error unfollowing user:', err);
      throw err;
    }
  }, [fetchFollowing]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchFollowers(), fetchFollowing()]);
  }, [fetchFollowers, fetchFollowing]);

  useEffect(() => {
    if (userId) {
      fetchFollowers();
      fetchFollowing();
    }
  }, [userId, fetchFollowers, fetchFollowing]);

  return {
    followers,
    following,
    isLoadingFollowers,
    isLoadingFollowing,
    error,
    followUser,
    unfollowUser,
    refetch,
  };
};
