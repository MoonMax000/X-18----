import { z } from 'zod';

/**
 * Update notification settings validator
 */
export const updateNotificationSettingsSchema = z.object({
  body: z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    
    // Notification types
    newFollower: z.boolean().optional(),
    newComment: z.boolean().optional(),
    newLike: z.boolean().optional(),
    newPost: z.boolean().optional(),
    newSubscriber: z.boolean().optional(),
    newPurchase: z.boolean().optional(),
    newTip: z.boolean().optional(),
    
    // System notifications
    systemUpdates: z.boolean().optional(),
    securityAlerts: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
    
    // Frequency
    digestFrequency: z.enum(['realtime', 'hourly', 'daily', 'weekly', 'never']).optional(),
  }),
});
