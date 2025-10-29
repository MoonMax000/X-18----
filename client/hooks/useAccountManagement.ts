import { useState } from 'react';
import { authFetch } from '../lib/auth-fetch';

interface AccountRecoveryInfo {
  is_deactivated: boolean;
  deactivated_at?: string;
  deletion_scheduled_at?: string;
  days_remaining?: number;
  message?: string;
}

interface DeactivationResult {
  message: string;
  deletion_date: string;
  days_until_deletion: number;
}

export function useAccountManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Получить информацию о восстановлении аккаунта
   * Возвращает статус деактивации и дни до удаления
   */
  const getRecoveryInfo = async (): Promise<AccountRecoveryInfo | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch.fetch('/account/recovery-info');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recovery info');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get recovery info';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Деактивировать аккаунт с 30-дневным периодом восстановления
   * После деактивации у пользователя есть 30 дней для восстановления
   * 
   * @param reason - Опциональная причина деактивации
   */
  const deactivateAccount = async (reason?: string): Promise<DeactivationResult | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch.fetch('/account/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason || '' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deactivate account');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate account';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Восстановить деактивированный аккаунт
   * Работает только в течение 30 дней после деактивации
   */
  const restoreAccount = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch.fetch('/account/restore', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore account');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore account';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getRecoveryInfo,
    deactivateAccount,
    restoreAccount,
  };
}
