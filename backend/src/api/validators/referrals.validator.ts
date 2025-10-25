import { z } from 'zod';

/**
 * Generate referral link validator
 */
export const generateLinkSchema = z.object({
  body: z.object({
    campaign: z.string().max(100).optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

/**
 * Track referral click validator
 */
export const trackClickSchema = z.object({
  body: z.object({
    referralCode: z.string().min(1, 'Referral code is required'),
    source: z.string().max(100).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

/**
 * Get referral stats validator
 */
export const getStatsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    groupBy: z.enum(['day', 'week', 'month']).optional(),
  }),
});
