// useGTSTimeline - Hook for fetching and managing timeline data from GoToSocial
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getHomeTimeline, 
  getPublicTimeline,
  type GTSStatus 
} from '@/services/api/gotosocial';

type TimelineType = 'home' | 'public' | 'local';

interface UseGTSTimelineOptions {
  type: TimelineType;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseGTSTimelineReturn {
  statuses: GTSStatus[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  newCount: number;
  loadNew: () => void;
}

export function useGTSTimeline(options: UseGTSTimelineOptions): UseGTSTimelineReturn {
  const { type, limit = 20, autoRefresh = false, refreshInterval = 60000 } = options;

  const [statuses, setStatuses] = useState<GTSStatus[]>([]);
  const [newStatuses, setNewStatuses] = useState<GTSStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const latestIdRef = useRef<string | null>(null);
  const oldestIdRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTimeline = useCallback(async (maxId?: string, minId?: string): Promise<GTSStatus[]> => {
    try {
      let data: GTSStatus[];
      
      if (type === 'home') {
        data = await getHomeTimeline({ max_id: maxId, min_id: minId, limit });
      } else {
        data = await getPublicTimeline({ 
          local: type === 'local', 
          max_id: maxId, 
          min_id: minId, 
          limit 
        });
      }

      return data;
    } catch (err) {
      console.error('Error fetching timeline:', err);
      throw err;
    }
  }, [type, limit]);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTimeline();
      
      if (data.length > 0) {
        latestIdRef.current = data[0].id;
        oldestIdRef.current = data[data.length - 1].id;
      }

      setStatuses(data);
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
      const data = await fetchTimeline(oldestIdRef.current);
      
      if (data.length > 0) {
        oldestIdRef.current = data[data.length - 1].id;
        setStatuses(prev => [...prev, ...data]);
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
    if (!latestIdRef.current) return;

    try {
      const data = await fetchTimeline(undefined, latestIdRef.current);
      
      if (data.length > 0) {
        setNewStatuses(prev => {
          // Merge new statuses, avoiding duplicates
          const existingIds = new Set(prev.map(s => s.id));
          const uniqueNew = data.filter(s => !existingIds.has(s.id));
          return [...uniqueNew, ...prev];
        });
      }
    } catch (err) {
      console.error('Error checking for new statuses:', err);
    }
  }, [fetchTimeline]);

  const loadNew = useCallback(() => {
    if (newStatuses.length === 0) return;

    setStatuses(prev => {
      // Merge new statuses at the top
      const existingIds = new Set(prev.map(s => s.id));
      const uniqueNew = newStatuses.filter(s => !existingIds.has(s.id));
      return [...uniqueNew, ...prev];
    });

    if (newStatuses.length > 0) {
      latestIdRef.current = newStatuses[0].id;
    }

    setNewStatuses([]);
  }, [newStatuses]);

  const refresh = useCallback(async () => {
    await loadInitial();
    setNewStatuses([]);
  }, [loadInitial]);

  // Initial load
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    refreshTimerRef.current = setInterval(() => {
      checkForNew();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, checkForNew]);

  return {
    statuses,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    newCount: newStatuses.length,
    loadNew,
  };
}
