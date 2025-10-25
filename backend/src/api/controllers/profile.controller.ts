import { Response, NextFunction } from 'express';
import multer from 'multer';
import { prisma } from '../../database/client';
import { s3Service } from '../../services/storage/s3.service';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../../utils/logger';

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// Export multer middleware for routes
export const uploadSingle = upload.single('file');
export const uploadAvatar = upload.single('avatar');
export const uploadCover = upload.single('cover');

class ProfileController {
  /**
   * Get current user profile
   * GET /api/v1/profile
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          displayName: true,
          bio: true,
          avatar: true,
          coverImage: true,
          location: true,
          website: true,
          role: true,
          sectors: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/v1/profile
   */
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        firstName,
        lastName,
        displayName,
        bio,
        location,
        website,
        role,
        sectors,
      } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          displayName,
          bio,
          location,
          website,
          role,
          sectors,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          displayName: true,
          bio: true,
          avatar: true,
          coverImage: true,
          location: true,
          website: true,
          role: true,
          sectors: true,
          updatedAt: true,
        },
      });

      logger.info(`Profile updated for user: ${userId}`);

      res.json({
        message: 'Profile updated successfully',
        user,
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }

  /**
   * Upload avatar
   * POST /api/v1/profile/avatar
   */
  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check if S3 is configured
      if (!s3Service.isConfigured()) {
        return res.status(503).json({ 
          error: 'File upload service not configured',
          message: 'S3 credentials are missing. Please configure AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY'
        });
      }

      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      // Upload new avatar to S3
      const avatarUrl = await s3Service.uploadAvatar(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // Update user in database
      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        select: {
          id: true,
          avatar: true,
        },
      });

      // Delete old avatar from S3 (if exists)
      if (currentUser?.avatar && currentUser.avatar.includes('s3.amazonaws.com')) {
        await s3Service.deleteFile(currentUser.avatar).catch(err => {
          logger.warn('Failed to delete old avatar:', err);
        });
      }

      logger.info(`Avatar uploaded for user: ${userId}`);

      res.json({
        message: 'Avatar uploaded successfully',
        avatar: user.avatar,
      });
    } catch (error: any) {
      logger.error('Upload avatar error:', error);
      
      if (error.message?.includes('Only image files')) {
        return res.status(400).json({ error: error.message });
      }
      
      next(error);
    }
  }

  /**
   * Delete avatar
   * DELETE /api/v1/profile/avatar
   */
  async deleteAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      if (!currentUser?.avatar) {
        return res.status(404).json({ error: 'No avatar to delete' });
      }

      // Delete from S3
      if (currentUser.avatar.includes('s3.amazonaws.com')) {
        await s3Service.deleteFile(currentUser.avatar).catch(err => {
          logger.warn('Failed to delete avatar from S3:', err);
        });
      }

      // Update user in database
      await prisma.user.update({
        where: { id: userId },
        data: { avatar: null },
      });

      logger.info(`Avatar deleted for user: ${userId}`);

      res.json({ message: 'Avatar deleted successfully' });
    } catch (error) {
      logger.error('Delete avatar error:', error);
      next(error);
    }
  }

  /**
   * Upload cover image
   * POST /api/v1/profile/cover
   */
  async uploadCover(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check if S3 is configured
      if (!s3Service.isConfigured()) {
        return res.status(503).json({ 
          error: 'File upload service not configured',
          message: 'S3 credentials are missing'
        });
      }

      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { coverImage: true },
      });

      // Upload new cover to S3
      const coverUrl = await s3Service.uploadCover(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // Update user in database
      const user = await prisma.user.update({
        where: { id: userId },
        data: { coverImage: coverUrl },
        select: {
          id: true,
          coverImage: true,
        },
      });

      // Delete old cover from S3 (if exists)
      if (currentUser?.coverImage && currentUser.coverImage.includes('s3.amazonaws.com')) {
        await s3Service.deleteFile(currentUser.coverImage).catch(err => {
          logger.warn('Failed to delete old cover:', err);
        });
      }

      logger.info(`Cover image uploaded for user: ${userId}`);

      res.json({
        message: 'Cover image uploaded successfully',
        coverImage: user.coverImage,
      });
    } catch (error: any) {
      logger.error('Upload cover error:', error);
      
      if (error.message?.includes('Only image files')) {
        return res.status(400).json({ error: error.message });
      }
      
      next(error);
    }
  }

  /**
   * Delete cover image
   * DELETE /api/v1/profile/cover
   */
  async deleteCover(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { coverImage: true },
      });

      if (!currentUser?.coverImage) {
        return res.status(404).json({ error: 'No cover image to delete' });
      }

      // Delete from S3
      if (currentUser.coverImage.includes('s3.amazonaws.com')) {
        await s3Service.deleteFile(currentUser.coverImage).catch(err => {
          logger.warn('Failed to delete cover from S3:', err);
        });
      }

      // Update user in database
      await prisma.user.update({
        where: { id: userId },
        data: { coverImage: null },
      });

      logger.info(`Cover image deleted for user: ${userId}`);

      res.json({ message: 'Cover image deleted successfully' });
    } catch (error) {
      logger.error('Delete cover error:', error);
      next(error);
    }
  }

  /**
   * Get user settings
   * GET /api/v1/profile/settings
   */
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      let settings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      // Create default settings if not exists
      if (!settings) {
        settings = await prisma.userSettings.create({
          data: { userId },
        });
      }

      res.json({ settings });
    } catch (error) {
      logger.error('Get settings error:', error);
      next(error);
    }
  }

  /**
   * Update user settings
   * PUT /api/v1/profile/settings
   */
  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        profileVisibility,
        showEmail,
        showLocation,
        language,
        timezone,
        currency,
        preferences,
      } = req.body;

      const settings = await prisma.userSettings.upsert({
        where: { userId },
        create: {
          userId,
          profileVisibility,
          showEmail,
          showLocation,
          language,
          timezone,
          currency,
          preferences,
        },
        update: {
          profileVisibility,
          showEmail,
          showLocation,
          language,
          timezone,
          currency,
          preferences,
        },
      });

      logger.info(`Settings updated for user: ${userId}`);

      res.json({
        message: 'Settings updated successfully',
        settings,
      });
    } catch (error) {
      logger.error('Update settings error:', error);
      next(error);
    }
  }
}

export const profileController = new ProfileController();
