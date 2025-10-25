import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { notificationsController } from '../controllers/notifications.controller';
import { updateNotificationSettingsSchema } from '../validators/notifications.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/notification-settings
 * @desc    Get notification settings
 * @access  Private
 */
router.get('/', notificationsController.getSettings);

/**
 * @route   PUT /api/v1/notification-settings
 * @desc    Update notification settings
 * @access  Private
 */
router.put(
  '/',
  validateRequest(updateNotificationSettingsSchema),
  notificationsController.updateSettings
);

export default router;
