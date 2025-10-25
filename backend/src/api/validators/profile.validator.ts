import { z } from 'zod';

/**
 * Update profile validator
 */
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name cannot be empty').optional(),
    lastName: z.string().min(1, 'Last name cannot be empty').optional(),
    displayName: z.string().min(1, 'Display name cannot be empty').max(100).optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    location: z.string().max(100).optional(),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    role: z.string().max(50).optional(),
    sectors: z.array(z.string()).optional(),
  }),
});

/**
 * Upload avatar validator
 * Note: File validation happens in multer middleware
 */
export const uploadAvatarSchema = z.object({
  body: z.object({}).optional(),
});

/**
 * Update settings validator
 */
export const updateSettingsSchema = z.object({
  body: z.object({
    profileVisibility: z.enum(['public', 'followers', 'private']).optional(),
    showEmail: z.boolean().optional(),
    showLocation: z.boolean().optional(),
    language: z.string().min(2).max(5).optional(),
    timezone: z.string().optional(),
    currency: z.string().length(3).optional(),
    preferences: z.record(z.any()).optional(),
  }),
});
