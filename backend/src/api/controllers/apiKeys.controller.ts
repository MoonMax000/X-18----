import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../../database/client';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../../utils/logger';

class ApiKeysController {
  /**
   * Generate API key
   */
  private generateKey(): string {
    return `tk_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Get all API keys for user
   * GET /api/v1/api-keys
   */
  async getKeys(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const keys = await prisma.apiKey.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          key: true,
          lastUsedAt: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Mask keys for security
      const maskedKeys = keys.map(k => ({
        ...k,
        key: k.key.substring(0, 12) + '...',
      }));

      res.json({ keys: maskedKeys });
    } catch (error) {
      logger.error('Get API keys error:', error);
      next(error);
    }
  }

  /**
   * Create new API key
   * POST /api/v1/api-keys
   */
  async createKey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name, scopes, expiresAt } = req.body;

      const key = this.generateKey();
      const keyHash = await require('bcrypt').hash(key, 10);

      const apiKey = await prisma.apiKey.create({
        data: {
          userId,
          name,
          key,
          keyHash,
          scopes: scopes || [],
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });

      logger.info(`API key created for user: ${userId}`);

      res.status(201).json({
        message: 'API key created successfully',
        key: apiKey.key, // Return full key only once
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.key.substring(0, 12) + '...',
          createdAt: apiKey.createdAt,
        },
      });
    } catch (error) {
      logger.error('Create API key error:', error);
      next(error);
    }
  }

  /**
   * Delete API key
   * DELETE /api/v1/api-keys/:keyId
   */
  async deleteKey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { keyId } = req.params;

      // Verify ownership
      const apiKey = await prisma.apiKey.findUnique({
        where: { id: keyId },
        select: { userId: true },
      });

      if (!apiKey || apiKey.userId !== userId) {
        return res.status(404).json({ error: 'API key not found' });
      }

      await prisma.apiKey.delete({
        where: { id: keyId },
      });

      logger.info(`API key deleted: ${keyId}`);

      res.json({ message: 'API key deleted successfully' });
    } catch (error) {
      logger.error('Delete API key error:', error);
      next(error);
    }
  }

  /**
   * Rotate API key (generate new key, keep same ID)
   * POST /api/v1/api-keys/:keyId/rotate
   */
  async rotateKey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { keyId } = req.params;

      // Verify ownership
      const apiKey = await prisma.apiKey.findUnique({
        where: { id: keyId },
        select: { userId: true },
      });

      if (!apiKey || apiKey.userId !== userId) {
        return res.status(404).json({ error: 'API key not found' });
      }

      const newKey = this.generateKey();
      const keyPrefix = newKey.substring(0, 12) + '...';

      const updated = await prisma.apiKey.update({
        where: { id: keyId },
        data: {
          key: newKey,
          keyPrefix,
        },
      });

      logger.info(`API key rotated: ${keyId}`);

      res.json({
        message: 'API key rotated successfully',
        key: updated.key, // Return full key only once
        apiKey: {
          id: updated.id,
          name: updated.name,
          keyPrefix: updated.keyPrefix,
          createdAt: updated.createdAt,
        },
      });
    } catch (error) {
      logger.error('Rotate API key error:', error);
      next(error);
    }
  }
}

export const apiKeysController = new ApiKeysController();
