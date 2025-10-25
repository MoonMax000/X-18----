import { z } from 'zod';

/**
 * Submit KYC documents validator
 */
export const submitKycSchema = z.object({
  body: z.object({
    documentType: z.enum(['passport', 'id_card', 'drivers_license', 'proof_of_address']),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    country: z.string().length(2, 'Country must be 2-letter ISO code'),
    address: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().optional(),
      postalCode: z.string().min(1, 'Postal code is required'),
      country: z.string().length(2, 'Country must be 2-letter ISO code'),
    }),
  }),
});

/**
 * Update KYC verification status validator (Admin only)
 */
export const updateVerificationSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
    rejectionReason: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
  }),
});
