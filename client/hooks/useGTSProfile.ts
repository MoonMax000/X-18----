// useGTSProfile - Hook for fetching and managing profile data from GoToSocial
import { useState, useEffect, useCallback } from 'react';
import { 
  getAccount, 
  getAccountByUsername, 
  getAccountStatuses, 
  getAccountFollowers, 
  getAccountFollowing,
  followAccount,
  unfollowAccount,
  getRelationships,
  type GTSAccount, 
  type GTSStatus,
  type GTSRelationship 
} from '@/services/api/gotosocial';

interface UseGTSProfileOptions {
  username?: string;
  userId?: string;
  fetchStatuses?: boolean;
  fetchFollowers?: boolean;
  fetchFollowing?: boolean;
}

interface UseGTSProfileReturn {
  profile: GTSAccount | null;
  statuses: GTSStatus[];
  followers: GTSAccount[];
  following: GTSAccount[];
  relationship: GTSRelationship | null;
  isLoading: boolean;
  error: string | null;
  isFollowing: boolean;
  toggleFollow: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useGTSProfile(options: UseGTSProfileOptions): UseGTSProfileReturn {
  const [profile, setProfile] = useState<GTSAccount | null>(null);
  const [statuses, setStatuses] = useState<GTSStatus[]>([]);
  const [followers, setFollowers] = useState<GTSAccount[]>([]);
  const [following, setFollowing] = useState<GTSAccount[]>([]);
  const [relationship, setRelationship] = useState<GTSRelationship | null>(null);
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
      let profileData: GTSAccount;
      if (options.userId) {
        profileData = await getAccount(options.userId);
      } else if (options.username) {
        profileData = await getAccountByUsername(options.username);
      } else {
        throw new Error('No identifier provided');
      }
      
      setProfile(profileData);

      // Fetch relationship
      const [relationshipData] = await getRelationships([profileData.id]);
      setRelationship(relationshipData);

      // Fetch statuses if requested
      if (options.fetchStatuses) {
        const statusesData = await getAccountStatuses(profileData.id, { limit: 20 });
        setStatuses(statusesData);
      }

      // Fetch followers if requested
      if (options.fetchFollowers) {
        const followersData = await getAccountFollowers(profileData.id, { limit: 100 });
        setFollowers(followersData);
      }

      // Fetch following if requested
      if (options.fetchFollowing) {
        const followingData = await getAccountFollowing(profileData.id, { limit: 100 });
        setFollowing(followingData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options.username, options.userId, options.fetchStatuses, options.fetchFollowers, options.fetchFollowing]);

  const toggleFollow = useCallback(async () => {
    if (!profile) return;

    try {
      let newRelationship: GTSRelationship;
      if (relationship?.following) {
        newRelationship = await unfollowAccount(profile.id);
      } else {
        newRelationship = await followAccount(profile.id);
      }
      setRelationship(newRelationship);
    } catch (err) {
      console.error('Error toggling follow:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle follow');
    }
  }, [profile, relationship]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    statuses,
    followers,
    following,
    relationship,
    isLoading,
    error,
    isFollowing: relationship?.following ?? false,
    toggleFollow,
    refetch: fetchProfile,
  };
}
