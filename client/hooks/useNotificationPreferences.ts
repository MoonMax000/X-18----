import { useState, useEffect, useCallback } from 'react';
import { customBackendAPI } from '../services/api/custom-backend';

export interface NotificationPreferences {
  id: number;
  user_id: string;
  // Social notifications
  new_followers: boolean;
  mentions: boolean;
  replies: boolean;
  reposts: boolean;
  likes: boolean;
  // Content notifications
  new_posts_from_following: boolean;
  post_recommendations: boolean;
  // System notifications
  account_updates: boolean;
  security_alerts: boolean;
  product_updates: boolean;
  // Financial notifications
  payment_received: boolean;
  subscription_renewal: boolean;
  payout_completed: boolean;
  // Email notifications toggle
  email_notifications_enabled: boolean;
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await customBackendAPI['request']<NotificationPreferences>('/notification-preferences', {
        method: 'GET',
      });

      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notification preferences');
      console.error('Error fetching notification preferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    try {
      setError(null);
      
      // Создаем полный объект настроек для отправки
      const updatedPreferences = {
        ...preferences,
        ...updates,
      };

      const data = await customBackendAPI['request']<NotificationPreferences>('/notification-preferences', {
        method: 'PUT',
        body: JSON.stringify(updatedPreferences),
      });

      setPreferences(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notification preferences';
      setError(errorMessage);
      console.error('Error updating notification preferences:', err);
      throw new Error(errorMessage);
    }
  }, [preferences]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
