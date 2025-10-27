// useCustomNotifications - Hook for managing notifications from Custom Backend
import { useState, useEffect, useCallback, useRef } from 'react';
import { customBackendAPI, type Notification, type PaginationParams } from '@/services/api/custom-backend';

interface UseCustomNotificationsOptions {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseCustomNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export function useCustomNotifications(
  options: UseCustomNotificationsOptions = {}
): UseCustomNotificationsReturn {
  const { limit = 20, autoRefresh = false, refreshInterval = 60000 } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const result = await customBackendAPI.getUnreadCount();
      setUnreadCount(result.count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  }, []);

  const loadNotifications = useCallback(async (params: PaginationParams) => {
    try {
      const data = await customBackendAPI.getNotifications(params);
      return data;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      throw err;
    }
  }, []);

  const loadInitial = useCallback(async () => {
    console.log('[useCustomNotifications] loadInitial called');
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useCustomNotifications] Fetching notifications with limit:', limit);
      const [notifs, countResult] = await Promise.all([
        loadNotifications({ limit, offset: 0 }),
        customBackendAPI.getUnreadCount(),
      ]);

      console.log('[useCustomNotifications] Received notifications:', notifs);
      console.log('[useCustomNotifications] Notifications count:', notifs?.length);
      console.log('[useCustomNotifications] Unread count:', countResult.count);
      
      if (notifs && notifs.length > 0) {
        console.log('[useCustomNotifications] First notification:', notifs[0]);
        console.log('[useCustomNotifications] First notification actor:', notifs[0]?.actor);
      }

      setNotifications(notifs);
      setUnreadCount(countResult.count);
      setHasMore(notifs.length === limit);
      setOffset(notifs.length);
    } catch (err) {
      console.error('[useCustomNotifications] Error loading notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [limit, loadNotifications]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const data = await loadNotifications({ limit, offset });

      if (data.length > 0) {
        setNotifications(prev => [...prev, ...data]);
        setOffset(prev => prev + data.length);
        setHasMore(data.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setIsLoadingMore(false);
    }
  }, [loadNotifications, isLoadingMore, hasMore, limit, offset]);

  const refresh = useCallback(async () => {
    setOffset(0);
    await loadInitial();
  }, [loadInitial]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await customBackendAPI.markNotificationAsRead(id);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      
      // Update unread count
      await loadUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [loadUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      await customBackendAPI.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await customBackendAPI.deleteNotification(id);
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      // Update unread count
      await loadUnreadCount();
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [loadUnreadCount]);

  // Initial load
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    refreshTimerRef.current = setInterval(() => {
      loadUnreadCount();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
