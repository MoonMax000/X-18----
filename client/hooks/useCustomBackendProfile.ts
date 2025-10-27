// useCustomBackendProfile - Hook for fetching profile data from Custom Backend
import { useState, useEffect, useCallback } from 'react';
import { customBackendAPI, type User } from '@/services/api/custom-backend';

interface UseCustomBackendProfileOptions {
  username?: string;
  userId?: string;
  fetchFollowers?: boolean;
  fetchFollowing?: boolean;
}

interface UseCustomBackendProfileReturn {
  profile: User | null;
  followers: User[];
  following: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCustomBackendProfile(
  options: UseCustomBackendProfileOptions
): UseCustomBackendProfileReturn {
  const [profile, setProfile] = useState<User | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!options.username && !options.userId) {
      setError('Username or userId required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch profile
      let profileData: User;
      if (options.userId) {
        profileData = await customBackendAPI.getUser(options.userId);
      } else if (options.username) {
        profileData = await customBackendAPI.getUserByUsername(options.username);
      } else {
        throw new Error('No identifier provided');
      }
      
      setProfile(profileData);

      // Fetch followers if requested
      if (options.fetchFollowers) {
        try {
          const followersData = await customBackendAPI.getFollowers(profileData.id, { 
            limit: 100 
          });
          setFollowers(followersData);
        } catch (err) {
          console.error('Error fetching followers:', err);
          setFollowers([]);
        }
      }

      // Fetch following if requested
      if (options.fetchFollowing) {
        try {
          const followingData = await customBackendAPI.getFollowing(profileData.id, { 
            limit: 100 
          });
          setFollowing(followingData);
        } catch (err) {
          console.error('Error fetching following:', err);
          setFollowing([]);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    options.username, 
    options.userId, 
    options.fetchFollowers, 
    options.fetchFollowing
  ]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    followers,
    following,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
