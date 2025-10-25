import { z } from 'zod';

/**
 * Create API key validator
 */
export const createApiKeySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    permissions: z.array(z.enum(['read', 'write', 'delete'])).optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

/**
 * Delete API key validator
 */
export const deleteApiKeySchema = z.object({
  params: z.object({
    keyId: z.string().uuid('Invalid API key ID'),
  }),
});

/**
 * Rotate API key validator
 */
export const rotateApiKeySchema = z.object({
  params: z.object({
    keyId: z.string().uuid('Invalid API key ID'),
  }),
});
