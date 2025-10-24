// useGTSNotifications - Hook for fetching and managing notifications from GoToSocial
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getNotifications,
  type GTSNotification 
} from '@/services/api/gotosocial';

type NotificationFilter = GTSNotification['type'] | 'all';

interface UseGTSNotificationsOptions {
  filter?: NotificationFilter;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseGTSNotificationsReturn {
  notifications: GTSNotification[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  unreadCount: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export function useGTSNotifications(options: UseGTSNotificationsOptions = {}): UseGTSNotificationsReturn {
  const { filter = 'all', limit = 20, autoRefresh = false, refreshInterval = 30000 } = options;

  const [notifications, setNotifications] = useState<GTSNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const latestIdRef = useRef<string | null>(null);
  const oldestIdRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async (maxId?: string, minId?: string) => {
    try {
      const types = filter === 'all' ? undefined : [filter];
      const data = await getNotifications({
        max_id: maxId,
        min_id: minId,
        limit,
        types,
      });
      return data;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      throw err;
    }
  }, [filter, limit]);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchNotifications();
      
      if (data.length > 0) {
        latestIdRef.current = data[0].id;
        oldestIdRef.current = data[data.length - 1].id;
      }

      setNotifications(data);
      setHasMore(data.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [fetchNotifications, limit]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !oldestIdRef.current) return;

    setIsLoadingMore(true);

    try {
      const data = await fetchNotifications(oldestIdRef.current);
      
      if (data.length > 0) {
        oldestIdRef.current = data[data.length - 1].id;
        setNotifications(prev => [...prev, ...data]);
        setHasMore(data.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchNotifications, isLoadingMore, hasMore, limit]);

  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => new Set(prev).add(id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(new Set(notifications.map(n => n.id)));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  // Initial load
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    refreshTimerRef.current = setInterval(() => {
      loadInitial();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadInitial]);

  return {
    notifications,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    unreadCount,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
