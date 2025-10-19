import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/database';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateVerificationCode,
  generateResetToken,
  validateEmail,
  validatePhone,
  validatePassword,
  maskEmail,
  maskPhone,
  shouldBlockAccount,
  getBlockDuration,
  verifyRefreshToken
} from '../utils/auth';
import { rateLimit } from '../middleware/auth';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(12),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required'
});

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string(),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required'
});

const verifyCodeSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6),
  type: z.enum(['email_verification', 'phone_verification', '2fa'])
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(12)
});

const refreshTokenSchema = z.object({
  refreshToken: z.string()
});

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', rateLimit(5, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const body = signupSchema.parse(req.body);
    
    // Validate password
    const passwordValidation = validatePassword(body.password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        error: 'Invalid password',
        details: passwordValidation.errors
      });
      return;
    }
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${body.email},phone.eq.${body.phone}`)
      .single();
    
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }
    
    // Hash password
    const passwordHash = await hashPassword(body.password);
    
    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: body.email || null,
        phone: body.phone || null,
        password_hash: passwordHash
      })
      .select()
      .single();
    
    if (error || !user) {
      console.error('User creation error:', error);
      res.status(500).json({ error: 'Failed to create user' });
      return;
    }
    
    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await supabase
      .from('verification_codes')
      .insert({
        user_id: user.id,
        code,
        type: body.email ? 'email_verification' : 'phone_verification',
        expires_at: expiresAt.toISOString()
      });
    
    // TODO: Send verification code via email/SMS
    console.log(`Verification code for user ${user.id}: ${code}`);
    
    res.status(201).json({
      success: true,
      userId: user.id,
      message: 'User created successfully. Please verify your account.',
      // In development, include code. Remove in production
      ...(process.env.NODE_ENV === 'development' && { verificationCode: code })
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify
 * Verify email/phone with code
 */
router.post('/verify', rateLimit(10, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const body = verifyCodeSchema.parse(req.body);
    
    // Get verification code
    const { data: verification } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', body.userId)
      .eq('code', body.code)
      .eq('type', body.type)
      .eq('is_used', false)
      .single();
    
    if (!verification) {
      res.status(400).json({ error: 'Invalid or expired code' });
      return;
    }
    
    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      res.status(400).json({ error: 'Code expired' });
      return;
    }
    
    // Check attempts
    if (verification.attempts >= 5) {
      res.status(400).json({ error: 'Too many failed attempts' });
      return;
    }
    
    // Mark code as used
    await supabase
      .from('verification_codes')
      .update({ is_used: true })
      .eq('id', verification.id);
    
    // Update user verification status
    const updateField = body.type === 'email_verification' ? 'email_verified' : 'phone_verified';
    await supabase
      .from('users')
      .update({ [updateField]: true })
      .eq('id', body.userId);
    
    res.json({
      success: true,
      message: 'Verification successful'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Login with email/phone and password
 */
router.post('/login', rateLimit(10, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);
    
    // Find user
    const query = body.email
      ? supabase.from('users').select('*').eq('email', body.email)
      : supabase.from('users').select('*').eq('phone', body.phone);
    
    const { data: user } = await query.single();
    
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Check if account is blocked
    if (user.is_blocked && user.last_failed_login) {
      const blockDuration = getBlockDuration(user.failed_login_attempts);
      const unblockTime = new Date(user.last_failed_login).getTime() + blockDuration;
      
      if (Date.now() < unblockTime) {
        res.status(403).json({
          error: 'Account temporarily blocked',
          unblockAt: new Date(unblockTime).toISOString(),
          remainingMinutes: Math.ceil((unblockTime - Date.now()) / 60000)
        });
        return;
      } else {
        // Unblock account
        await supabase
          .from('users')
          .update({ is_blocked: false, failed_login_attempts: 0 })
          .eq('id', user.id);
      }
    }
    
    // Verify password
    const passwordValid = await comparePassword(body.password, user.password_hash);
    
    if (!passwordValid) {
      // Increment failed attempts
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
      const shouldBlock = shouldBlockAccount(newFailedAttempts);
      
      await supabase
        .from('users')
        .update({
          failed_login_attempts: newFailedAttempts,
          last_failed_login: new Date().toISOString(),
          is_blocked: shouldBlock
        })
        .eq('id', user.id);
      
      res.status(401).json({
        error: 'Invalid credentials',
        attemptsRemaining: Math.max(0, 5 - newFailedAttempts)
      });
      return;
    }
    
    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Generate 2FA code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await supabase
        .from('verification_codes')
        .insert({
          user_id: user.id,
          code,
          type: '2fa',
          expires_at: expiresAt.toISOString()
        });
      
      // TODO: Send 2FA code
      console.log(`2FA code for user ${user.id}: ${code}`);
      
      res.json({
        success: true,
        requires2FA: true,
        userId: user.id,
        maskedContact: user.email ? maskEmail(user.email) : maskPhone(user.phone!),
        // In development, include code
        ...(process.env.NODE_ENV === 'development' && { twoFactorCode: code })
      });
      return;
    }
    
    // Reset failed attempts
    await supabase
      .from('users')
      .update({ failed_login_attempts: 0, last_failed_login: null })
      .eq('id', user.id);
    
    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      phone: user.phone
    });
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      phone: user.phone
    });
    
    // Create session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString(),
        ip_address: req.ip,
        device_info: req.headers['user-agent']
      });
    
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const body = refreshTokenSchema.parse(req.body);
    
    // Verify refresh token
    const payload = verifyRefreshToken(body.refreshToken);
    
    if (!payload) {
      res.status(403).json({ error: 'Invalid refresh token' });
      return;
    }
    
    // Check if session exists
    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('refresh_token', body.refreshToken)
      .single();
    
    if (!session) {
      res.status(403).json({ error: 'Session not found' });
      return;
    }
    
    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      res.status(403).json({ error: 'Session expired' });
      return;
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(payload);
    
    // Update session with new token
    await supabase
      .from('sessions')
      .update({ token: newAccessToken })
      .eq('id', session.id);
    
    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', rateLimit(3, 60 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const body = resetPasswordRequestSchema.parse(req.body);
    
    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', body.email)
      .single();
    
    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
      return;
    }
    
    // Generate reset token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await supabase
      .from('password_resets')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString()
      });
    
    // TODO: Send reset email
    console.log(`Password reset token for ${user.email}: ${token}`);
    
    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // In development, include token
      ...(process.env.NODE_ENV === 'development' && { resetToken: token })
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    
    // Validate new password
    const passwordValidation = validatePassword(body.newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({
        error: 'Invalid password',
        details: passwordValidation.errors
      });
      return;
    }
    
    // Find reset token
    const { data: reset } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', body.token)
      .eq('is_used', false)
      .single();
    
    if (!reset) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }
    
    // Check if expired
    if (new Date(reset.expires_at) < new Date()) {
      res.status(400).json({ error: 'Reset token expired' });
      return;
    }
    
    // Hash new password
    const passwordHash = await hashPassword(body.newPassword);
    
    // Update password
    await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', reset.user_id);
    
    // Mark reset token as used
    await supabase
      .from('password_resets')
      .update({ is_used: true })
      .eq('id', reset.id);
    
    // Invalidate all sessions for security
    await supabase
      .from('sessions')
      .delete()
      .eq('user_id', reset.user_id);
    
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      res.status(400).json({ error: 'Token required' });
      return;
    }
    
    // Delete session
    await supabase
      .from('sessions')
      .delete()
      .eq('token', token);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
