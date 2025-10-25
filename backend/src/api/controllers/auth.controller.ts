import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../database/client';
import { generateToken } from '../middleware/auth';
import { logger } from '../../utils/logger';

const SALT_ROUNDS = 10;

class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, username, firstName, lastName } = req.body;

      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Check if username already exists
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          username,
          firstName,
          lastName,
          displayName: `${firstName || ''} ${lastName || ''}`.trim() || username,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          displayName: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json({
        message: 'User registered successfully',
        user,
        token,
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          passwordHash: true,
          isActive: true,
          isBanned: true,
          firstName: true,
          lastName: true,
          displayName: true,
          avatar: true,
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if account is active
      if (!user.isActive || user.isBanned) {
        return res.status(403).json({ error: 'Account is disabled' });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login time
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      logger.info(`User logged in: ${user.email}`);

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   * Note: With JWT, logout is handled client-side by removing the token
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // In a JWT-based system, logout is typically handled client-side
      // Server-side, we could maintain a blacklist of tokens (optional)
      
      res.json({ message: 'Logout successful' });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  /**
   * Refresh token
   * POST /api/v1/auth/refresh
   * Note: Simple implementation - in production, use refresh tokens
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      // TODO: Implement proper refresh token mechanism
      // For now, this is a placeholder
      // In production:
      // 1. Store refresh tokens in DB
      // 2. Verify refresh token
      // 3. Generate new access token
      // 4. Optionally rotate refresh token

      res.status(501).json({ 
        error: 'Refresh token not implemented yet',
        message: 'Please login again to get a new token'
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      next(error);
    }
  }

  /**
   * Forgot password
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ 
          message: 'If the email exists, a password reset link has been sent' 
        });
      }

      // TODO: Implement email service
      // 1. Generate reset token
      // 2. Store token in DB with expiry
      // 3. Send email with reset link
      
      logger.info(`Password reset requested for: ${email}`);

      res.json({ 
        message: 'If the email exists, a password reset link has been sent',
        // TODO: Remove this in production
        debug: 'Email service not implemented yet'
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      next(error);
    }
  }

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      // TODO: Implement password reset
      // 1. Verify reset token
      // 2. Check token expiry
      // 3. Update password
      // 4. Invalidate token

      res.status(501).json({ 
        error: 'Password reset not implemented yet',
        message: 'Email service required for password reset'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      next(error);
    }
  }

  /**
   * Verify email
   * POST /api/v1/auth/verify-email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      // TODO: Implement email verification
      // 1. Verify token
      // 2. Update user.emailVerified
      // 3. Invalidate token

      res.status(501).json({ 
        error: 'Email verification not implemented yet',
        message: 'Email service required for email verification'
      });
    } catch (error) {
      logger.error('Verify email error:', error);
      next(error);
    }
  }
}

export const authController = new AuthController();
