import { useState, useCallback, useRef, useEffect } from 'react';
import type { Post } from '@/services/api/custom-backend';

interface UseInfiniteScrollOptions {
  fetchFunction: (cursor?: string) => Promise<Post[]>;
  pageSize?: number;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  posts: Post[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
  observerTarget: (node: HTMLDivElement | null) => void;
}

/**
 * Hook для реализации infinite scroll с cursor-based pagination
 * 
 * @param fetchFunction - Функция загрузки постов, принимает cursor (ID последнего поста)
 * @param pageSize - Количество постов за один запрос (default: 20)
 * @param enabled - Включен ли infinite scroll (default: true)
 */
export function useInfiniteScroll({
  fetchFunction,
  pageSize = 20,
  enabled = true,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);

  // Начальная загрузка
  const initialLoad = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newPosts = await fetchFunction();
      setPosts(newPosts);
      setHasMore(newPosts.length >= pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      console.error('[useInfiniteScroll] Initial load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, pageSize, enabled]);

  // Загрузка следующей страницы
  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || loadingRef.current || posts.length === 0) {
      return;
    }

    loadingRef.current = true;
    setIsFetchingMore(true);
    setError(null);

    try {
      // Используем ID последнего поста как cursor
      const lastPost = posts[posts.length - 1];
      const cursor = lastPost.id;

      const newPosts = await fetchFunction(cursor);
      
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        // Фильтруем дубликаты
        const existingIds = new Set(posts.map(p => p.id));
        const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
        
        setPosts(prev => [...prev, ...uniqueNewPosts]);
        setHasMore(newPosts.length >= pageSize);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      console.error('[useInfiniteScroll] Load more error:', err);
    } finally {
      setIsFetchingMore(false);
      loadingRef.current = false;
    }
  }, [fetchFunction, hasMore, posts, pageSize, enabled]);

  // Refresh - очищаем и загружаем заново
  const refresh = useCallback(async () => {
    setPosts([]);
    setHasMore(true);
    await initialLoad();
  }, [initialLoad]);

  // Intersection Observer для автоматической подгрузки
  const observerTarget = useCallback((node: HTMLDivElement | null) => {
    if (!enabled || isLoading) return;

    // Отключаем предыдущий observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Создаём новый observer
    if (node && hasMore) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loadingRef.current) {
            console.log('[useInfiniteScroll] Loading more posts...');
            loadMore();
          }
        },
        {
          rootMargin: '200px', // Начинаем загрузку за 200px до конца
          threshold: 0.1,
        }
      );

      observerRef.current.observe(node);
    }
  }, [enabled, isLoading, hasMore, loadMore]);

  // Начальная загрузка при mount
  useEffect(() => {
    initialLoad();
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [initialLoad]);

  return {
    posts,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    observerTarget,
  };
}
