import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { customBackendAPI } from '@/services/api/custom-backend';
import type { User, Post } from '@/services/api/custom-backend';

interface SearchSuggestion {
  id: string;
  type: 'user' | 'post' | 'hashtag';
  title: string;
  subtitle?: string;
  avatar?: string;
  onClick: () => void;
}

interface UseSearchAutocompleteReturn {
  query: string;
  setQuery: (q: string) => void;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;
  clearSuggestions: () => void;
  addToHistory: (query: string) => void;
  searchHistory: string[];
  clearHistory: () => void;
}

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

/**
 * Hook для autocomplete поиска с debounce и историей
 */
export function useSearchAutocomplete(): UseSearchAutocompleteReturn {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

  // Add to search history
  const addToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setSearchHistory(prev => {
      // Remove duplicates and add to beginning
      const filtered = prev.filter(q => q !== searchQuery);
      const newHistory = [searchQuery, ...filtered].slice(0, MAX_HISTORY);
      
      // Save to localStorage
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      
      return newHistory;
    });
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Search in parallel
        const [users, posts] = await Promise.all([
          customBackendAPI.searchUsers(debouncedQuery, { limit: 5 }),
          customBackendAPI.searchPosts(debouncedQuery, { limit: 5 }),
        ]);

        if (cancelled) return;

        const userSuggestions: SearchSuggestion[] = users.map(user => ({
          id: user.id,
          type: 'user' as const,
          title: user.display_name || user.username,
          subtitle: `@${user.username}`,
          avatar: user.avatar_url,
          onClick: () => {
            window.location.href = `/@${user.username}`;
          },
        }));

        const postSuggestions: SearchSuggestion[] = posts.map(post => ({
          id: post.id,
          type: 'post' as const,
          title: post.content.substring(0, 60) + (post.content.length > 60 ? '...' : ''),
          subtitle: `@${post.user?.username || 'unknown'}`,
          avatar: post.user?.avatar_url,
          onClick: () => {
            window.location.href = `/home/post/${post.id}`;
          },
        }));

        // Combine and limit total suggestions
        const allSuggestions = [...userSuggestions, ...postSuggestions].slice(0, 10);
        setSuggestions(allSuggestions);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Search failed');
          console.error('[SearchAutocomplete] Error:', err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    clearSuggestions,
    addToHistory,
    searchHistory,
    clearHistory,
  };
}
