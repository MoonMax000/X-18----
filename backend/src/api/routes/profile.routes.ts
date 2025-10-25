import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  profileController,
  uploadAvatar as uploadAvatarMiddleware,
  uploadCover as uploadCoverMiddleware
} from '../controllers/profile.controller';
import { updateProfileSchema, updateSettingsSchema } from '../validators/profile.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/', profileController.getProfile);

/**
 * @route   PUT /api/v1/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/',
  validateRequest(updateProfileSchema),
  profileController.updateProfile
);

/**
 * @route   POST /api/v1/profile/avatar
 * @desc    Upload avatar
 * @access  Private
 */
router.post(
  '/avatar',
  uploadAvatarMiddleware,
  profileController.uploadAvatar
);

/**
 * @route   DELETE /api/v1/profile/avatar
 * @desc    Delete avatar
 * @access  Private
 */
router.delete('/avatar', profileController.deleteAvatar);

/**
 * @route   POST /api/v1/profile/cover
 * @desc    Upload cover image
 * @access  Private
 */
router.post('/cover', uploadCoverMiddleware, profileController.uploadCover);

/**
 * @route   DELETE /api/v1/profile/cover
 * @desc    Delete cover image
 * @access  Private
 */
router.delete('/cover', profileController.deleteCover);

/**
 * @route   GET /api/v1/profile/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/settings', profileController.getSettings);

/**
 * @route   PUT /api/v1/profile/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put(
  '/settings',
  validateRequest(updateSettingsSchema),
  profileController.updateSettings
);

export default router;
