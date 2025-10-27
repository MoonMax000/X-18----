import { useState, useEffect } from 'react';
import { 
  customBackendAPI, 
  NewsItem, 
  TrendingTicker, 
  TopAuthor, 
  MyEarningsData, 
  MyActivityData,
  SubscriptionData 
} from '../services/api/custom-backend';

// ============================================================================
// NEWS WIDGET HOOK
// ============================================================================

interface UseNewsOptions {
  limit?: number;
  category?: string;
  autoFetch?: boolean;
}

export function useNews(options: UseNewsOptions = {}) {
  const { limit = 5, category, autoFetch = true } = options;
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customBackendAPI.getNews({ limit, category });
      setNews(data);
    } catch (err) {
      console.error('Ошибка при загрузке новостей:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить новости');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchNews();
    }
  }, [limit, category, autoFetch]);

  return { news, isLoading, error, refetch: fetchNews };
}

// ============================================================================
// TRENDING TICKERS WIDGET HOOK
// ============================================================================

interface UseTrendingTickersOptions {
  limit?: number;
  timeframe?: '6h' | '12h' | '24h' | '7d';
  autoFetch?: boolean;
}

export function useTrendingTickers(options: UseTrendingTickersOptions = {}) {
  const { limit = 5, timeframe = '24h', autoFetch = true } = options;
  const [tickers, setTickers] = useState<TrendingTicker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customBackendAPI.getTrendingTickers({ limit, timeframe });
      setTickers(data);
    } catch (err) {
      console.error('Ошибка при загрузке трендовых тикеров:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить трендовые тикеры');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTickers();
    }
  }, [limit, timeframe, autoFetch]);

  return { tickers, isLoading, error, refetch: fetchTickers };
}

// ============================================================================
// TOP AUTHORS WIDGET HOOK
// ============================================================================

interface UseTopAuthorsOptions {
  limit?: number;
  timeframe?: '24h' | '7d' | '30d';
  autoFetch?: boolean;
}

export function useTopAuthors(options: UseTopAuthorsOptions = {}) {
  const { limit = 5, timeframe = '7d', autoFetch = true } = options;
  const [authors, setAuthors] = useState<TopAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customBackendAPI.getTopAuthors({ limit, timeframe });
      setAuthors(data);
    } catch (err) {
      console.error('Ошибка при загрузке топ авторов:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить топ авторов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchAuthors();
    }
  }, [limit, timeframe, autoFetch]);

  return { authors, isLoading, error, refetch: fetchAuthors };
}

// ============================================================================
// MY EARNINGS WIDGET HOOK (REQUIRES AUTH)
// ============================================================================

interface UseMyEarningsOptions {
  period?: '7d' | '30d' | '90d';
  autoFetch?: boolean;
}

export function useMyEarnings(options: UseMyEarningsOptions = {}) {
  const { period = '30d', autoFetch = true } = options;
  const [earnings, setEarnings] = useState<MyEarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customBackendAPI.getMyEarnings({ period });
      setEarnings(data);
    } catch (err) {
      console.error('Ошибка при загрузке заработка:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить данные о заработке');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchEarnings();
    }
  }, [period, autoFetch]);

  return { earnings, isLoading, error, refetch: fetchEarnings };
}

// ============================================================================
// MY ACTIVITY WIDGET HOOK (REQUIRES AUTH)
// ============================================================================

interface UseMyActivityOptions {
  period?: '7d' | '30d';
  autoFetch?: boolean;
}

export function useMyActivity(options: UseMyActivityOptions = {}) {
  const { period = '7d', autoFetch = true } = options;
  const [activity, setActivity] = useState<MyActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customBackendAPI.getMyActivity({ period });
      setActivity(data);
    } catch (err) {
      console.error('Ошибка при загрузке активности:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить данные об активности');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchActivity();
    }
  }, [period, autoFetch]);

  return { activity, isLoading, error, refetch: fetchActivity };
}

// ============================================================================
// MY SUBSCRIPTIONS WIDGET HOOK (REQUIRES AUTH)
// ============================================================================

interface UseMySubscriptionsOptions {
  autoFetch?: boolean;
}

export function useMySubscriptions(options: UseMySubscriptionsOptions = {}) {
  const { autoFetch = true } = options;
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customBackendAPI.getMySubscriptions();
      setSubscriptions(data);
    } catch (err) {
      console.error('Ошибка при загрузке подписок:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить подписки');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchSubscriptions();
    }
  }, [autoFetch]);

  return { subscriptions, isLoading, error, refetch: fetchSubscriptions };
}
