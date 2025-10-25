import { z } from 'zod';

/**
 * Get invoices validator
 */
export const getInvoicesSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    startingAfter: z.string().optional(),
    status: z.enum(['paid', 'open', 'uncollectible', 'void']).optional(),
  }),
});

/**
 * Update subscription plan validator
 */
export const updatePlanSchema = z.object({
  body: z.object({
    plan: z.enum(['monthly', 'yearly']),
    priceId: z.string().optional(),
  }),
});

/**
 * Cancel subscription validator
 */
export const cancelSubscriptionSchema = z.object({
  body: z.object({
    reason: z.string().max(500).optional(),
    feedback: z.string().max(1000).optional(),
    cancelAtPeriodEnd: z.boolean().default(true),
  }),
});
