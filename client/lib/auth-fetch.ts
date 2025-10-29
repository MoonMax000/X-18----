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
    
    // Проверяем наличие токена
    const token = localStorage.getItem('custom_token');
    if (!token) {
      DEBUG.log('AUTH', `No token available for ${endpoint}`, { skipAuth });
      throw new Error('No authentication token');
    }
    
    // Первая попытка с текущим токеном
    let response = await this.performFetch(endpoint, {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${token}`
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
        // Повторяем запрос с новым токеном
        const newToken = localStorage.getItem('custom_token');
        response = await this.performFetch(endpoint, {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            'Authorization': `Bearer ${newToken}`
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
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
  }
  
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('custom_refresh_token');
      if (!refreshToken) {
        DEBUG.log('AUTH', 'No refresh token available');
        return false;
      }
      
      const response = await this.performFetch('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('custom_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('custom_refresh_token', data.refresh_token);
        }
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
    localStorage.removeItem('custom_refresh_token');
    localStorage.removeItem('custom_user');
    
    // Отправляем событие для обновления UI
    window.dispatchEvent(new Event('auth:logout'));
  }
  
  // Утилита для проверки наличия токена без запроса
  hasToken(): boolean {
    return !!localStorage.getItem('custom_token');
  }
  
  // Утилита для установки токенов (после логина)
  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem('custom_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('custom_refresh_token', refreshToken);
    }
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
