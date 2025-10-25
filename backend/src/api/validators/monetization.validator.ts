import { z } from 'zod';

/**
 * Get earnings validator
 */
export const getEarningsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    groupBy: z.enum(['day', 'week', 'month', 'year']).optional(),
  }),
});

/**
 * Request payout validator
 */
export const requestPayoutSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    currency: z.string().length(3, 'Currency must be 3-letter ISO code').optional(),
    method: z.enum(['stripe', 'bank_transfer']).optional(),
  }),
});

/**
 * Create checkout session validator
 */
export const createCheckoutSchema = z.object({
  body: z.object({
    type: z.enum(['post', 'subscription', 'tip']),
    postId: z.string().uuid().optional(),
    authorId: z.string().uuid().optional(),
    amount: z.number().positive('Amount must be positive').optional(),
    plan: z.enum(['monthly', 'yearly']).optional(),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
  }),
});
