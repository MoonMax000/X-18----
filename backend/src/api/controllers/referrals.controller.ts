import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../../database/client';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../../utils/logger';

class ReferralsController {
  /**
   * Generate referral code
   */
  private generateReferralCode(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  /**
   * Get referral statistics
   * GET /api/v1/referrals/stats
   */
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { startDate, endDate, groupBy } = req.query;

      // Get total referrals
      const totalReferrals = await prisma.referral.count({
        where: {
          referrerId: userId,
          ...(startDate && endDate && {
            createdAt: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          }),
        },
      });

      // Get active referrals (users who signed up)
      const activeReferrals = await prisma.referral.count({
        where: {
          referrerId: userId,
          referredId: { not: null },
        },
      });

      // Get total earnings from referrals
      const earnings = await prisma.referral.aggregate({
        where: {
          referrerId: userId,
          referredId: { not: null },
        },
        _sum: {
          revenueShared: true,
        },
      });

      // Get total clicks
      const totalClicks = await prisma.referral.aggregate({
        where: { referrerId: userId },
        _sum: {
          clicks: true,
        },
      });

      res.json({
        stats: {
          totalReferrals,
          activeReferrals,
          pendingReferrals: totalReferrals - activeReferrals,
          totalEarnings: earnings._sum.revenueShared || 0,
          totalClicks: totalClicks._sum.clicks || 0,
          conversionRate: totalClicks._sum.clicks
            ? (activeReferrals / (totalClicks._sum.clicks || 1)) * 100
            : 0,
        },
      });
    } catch (error) {
      logger.error('Get referral stats error:', error);
      next(error);
    }
  }

  /**
   * Get referral list
   * GET /api/v1/referrals
   */
  async getReferrals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const referrals = await prisma.referral.findMany({
        where: { referrerId: userId },
        include: {
          referred: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ referrals });
    } catch (error) {
      logger.error('Get referrals error:', error);
      next(error);
    }
  }

  /**
   * Generate referral link
   * POST /api/v1/referrals/generate
   */
  async generateLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { campaign, expiresAt } = req.body;

      // Find or create a referral for this user
      let existingReferral = await prisma.referral.findFirst({
        where: { referrerId: userId },
        select: { code: true },
      });

      let referralCode = existingReferral?.code;

      // Generate new code if doesn't exist
      if (!referralCode) {
        referralCode = this.generateReferralCode();

        await prisma.referral.create({
          data: {
            referrerId: userId,
            code: referralCode,
          },
        });
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      const referralUrl = `${frontendUrl}/signup?ref=${referralCode}${campaign ? `&campaign=${campaign}` : ''}`;

      logger.info(`Referral link generated for user: ${userId}`);

      res.json({
        message: 'Referral link generated successfully',
        referralCode,
        referralUrl,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });
    } catch (error) {
      logger.error('Generate referral link error:', error);
      next(error);
    }
  }

  /**
   * Track referral click
   * POST /api/v1/referrals/track
   */
  async trackClick(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { referralCode, source, metadata } = req.body;

      // Find referral by code
      const referral = await prisma.referral.findUnique({
        where: { code: referralCode },
        select: { referrerId: true, id: true },
      });

      if (!referral) {
        return res.status(404).json({ error: 'Invalid referral code' });
      }

      // Increment click count
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });

      logger.info(`Referral click tracked for code: ${referralCode}`);

      res.json({
        message: 'Referral click tracked successfully',
        referralCode,
      });
    } catch (error) {
      logger.error('Track referral click error:', error);
      next(error);
    }
  }
}

export const referralsController = new ReferralsController();
