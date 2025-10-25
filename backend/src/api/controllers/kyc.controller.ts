import { Response, NextFunction } from 'express';
import { prisma } from '../../database/client';
import { s3Service } from '../../services/storage/s3.service';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../../utils/logger';

class KycController {
  /**
   * Get KYC verification status
   * GET /api/v1/kyc
   */
  async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const kyc = await prisma.kycVerification.findUnique({
        where: { userId },
        select: {
          id: true,
          status: true,
          documentType: true,
          submittedAt: true,
          reviewedAt: true,
          rejectionReason: true,
          verifiedAt: true,
        },
      });

      res.json({
        kyc: kyc || { status: 'not_submitted' },
      });
    } catch (error) {
      logger.error('Get KYC status error:', error);
      next(error);
    }
  }

  /**
   * Submit KYC documents
   * POST /api/v1/kyc
   */
  async submitDocuments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        documentType,
        firstName,
        lastName,
        dateOfBirth,
        country,
        address,
      } = req.body;

      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'Document file is required' });
      }

      // Check if S3 is configured
      if (!s3Service.isConfigured()) {
        return res.status(503).json({
          error: 'File upload service not configured',
          message: 'KYC document upload is currently unavailable',
        });
      }

      // Upload document to S3
      const documentUrl = await s3Service.uploadKycDocument(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // Create or update KYC verification
      const kyc = await prisma.kycVerification.upsert({
        where: { userId },
        create: {
          userId,
          status: 'pending',
          documentType,
          documentUrl,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          country,
          address,
          submittedAt: new Date(),
        },
        update: {
          status: 'pending',
          documentType,
          documentUrl,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          country,
          address,
          submittedAt: new Date(),
          rejectionReason: null,
          reviewedAt: null,
        },
      });

      logger.info(`KYC documents submitted for user: ${userId}`);

      res.json({
        message: 'KYC documents submitted successfully',
        kyc: {
          id: kyc.id,
          status: kyc.status,
          submittedAt: kyc.submittedAt,
        },
      });
    } catch (error: any) {
      logger.error('Submit KYC documents error:', error);
      next(error);
    }
  }

  /**
   * Get KYC documents (for review - admin or user)
   * GET /api/v1/kyc/documents
   */
  async getDocuments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const kyc = await prisma.kycVerification.findUnique({
        where: { userId },
        select: {
          id: true,
          documentType: true,
          documentUrl: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          country: true,
          address: true,
          status: true,
          submittedAt: true,
        },
      });

      if (!kyc) {
        return res.status(404).json({ error: 'KYC verification not found' });
      }

      res.json({ kyc });
    } catch (error) {
      logger.error('Get KYC documents error:', error);
      next(error);
    }
  }

  /**
   * Update KYC verification status (Admin only)
   * PUT /api/v1/kyc/:userId/status
   */
  async updateVerification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { status, rejectionReason, notes } = req.body;

      // TODO: Add admin role check
      // if (!req.user!.isAdmin) {
      //   return res.status(403).json({ error: 'Admin access required' });
      // }

      const kyc = await prisma.kycVerification.update({
        where: { userId },
        data: {
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : null,
          notes,
          reviewedAt: new Date(),
          verifiedAt: status === 'approved' ? new Date() : null,
        },
      });

      logger.info(`KYC verification updated for user ${userId}: ${status}`);

      res.json({
        message: 'KYC verification updated successfully',
        kyc: {
          id: kyc.id,
          status: kyc.status,
          reviewedAt: kyc.reviewedAt,
        },
      });
    } catch (error) {
      logger.error('Update KYC verification error:', error);
      next(error);
    }
  }
}

export const kycController = new KycController();
