import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '../lib/auth-fetch';

interface UserStats {
  posts_this_month: number;
  posts_change: number;
  total_likes: number;
  likes_change: number;
  total_comments: number;
  comments_change: number;
  total_followers: number;
  followers_change: number;
}

interface Activity {
  type: 'like' | 'comment' | 'follow' | 'post';
  user: string;
  username: string;
  action: string;
  created_at: string;
}

interface TopPost {
  id: string;
  content: string;
  likes_count: number;
  replies_count: number;
  retweets_count: number;
  created_at: string;
}

interface GrowthData {
  date: string;
  count: number;
}

export function useProfileStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [followerGrowth, setFollowerGrowth] = useState<GrowthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await authFetch.fetch('/users/me/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    }
  }, []);

  const fetchActivity = useCallback(async (limit: number = 10) => {
    try {
      const response = await authFetch.fetch(`/users/me/activity?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setActivity(data.activities || []);
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
    }
  }, []);

  const fetchTopPosts = useCallback(async (limit: number = 10) => {
    try {
      const response = await authFetch.fetch(`/users/me/top-posts?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setTopPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching top posts:', err);
    }
  }, []);

  const fetchFollowerGrowth = useCallback(async (period: 'week' | 'month' = 'month') => {
    try {
      const response = await authFetch.fetch(`/users/me/follower-growth?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setFollowerGrowth(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching follower growth:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStats(),
        fetchActivity(5),
        fetchTopPosts(3),
        fetchFollowerGrowth('month'),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats, fetchActivity, fetchTopPosts, fetchFollowerGrowth]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    stats,
    activity,
    topPosts,
    followerGrowth,
    isLoading,
    error,
    refetchStats: fetchStats,
    refetchActivity: fetchActivity,
    refetchTopPosts: fetchTopPosts,
    refetchFollowerGrowth: fetchFollowerGrowth,
    refetch: loadAll,
  };
}
