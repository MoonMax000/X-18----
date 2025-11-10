import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export interface SearchFilters {
  query: string;
  author?: string;
  category?: string;
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
  accessLevel?: string;
  minLikes?: number;
  minViews?: number;
  hasMedia?: 'true' | 'false' | 'any';
  mediaType?: 'image' | 'video' | 'document' | 'any';
  sortBy?: 'relevance' | 'date' | 'likes' | 'views';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  posts: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useSearch(initialFilters: SearchFilters = { query: '' }) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  const debouncedQuery = useDebounce(filters.query, 500);

  const search = useCallback(async (searchFilters: SearchFilters) => {
    // Don't search if query is empty
    if (!searchFilters.query || searchFilters.query.trim().length === 0) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      
      if (searchFilters.query) params.append('q', searchFilters.query);
      if (searchFilters.author) params.append('author', searchFilters.author);
      if (searchFilters.category) params.append('category', searchFilters.category);
      if (searchFilters.tags) params.append('tags', searchFilters.tags);
      if (searchFilters.dateFrom) params.append('date_from', searchFilters.dateFrom);
      if (searchFilters.dateTo) params.append('date_to', searchFilters.dateTo);
      if (searchFilters.accessLevel) params.append('access_level', searchFilters.accessLevel);
      if (searchFilters.minLikes) params.append('min_likes', searchFilters.minLikes.toString());
      if (searchFilters.minViews) params.append('min_views', searchFilters.minViews.toString());
      if (searchFilters.hasMedia) params.append('has_media', searchFilters.hasMedia);
      if (searchFilters.mediaType) params.append('media_type', searchFilters.mediaType);
      if (searchFilters.sortBy) params.append('sort_by', searchFilters.sortBy);
      if (searchFilters.sortOrder) params.append('sort_order', searchFilters.sortOrder);
      if (searchFilters.page) params.append('page', searchFilters.page.toString());
      if (searchFilters.limit) params.append('limit', searchFilters.limit.toString());

      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';
      const response = await fetch(`${baseUrl}/posts/search?${params.toString()}`, {
        credentials: 'include', // Send httpOnly cookies
      });

      if (!response.ok) {
        throw new Error('Поиск не удался');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'Поиск не удался');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      search(filters);
    } else {
      setResults(null);
    }
  }, [debouncedQuery, filters, search]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ query: '' });
    setResults(null);
    setError(null);
  }, []);

  const loadMore = useCallback(() => {
    if (results && results.page < results.totalPages) {
      updateFilters({ page: results.page + 1 });
    }
  }, [results, updateFilters]);

  return {
    filters,
    results,
    isLoading,
    error,
    updateFilters,
    clearFilters,
    loadMore,
    hasMore: results ? results.page < results.totalPages : false,
  };
}
