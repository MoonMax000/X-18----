import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const SALT_ROUNDS = 10;

export interface JWTPayload {
  userId: string;
  email?: string;
  phone?: string;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token (expires in 15 minutes)
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Generate JWT refresh token (expires in 7 days)
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate random verification code (6 digits)
 * In development, always returns 111111 for easy testing
 */
export function generateVerificationCode(): string {
  if (process.env.NODE_ENV === 'development') {
    return '111111';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate secure random token for password reset
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (international format)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Mask email for privacy (e****@example.com)
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  return `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}@${domain}`;
}

/**
 * Mask phone for privacy (+7 *** *** **45)
 */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return `${phone.substring(0, 2)}${'*'.repeat(phone.length - 4)}${phone.substring(phone.length - 2)}`;
}

/**
 * Generate 2FA secret (for TOTP)
 */
export function generate2FASecret(): string {
  return crypto.randomBytes(20).toString('hex');
}

/**
 * Check if account should be blocked due to failed attempts
 */
export function shouldBlockAccount(failedAttempts: number): boolean {
  return failedAttempts >= 5;
}

/**
 * Calculate block duration based on failed attempts
 */
export function getBlockDuration(failedAttempts: number): number {
  if (failedAttempts < 5) return 0;
  if (failedAttempts < 10) return 15 * 60 * 1000; // 15 minutes
  if (failedAttempts < 15) return 60 * 60 * 1000; // 1 hour
  return 24 * 60 * 60 * 1000; // 24 hours
}
