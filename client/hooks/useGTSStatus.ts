// useGTSStatus - Hook for fetching a single status/post from GoToSocial
import { useState, useEffect, useCallback } from 'react';
import { 
  getStatus,
  getStatusContext,
  type GTSStatus,
  type GTSContext
} from '@/services/api/gotosocial';

interface UseGTSStatusOptions {
  statusId: string;
  fetchContext?: boolean; // Load replies/ancestors
}

interface UseGTSStatusReturn {
  status: GTSStatus | null;
  context: GTSContext | null;
  replies: GTSStatus[]; // Shorthand for context.descendants
  ancestors: GTSStatus[]; // Shorthand for context.ancestors
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGTSStatus(options: UseGTSStatusOptions): UseGTSStatusReturn {
  const { statusId, fetchContext = true } = options;

  const [status, setStatus] = useState<GTSStatus | null>(null);
  const [context, setContext] = useState<GTSContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!statusId) {
      setError('Status ID required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch the status
      const statusData = await getStatus(statusId);
      setStatus(statusData);

      // Fetch context (replies and ancestors) if requested
      if (fetchContext) {
        const contextData = await getStatusContext(statusId);
        setContext(contextData);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch status';
      setError(errorMessage);
      console.error('Error fetching status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusId, fetchContext]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    context,
    replies: context?.descendants || [],
    ancestors: context?.ancestors || [],
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
