import { useState, useEffect, useCallback } from 'react';
import { customBackendAPI, type Post } from '@/services/api/custom-backend';

interface UseUserPostsOptions {
  limit?: number;
  autoLoad?: boolean;
}

interface UseUserPostsReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useUserPosts(
  userId: string | undefined,
  options: UseUserPostsOptions = {}
): UseUserPostsReturn {
  const { limit = 20, autoLoad = true } = options;
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (loadMore = false) => {
    if (!userId) {
      setPosts([]);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params: any = { limit };
      
      // For pagination, use the last post ID as cursor
      if (loadMore && posts.length > 0) {
        params.max_id = posts[posts.length - 1].id;
      }

      const newPosts = await customBackendAPI.getUserPosts(userId, params);

      if (loadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      // Check if there are more posts to load
      setHasMore(newPosts.length === limit);
    } catch (err) {
      console.error('[useUserPosts] Error loading posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit, posts.length]);

  const refresh = useCallback(async () => {
    await loadPosts(false);
  }, [loadPosts]);

  const handleLoadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await loadPosts(true);
    }
  }, [isLoading, hasMore, loadPosts]);

  // Auto-load on mount or when userId changes
  useEffect(() => {
    if (autoLoad) {
      loadPosts(false);
    }
  }, [userId, autoLoad]); // Intentionally not including loadPosts to avoid infinite loop

  return {
    posts,
    isLoading,
    error,
    refresh,
    loadMore: handleLoadMore,
    hasMore,
  };
}
