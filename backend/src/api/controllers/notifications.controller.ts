import { Response, NextFunction } from 'express';
import { prisma } from '../../database/client';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../../utils/logger';

class NotificationsController {
  /**
   * Get notification settings
   * GET /api/v1/notification-settings
   */
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      let settings = await prisma.notificationSettings.findUnique({
        where: { userId },
      });

      // Create default settings if not exists
      if (!settings) {
        settings = await prisma.notificationSettings.create({
          data: {
            userId,
            enableSound: true,
            showDesktop: true,
            emailOnFollow: false,
            emailOnMention: true,
            emailOnComment: true,
            emailOnLike: true,
            emailOnNewPost: true,
            emailSuspiciousLogin: true,
            webOnFollow: true,
            webOnMention: true,
            webOnComment: true,
            webOnLike: true,
            webOnNewPost: true,
          },
        });
      }

      res.json({ settings });
    } catch (error) {
      logger.error('Get notification settings error:', error);
      next(error);
    }
  }

  /**
   * Update notification settings
   * PUT /api/v1/notification-settings
   */
  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const updateData = req.body;

      const settings = await prisma.notificationSettings.upsert({
        where: { userId },
        create: {
          userId,
          ...updateData,
        },
        update: updateData,
      });

      logger.info(`Notification settings updated for user: ${userId}`);

      res.json({
        message: 'Notification settings updated successfully',
        settings,
      });
    } catch (error) {
      logger.error('Update notification settings error:', error);
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
