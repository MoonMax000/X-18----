import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '../lib/auth-fetch';

interface SecuritySettings {
  is_2fa_enabled: boolean;
  verification_method: 'email' | 'sms';
  is_email_verified: boolean;
  is_phone_verified: boolean;
  backup_email?: string;
  backup_phone?: string;
}

interface Session {
  id: string;
  session_id: string;
  user_id: number;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  user_agent: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
}

export function useSecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authFetch.fetch('/auth/2fa/settings');

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        throw new Error('Failed to fetch security settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<SecuritySettings & { verification_code?: string }>) => {
    try {
      // Handle 2FA enable/disable
      if (updates.is_2fa_enabled !== undefined) {
        const endpoint = updates.is_2fa_enabled 
          ? '/auth/2fa/enable' 
          : '/auth/2fa/disable';
        
        const response = await authFetch.fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            method: updates.verification_method || settings?.verification_method || 'email',
            code: updates.verification_code,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update 2FA settings');
        }
      }

      // Handle backup contact updates
      if (updates.backup_email !== undefined) {
        const response = await authFetch.fetch('/auth/backup-contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            backup_email: updates.backup_email,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update backup contacts');
        }
      }

      // Refresh settings after update
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, [settings, fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, isLoading, error, updateSettings, refetch: fetchSettings };
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authFetch.fetch('/auth/sessions');

      if (response.ok) {
        const data = await response.json();
        console.log('📡 [SESSIONS] API response:', data);
        console.log('📡 [SESSIONS] Sessions array:', data.sessions);
        console.log('📡 [SESSIONS] Sessions count:', data.sessions?.length || 0);
        setSessions(data.sessions || []);
      } else {
        console.error('❌ [SESSIONS] API error:', response.status, response.statusText);
        throw new Error('Failed to fetch sessions');
      }
    } catch (err) {
      console.error('❌ [SESSIONS] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      const response = await authFetch.fetch(`/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke session');
      }

      // Refresh sessions list
      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, isLoading, error, revokeSession, refetch: fetchSessions };
}

export function useAccountRecovery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authFetch.fetch('/auth/password/reset', {
        method: 'POST',
        skipAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send password reset email');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmPasswordReset = useCallback(async (email: string, code: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authFetch.fetch('/auth/password/reset/confirm', {
        method: 'POST',
        skipAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { requestPasswordReset, confirmPasswordReset, isLoading, error };
}

export function use2FALogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify2FACode = useCallback(async (email: string, code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authFetch.fetch('/auth/login/2fa', {
        method: 'POST',
        skipAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid 2FA code');
      }

      const data = await response.json();
      
      // Store tokens using custom_token (not auth_token)
      localStorage.setItem('custom_token', data.token);
      localStorage.setItem('custom_user', JSON.stringify(data.user));

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { verify2FACode, isLoading, error };
}
