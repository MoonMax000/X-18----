// useCustomTimeline - Hook for fetching and managing timeline data from Custom Backend
import { useState, useEffect, useCallback, useRef } from 'react';
import { customBackendAPI, type Post, type TimelineParams } from '@/services/api/custom-backend';

type TimelineType = 'home' | 'explore' | 'trending';

interface UseCustomTimelineOptions {
  type: TimelineType;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseCustomTimelineReturn {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  newCount: number;
  loadNew: () => void;
}

export function useCustomTimeline(options: UseCustomTimelineOptions): UseCustomTimelineReturn {
  const { type, limit = 20, autoRefresh = false, refreshInterval = 60000 } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPosts, setNewPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const latestIdRef = useRef<string | null>(null);
  const oldestIdRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTimeline = useCallback(async (params?: TimelineParams): Promise<Post[]> => {
    try {
      let data: Post[];
      
      if (type === 'home') {
        data = await customBackendAPI.getHomeTimeline(params);
      } else if (type === 'explore') {
        data = await customBackendAPI.getExploreTimeline(params);
      } else {
        data = await customBackendAPI.getTrendingPosts({ limit: params?.limit });
      }

      return data;
    } catch (err) {
      console.error('Error fetching timeline:', err);
      throw err;
    }
  }, [type]);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTimeline({ limit });
      
      if (data.length > 0) {
        latestIdRef.current = data[0].id;
        oldestIdRef.current = data[data.length - 1].id;
      }

      setPosts(data);
      setHasMore(data.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setIsLoading(false);
    }
  }, [fetchTimeline, limit]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !oldestIdRef.current) return;

    setIsLoadingMore(true);

    try {
      const data = await fetchTimeline({ 
        limit,
        before: oldestIdRef.current 
      });
      
      if (data.length > 0) {
        oldestIdRef.current = data[data.length - 1].id;
        setPosts(prev => [...prev, ...data]);
        setHasMore(data.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchTimeline, isLoadingMore, hasMore, limit]);

  const checkForNew = useCallback(async () => {
    if (!latestIdRef.current) {
      console.log('[useCustomTimeline] checkForNew: No latestIdRef, skipping');
      return;
    }

    console.log('[useCustomTimeline] checkForNew: Checking for posts after:', latestIdRef.current);

    try {
      const data = await fetchTimeline({ 
        limit,
        after: latestIdRef.current 
      });
      
      console.log('[useCustomTimeline] checkForNew: API returned', data.length, 'posts');
      
      if (data.length > 0) {
        console.log('[useCustomTimeline] checkForNew: New posts detected:', data.map(p => ({
          id: p.id,
          created_at: p.created_at,
          user: p.user?.username
        })));
        
        setNewPosts(prev => {
          // Merge new posts, avoiding duplicates
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = data.filter(p => !existingIds.has(p.id));
          
          console.log('[useCustomTimeline] checkForNew: Adding', uniqueNew.length, 'unique new posts to banner');
          
          return [...uniqueNew, ...prev];
        });
      } else {
        console.log('[useCustomTimeline] checkForNew: No new posts found');
      }
    } catch (err) {
      console.error('[useCustomTimeline] Error checking for new posts:', err);
    }
  }, [fetchTimeline, limit]);

  const loadNew = useCallback(() => {
    if (newPosts.length === 0) return;

    setPosts(prev => {
      // Merge new posts at the top
      const existingIds = new Set(prev.map(p => p.id));
      const uniqueNew = newPosts.filter(p => !existingIds.has(p.id));
      return [...uniqueNew, ...prev];
    });

    if (newPosts.length > 0) {
      latestIdRef.current = newPosts[0].id;
    }

    setNewPosts([]);
  }, [newPosts]);

  const refresh = useCallback(async () => {
    await loadInitial();
    setNewPosts([]);
  }, [loadInitial]);

  // Initial load - only on mount
  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      checkForNew();
    }, refreshInterval);

    return () => {
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval]); // Removed checkForNew from deps to prevent recreation

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    newCount: newPosts.length,
    loadNew,
  };
}
