import type { APIError } from '@/types/api';

/**
 * API Client Configuration
 * 
 * TODO: Update this to your actual backend API URL
 * For development: http://localhost:3000/api
 * For production: https://your-domain.com/api
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * HTTP Client with automatic token handling and error handling
 */
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get auth token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Build headers with authentication
   */
  private buildHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);
    
    // Add Content-Type if not set
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add Authorization header if token exists
    const token = this.getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJSON = contentType?.includes('application/json');

    if (!response.ok) {
      if (isJSON) {
        const error: APIError = await response.json();
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    if (isJSON) {
      return response.json();
    }

    return {} as T;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = this.buildHeaders(options?.headers);
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const headers = this.buildHeaders(options?.headers);
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const headers = this.buildHeaders(options?.headers);
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const headers = this.buildHeaders(options?.headers);
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = this.buildHeaders(options?.headers);
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new APIClient(BASE_URL);
