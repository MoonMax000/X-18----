import { useState } from 'react';
import { authFetch } from '../lib/auth-fetch';

interface TOTPStatus {
  enabled: boolean;
  has_backup_codes: boolean;
}

interface TOTPSetupData {
  secret: string;
  formatted_secret: string;
  qr_code: string;
  backup_codes: string[];
}

export function useTOTP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Получить статус TOTP 2FA для текущего пользователя
   */
  const getTOTPStatus = async (): Promise<TOTPStatus | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch.fetch('/totp/status');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get TOTP status');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get TOTP status';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Сгенерировать новый TOTP секрет и QR код
   * Возвращает данные для настройки 2FA
   */
  const generateTOTP = async (): Promise<TOTPSetupData | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch.fetch('/totp/generate', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate TOTP secret');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate TOTP secret';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Включить TOTP 2FA после верификации кода
   * 
   * @param code - 6-значный код из authenticator app
   */
  const enableTOTP = async (code: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch.fetch('/totp/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid TOTP code');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable TOTP';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Отключить TOTP 2FA
   * Требует валидный код для подтверждения
   * 
   * @param code - 6-значный код из authenticator app
   */
  const disableTOTP = async (code: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch.fetch('/totp/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid TOTP code');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable TOTP';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Верифицировать TOTP код
   * Используется для проверки кода перед чувствительными операциями
   * 
   * @param code - 6-значный код из authenticator app
   */
  const verifyTOTP = async (code: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch.fetch('/totp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid TOTP code');
      }

      const data = await response.json();
      return data.valid === true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify TOTP code';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Сгенерировать новые backup коды
   * Требует валидный TOTP код для подтверждения
   * 
   * @param code - 6-значный код из authenticator app
   */
  const regenerateBackupCodes = async (code: string): Promise<string[] | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch.fetch('/totp/backup-codes/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid TOTP code');
      }

      const data = await response.json();
      return data.backup_codes;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate backup codes';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getTOTPStatus,
    generateTOTP,
    enableTOTP,
    disableTOTP,
    verifyTOTP,
    regenerateBackupCodes,
  };
}
