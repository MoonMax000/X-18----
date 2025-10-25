import { z } from 'zod';

export const updateStripeKeysSchema = z.object({
  secretKey: z.string().min(1, 'Secret key is required').startsWith('sk_', 'Invalid secret key format').optional(),
  publishableKey: z.string().min(1, 'Publishable key is required').startsWith('pk_', 'Invalid publishable key format').optional(),
  webhookSecret: z.string().min(1).startsWith('whsec_', 'Invalid webhook secret format').optional(),
}).refine(
  data => data.secretKey || data.publishableKey || data.webhookSecret,
  'At least one field must be provided'
);
