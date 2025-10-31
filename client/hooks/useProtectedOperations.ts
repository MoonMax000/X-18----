import { useState } from 'react';
import { authFetch } from '@/lib/auth-fetch';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ChangeEmailData {
  newEmail: string;
  currentPassword: string;
}

interface ChangePhoneData {
  newPhone: string;
  currentPassword: string;
}

interface ProtectedOperationError {
  error: string;
  requires_totp?: boolean;
  totp_code_missing?: boolean;
}

export function useProtectedOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresTOTP, setRequiresTOTP] = useState(false);

  const changePassword = async (data: ChangePasswordData, totpCode?: string) => {
    setIsLoading(true);
    setError(null);
    setRequiresTOTP(false);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (totpCode) {
        headers['X-TOTP-Code'] = totpCode;
      }

      const response = await authFetch.fetch('/auth/password/change', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ProtectedOperationError = await response.json();
        
        if (errorData.requires_totp) {
          setRequiresTOTP(true);
          throw new Error('TOTP verification required');
        }
        
        throw new Error(errorData.error || 'Failed to change password');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changeEmail = async (data: ChangeEmailData, totpCode?: string) => {
    setIsLoading(true);
    setError(null);
    setRequiresTOTP(false);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (totpCode) {
        headers['X-TOTP-Code'] = totpCode;
      }

      const response = await authFetch.fetch('/users/email/change', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ProtectedOperationError = await response.json();
        
        if (errorData.requires_totp) {
          setRequiresTOTP(true);
          throw new Error('TOTP verification required');
        }
        
        throw new Error(errorData.error || 'Failed to change email');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePhone = async (data: ChangePhoneData, totpCode?: string) => {
    setIsLoading(true);
    setError(null);
    setRequiresTOTP(false);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (totpCode) {
        headers['X-TOTP-Code'] = totpCode;
      }

      const response = await authFetch.fetch('/users/phone/change', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ProtectedOperationError = await response.json();
        
        if (errorData.requires_totp) {
          setRequiresTOTP(true);
          throw new Error('TOTP verification required');
        }
        
        throw new Error(errorData.error || 'Failed to change phone');
      }

      const result = await response.json();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetError = () => {
    setError(null);
    setRequiresTOTP(false);
  };

  return {
    changePassword,
    changeEmail,
    changePhone,
    isLoading,
    error,
    requiresTOTP,
    resetError,
  };
}
