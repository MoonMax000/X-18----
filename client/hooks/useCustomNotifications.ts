// useCustomNotifications - Hook for managing notifications from Custom Backend
import { useState, useEffect, useCallback, useRef } from 'react';
import { customBackendAPI, type Notification, type PaginationParams } from '@/services/api/custom-backend';
import { authFetch } from '@/lib/auth-fetch';
import { DEBUG } from '@/lib/debug';
import { useAuth } from '@/contexts/AuthContext';

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
  isAuthenticated: boolean;
}

export function useCustomNotifications(
  options: UseCustomNotificationsOptions = {}
): UseCustomNotificationsReturn {
  const { limit = 20, autoRefresh = false, refreshInterval = 60000 } = options;
  const { user, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Изменено на false по умолчанию
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadUnreadCount = useCallback(async () => {
    // Пропускаем если не авторизован
    if (!isAuthenticated || !authFetch.hasToken()) {
      DEBUG.log('NOTIFICATIONS', 'Skipping unread count - not authenticated');
      setUnreadCount(0);
      return;
    }

    try {
      const result = await customBackendAPI.getUnreadCount();
      setUnreadCount(result.count);
    } catch (err) {
      DEBUG.log('NOTIFICATIONS', 'Error loading unread count', err);
      // Не показываем ошибку пользователю для фоновых запросов
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

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
    DEBUG.log('NOTIFICATIONS', 'loadInitial called', { isAuthenticated });
    
    // Пропускаем загрузку если не авторизован
    if (!isAuthenticated || !authFetch.hasToken()) {
      DEBUG.log('NOTIFICATIONS', 'Skipping initial load - not authenticated');
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      DEBUG.log('NOTIFICATIONS', 'Fetching notifications', { limit });
      const [notifs, countResult] = await Promise.all([
        loadNotifications({ limit, offset: 0 }),
        customBackendAPI.getUnreadCount(),
      ]);

      DEBUG.log('NOTIFICATIONS', 'Loaded notifications', { 
        count: notifs?.length,
        unreadCount: countResult.count 
      });

      setNotifications(notifs || []);
      setUnreadCount(countResult.count);
      setHasMore(notifs.length === limit);
      setOffset(notifs.length);
    } catch (err) {
      DEBUG.log('NOTIFICATIONS', 'Error loading notifications', err);
      
      // Для 401 ошибок не показываем ошибку UI
      if (err instanceof Error && err.message.includes('401')) {
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      }
      
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [limit, loadNotifications, isAuthenticated]);

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

  // Initial load при изменении состояния авторизации
  useEffect(() => {
    if (isAuthenticated) {
      loadInitial();
    } else {
      // Очищаем данные при выходе
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
    }
  }, [loadInitial, isAuthenticated]);

  // Auto-refresh только для авторизованных
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated) return;

    refreshTimerRef.current = setInterval(() => {
      loadUnreadCount();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadUnreadCount, isAuthenticated]);

  // Слушаем событие logout
  useEffect(() => {
    const handleLogout = () => {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

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
    isAuthenticated,
  };
}
