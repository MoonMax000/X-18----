// useCustomUserProfile - Hook for fetching user profiles from custom backend
import { useState, useEffect, useCallback, useMemo } from 'react';
import { customBackendAPI, type User, type Post } from '@/services/api/custom-backend';
import { useAuth } from '@/contexts/AuthContext';

interface UseCustomUserProfileOptions {
  username?: string;
  userId?: string;
  fetchPosts?: boolean;
  fetchFollowers?: boolean;
  fetchFollowing?: boolean;
}

interface UseCustomUserProfileReturn {
  profile: User | null;
  posts: Post[];
  followers: User[];
  following: User[];
  isFollowing: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCustomUserProfile(options: UseCustomUserProfileOptions): UseCustomUserProfileReturn {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
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
        // Remove @ if present
        const cleanUsername = options.username.replace('@', '');
        profileData = await customBackendAPI.getUserByUsername(cleanUsername);
      } else {
        throw new Error('No identifier provided');
      }
      
      setProfile(profileData);

      // Fetch posts if requested
      if (options.fetchPosts) {
        const postsData = await customBackendAPI.getUserPosts(profileData.id, { limit: 20 });
        setPosts(postsData);
      }

      // Fetch followers if requested
      if (options.fetchFollowers) {
        const followersData = await customBackendAPI.getFollowers(profileData.id, { limit: 100 });
        setFollowers(followersData);
      }

      // Fetch following if requested
      if (options.fetchFollowing) {
        const followingData = await customBackendAPI.getFollowing(profileData.id, { limit: 100 });
        setFollowing(followingData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options.username, options.userId, options.fetchPosts, options.fetchFollowers, options.fetchFollowing]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Check if current user is following this profile
  const isFollowing = useMemo(() => {
    console.log('[useCustomUserProfile] Computing isFollowing:', {
      profile: profile?.id,
      followersCount: followers.length,
      followers: followers.map(f => ({ id: f.id, username: f.username }))
    });
    
    if (!profile || !followers.length) {
      console.log('[useCustomUserProfile] No profile or no followers, returning false');
      return false;
    }
    
    // Check if current user's ID is in the followers list  
    const currentUserId = currentUser?.id;
    console.log('[useCustomUserProfile] Current user ID from useAuth:', currentUserId);
    console.log('[useCustomUserProfile] Current user:', currentUser);
    
    if (!currentUserId) {
      console.log('[useCustomUserProfile] No current user ID, returning false');
      return false;
    }
    
    const result = followers.some(f => f.id === currentUserId);
    console.log('[useCustomUserProfile] isFollowing result:', result);
    return result;
  }, [profile, followers, currentUser]);

  return {
    profile,
    posts,
    followers,
    following,
    isFollowing,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
