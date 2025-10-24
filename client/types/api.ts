/**
 * API Types for Backend Integration
 * These types define the contract between frontend and backend
 */

// Auth Method
export type AuthMethod = 'email' | 'phone';

// User Type
export interface User {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  tier?: 'free' | 'premium' | 'pro';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Login Request
export interface LoginRequest {
  method: AuthMethod;
  identifier: string; // email or phone
  password: string;
}

// Sign Up Request
export interface SignUpRequest {
  method: AuthMethod;
  email?: string;
  phone?: string;
  password: string;
  username?: string;
  displayName?: string;
  referralCode?: string;
}

// Auth Response
export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: User;
  message?: string;
}

// Verify Code Request
export interface VerifyCodeRequest {
  method: AuthMethod;
  identifier: string; // email or phone
  code: string;
}

// Request Password Reset
export interface RequestPasswordResetRequest {
  method: AuthMethod;
  identifier: string; // email or phone
}

// Reset Password Request
export interface ResetPasswordRequest {
  method: AuthMethod;
  identifier: string; // email or phone
  code: string;
  newPassword: string;
}

// API Error
export interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

// Generic API Response
export type APIResponse<T> = T | APIError;

// Helper to check if response is error
export function isAPIError(response: unknown): response is APIError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false
  );
}
