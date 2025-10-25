import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../../database/client';
import { generateToken } from '../middleware/auth';
import { emailService } from '../../services/email/email.service';
import { logger } from '../../utils/logger';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_HOURS = 24; // Verification and reset tokens expire after 24 hours

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

      // Send verification email (if email service is configured)
      if (emailService.isConfigured()) {
        try {
          const verificationToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

          // Store verification token in database
          await prisma.emailVerificationToken.create({
            data: {
              userId: user.id,
              token: verificationToken,
              expiresAt,
            },
          });

          // Send email
          await emailService.sendVerificationEmail({
            email: user.email,
            username: user.username,
            verificationToken,
          });

          logger.info(`Verification email sent to: ${user.email}`);
        } catch (emailError) {
          logger.error('Failed to send verification email:', emailError);
          // Don't fail registration if email fails
        }
      }

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
        select: { id: true, email: true, username: true },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      // Check if email service is configured
      if (!emailService.isConfigured()) {
        return res.status(503).json({
          error: 'Email service not configured',
          message: 'Password reset is currently unavailable'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Store new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      // Send email
      await emailService.sendPasswordResetEmail({
        email: user.email,
        username: user.username,
        resetToken,
      });

      logger.info(`Password reset email sent to: ${email}`);

      res.json({
        message: 'If the email exists, a password reset link has been sent'
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

      // Find reset token
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Check if token is expired
      if (resetToken.expiresAt < new Date()) {
        await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
        return res.status(400).json({ error: 'Reset token has expired' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Update user password
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });

      // Delete reset token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      logger.info(`Password reset successful for user: ${resetToken.user.email}`);

      res.json({
        message: 'Password reset successful. You can now log in with your new password.'
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

      // Find verification token
      const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!verificationToken) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Check if token is expired
      if (verificationToken.expiresAt < new Date()) {
        await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });
        return res.status(400).json({ error: 'Verification token has expired' });
      }

      // Update user email verified status
      await prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      });

      // Delete verification token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      // Send welcome email
      if (emailService.isConfigured()) {
        try {
          await emailService.sendWelcomeEmail({
            email: verificationToken.user.email,
            username: verificationToken.user.username,
          });
        } catch (emailError) {
          logger.error('Failed to send welcome email:', emailError);
        }
      }

      logger.info(`Email verified for user: ${verificationToken.user.email}`);

      res.json({
        message: 'Email verified successfully!',
        user: {
          id: verificationToken.user.id,
          email: verificationToken.user.email,
          emailVerified: true,
        }
      });
    } catch (error) {
      logger.error('Verify email error:', error);
      next(error);
    }
  }
}

export const authController = new AuthController();
