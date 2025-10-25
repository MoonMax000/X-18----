import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { apiKeysController } from '../controllers/apiKeys.controller';
import {
  createApiKeySchema,
  deleteApiKeySchema,
  rotateApiKeySchema,
} from '../validators/apiKeys.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/api-keys
 * @desc    Get all API keys for user
 * @access  Private
 */
router.get('/', apiKeysController.getKeys);

/**
 * @route   POST /api/v1/api-keys
 * @desc    Create new API key
 * @access  Private
 */
router.post(
  '/',
  validateRequest(createApiKeySchema),
  apiKeysController.createKey
);

/**
 * @route   DELETE /api/v1/api-keys/:keyId
 * @desc    Delete API key
 * @access  Private
 */
router.delete(
  '/:keyId',
  validateRequest(deleteApiKeySchema),
  apiKeysController.deleteKey
);

/**
 * @route   POST /api/v1/api-keys/:keyId/rotate
 * @desc    Rotate API key (generate new key)
 * @access  Private
 */
router.post(
  '/:keyId/rotate',
  validateRequest(rotateApiKeySchema),
  apiKeysController.rotateKey
);

export default router;
