import { useState, useCallback } from 'react';
import { customBackendAPI } from '@/services/api/custom-backend';
import { useAuth } from '@/contexts/AuthContext';

interface UseFollowReturn {
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  isFollowing: (userId: string) => boolean;
  followingState: Record<string, boolean>;
  isLoading: Record<string, boolean>;
}

export function useFollow(initialFollowingState: Record<string, boolean> = {}): UseFollowReturn {
  console.log('[useFollow] Initializing with state:', initialFollowingState);
  const [followingState, setFollowingState] = useState<Record<string, boolean>>(initialFollowingState);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  const followUser = useCallback(async (userId: string): Promise<boolean> => {
    console.log('[useFollow] followUser called:', { userId, currentState: followingState[userId] });
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    if (userId === user.id) {
      console.error('Cannot follow yourself');
      return false;
    }

    try {
      setIsLoading(prev => ({ ...prev, [userId]: true }));
      
      await customBackendAPI.followUser(userId);
      
      setFollowingState(prev => ({ ...prev, [userId]: true }));
      return true;
    } catch (error) {
      console.error('Failed to follow user:', error);
      return false;
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, [user]);

  const unfollowUser = useCallback(async (userId: string): Promise<boolean> => {
    console.log('[useFollow] unfollowUser called:', { userId, currentState: followingState[userId] });
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    try {
      setIsLoading(prev => ({ ...prev, [userId]: true }));
      
      await customBackendAPI.unfollowUser(userId);
      
      setFollowingState(prev => ({ ...prev, [userId]: false }));
      return true;
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      return false;
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, [user]);

  const isFollowing = useCallback((userId: string): boolean => {
    const result = followingState[userId] ?? false;
    console.log('[useFollow] isFollowing check:', { userId, result, allState: followingState });
    return result;
  }, [followingState]);

  return {
    followUser,
    unfollowUser,
    isFollowing,
    followingState,
    isLoading,
  };
}
