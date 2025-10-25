import { Resend } from 'resend';
import { logger } from '../../utils/logger';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@tyriantrade.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

class EmailService {
  /**
   * Send email verification
   */
  async sendVerificationEmail(params: {
    email: string;
    username: string;
    verificationToken: string;
  }): Promise<void> {
    try {
      const { email, username, verificationToken } = params;
      const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Verify your Tyrian Trade account',
        html: this.getVerificationEmailTemplate(username, verificationUrl),
      });

      logger.info(`Verification email sent to: ${email}`);
    } catch (error: any) {
      logger.error('Failed to send verification email:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(params: {
    email: string;
    username: string;
    resetToken: string;
  }): Promise<void> {
    try {
      const { email, username, resetToken } = params;
      const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Reset your Tyrian Trade password',
        html: this.getPasswordResetEmailTemplate(username, resetUrl),
      });

      logger.info(`Password reset email sent to: ${email}`);
    } catch (error: any) {
      logger.error('Failed to send password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(params: {
    email: string;
    username: string;
  }): Promise<void> {
    try {
      const { email, username } = params;

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Welcome to Tyrian Trade!',
        html: this.getWelcomeEmailTemplate(username),
      });

      logger.info(`Welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error('Failed to send welcome email:', error);
      // Don't throw - welcome email is not critical
    }
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(params: {
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    try {
      const { email, subject, message } = params;

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject,
        html: this.getNotificationEmailTemplate(subject, message),
      });

      logger.info(`Notification email sent to: ${email}`);
    } catch (error: any) {
      logger.error('Failed to send notification email:', error);
      throw new Error(`Failed to send notification email: ${error.message}`);
    }
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return !!RESEND_API_KEY;
  }

  // ===========================================
  // EMAIL TEMPLATES
  // ===========================================

  private getVerificationEmailTemplate(username: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #18181b;">Tyrian Trade</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">Verify your email address</h2>
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                      Hi <strong>${username}</strong>,
                    </p>
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                      Thanks for signing up for Tyrian Trade! Please verify your email address by clicking the button below.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 24px 0;">
                          <a href="${verificationUrl}" 
                             style="display: inline-block; padding: 12px 32px; background-color: #16C784; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Verify Email
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 24px 0 0; font-size: 14px; line-height: 20px; color: #71717a;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 8px 0 0; font-size: 14px; line-height: 20px; color: #3b82f6; word-break: break-all;">
                      ${verificationUrl}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                      © ${new Date().getFullYear()} Tyrian Trade. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(username: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #18181b;">Tyrian Trade</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">Reset your password</h2>
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                      Hi <strong>${username}</strong>,
                    </p>
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                      We received a request to reset your password. Click the button below to choose a new password.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 24px 0;">
                          <a href="${resetUrl}" 
                             style="display: inline-block; padding: 12px 32px; background-color: #16C784; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 24px 0 0; font-size: 14px; line-height: 20px; color: #71717a;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 8px 0 0; font-size: 14px; line-height: 20px; color: #3b82f6; word-break: break-all;">
                      ${resetUrl}
                    </p>
                    <p style="margin: 24px 0 0; font-size: 14px; line-height: 20px; color: #ef4444;">
                      <strong>Important:</strong> If you didn't request a password reset, please ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                      © ${new Date().getFullYear()} Tyrian Trade. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(username: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Tyrian Trade</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #18181b;">🎉 Welcome to Tyrian Trade!</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                      Hi <strong>${username}</strong>,
                    </p>
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                      Welcome to Tyrian Trade - the premier platform for crypto trading and social interaction!
                    </p>
                    <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #52525b;">
                      Here's what you can do:
                    </p>
                    <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 28px; color: #52525b;">
                      <li>Share your trading insights and content</li>
                      <li>Monetize your expertise with paid posts and subscriptions</li>
                      <li>Connect with other traders and investors</li>
                      <li>Build your trading community</li>
                    </ul>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 24px 0;">
                          <a href="${FRONTEND_URL}" 
                             style="display: inline-block; padding: 12px 32px; background-color: #16C784; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Get Started
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                      © ${new Date().getFullYear()} Tyrian Trade. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getNotificationEmailTemplate(subject: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #18181b;">Tyrian Trade</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">${subject}</h2>
                    <div style="font-size: 16px; line-height: 24px; color: #52525b;">
                      ${message}
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                      © ${new Date().getFullYear()} Tyrian Trade. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
