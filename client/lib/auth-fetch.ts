// Централизованный слой для аутентифицированных запросов
// Обрабатывает обновление токенов и ошибки 401 централизованно

import { DEBUG } from './debug';

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
  maxRetries?: number;
}

class AuthFetch {
  private refreshPromise: Promise<boolean> | null = null;
  private baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';
  
  async fetch(endpoint: string, options: AuthFetchOptions = {}): Promise<Response> {
    const { skipAuth = false, maxRetries = 1, ...fetchOptions } = options;
    
    // Для публичных endpoints пропускаем авторизацию
    if (skipAuth) {
      return this.performFetch(endpoint, fetchOptions);
    }
    
    // Пробуем получить токен из localStorage (для обратной совместимости)
    // Но если его нет, не выбрасываем ошибку - полагаемся на cookies
    const token = localStorage.getItem('custom_token');
    
    if (!token) {
      DEBUG.log('AUTH', `No localStorage token for ${endpoint}, relying on httpOnly cookies`, { skipAuth });
    }
    
    // Первая попытка (с токеном из localStorage если есть, или только с cookies)
    let response = await this.performFetch(endpoint, {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    // Если 401 и есть попытки, пробуем обновить токен
    if (response.status === 401 && maxRetries > 0) {
      DEBUG.log('AUTH', `Got 401 for ${endpoint}, attempting token refresh`);
      
      // Используем единый Promise для предотвращения множественных обновлений
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshToken();
      }
      
      const refreshed = await this.refreshPromise;
      this.refreshPromise = null;
      
      if (refreshed) {
        // Повторяем запрос с новым токеном (если он есть)
        const newToken = localStorage.getItem('custom_token');
        response = await this.performFetch(endpoint, {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            ...(newToken ? { 'Authorization': `Bearer ${newToken}` } : {})
          }
        });
      }
    }
    
    return response;
  }
  
  private async performFetch(endpoint: string, options: RequestInit): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    return fetch(url, {
      ...options,
      credentials: 'include', // Включаем cookies для всех запросов
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
  }
  
  private async refreshToken(): Promise<boolean> {
    try {
      // Refresh token теперь в HttpOnly cookie, не нужно отправлять в body
      const response = await this.performFetch('/auth/refresh', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('custom_token', data.access_token);
        DEBUG.log('AUTH', 'Token refreshed successfully');
        return true;
      }
      
      // Обновление не удалось, очищаем токены
      DEBUG.log('AUTH', 'Token refresh failed, clearing tokens');
      this.clearTokens();
      return false;
      
    } catch (error) {
      DEBUG.log('AUTH', 'Token refresh error', error);
      this.clearTokens();
      return false;
    }
  }
  
  private clearTokens(): void {
    localStorage.removeItem('custom_token');
    localStorage.removeItem('custom_user');
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new Event('auth:logout'));
  }
  
  // Утилита для проверки наличия токена без запроса
  hasToken(): boolean {
    return !!localStorage.getItem('custom_token');
  }
  
  // Утилита для установки токена (после логина)
  setTokens(accessToken: string): void {
    localStorage.setItem('custom_token', accessToken);
  }
}

export const authFetch = new AuthFetch();

// Типизированный wrapper для JSON запросов
export async function authRequest<T>(
  endpoint: string, 
  options?: AuthFetchOptions
): Promise<T> {
  const response = await authFetch.fetch(endpoint, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}
