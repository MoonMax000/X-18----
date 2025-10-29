import { useState, useEffect } from 'react';
import { customBackendAPI } from '@/services/api/custom-backend';
import { getAvatarUrl } from '@/lib/avatar-utils';
import type { SuggestedProfile } from '@/components/SocialFeedWidgets/SuggestedProfilesWidget';

interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar?: string;
  verified?: boolean;
  followers_count?: number;
  following_count?: number;
}

export function useFollowRecommendations() {
  const [recommendations, setRecommendations] = useState<SuggestedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Когда будет готов эндпоинт для рекомендаций, использовать его
        // А пока берем популярных пользователей
        const users = await customBackendAPI.searchUsers('', {
          limit: 6,
          offset: 0,
        });

        if (users && users.length > 0) {
          const mapped: SuggestedProfile[] = users
            .slice(0, 6)
            .map((user: User) => ({
              id: user.id,
              name: user.display_name || user.username,
              handle: `@${user.username}`,
              avatar: getAvatarUrl(user),
              verified: user.verified || false,
            }));
          
          setRecommendations(mapped);
        } else {
          // Если нет реальных пользователей, используем fallback
          console.warn('No real users found for recommendations');
        }
      } catch (err) {
        console.error('Failed to fetch follow recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return { recommendations, loading, error };
}
