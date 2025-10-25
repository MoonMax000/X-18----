import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../../utils/logger';

// AWS S3 Configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || '';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

// Initialize S3 Client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

class S3Service {
  /**
   * Upload file to S3
   */
  async uploadFile(params: {
    file: Buffer;
    fileName: string;
    mimeType: string;
    folder?: string;
  }): Promise<string> {
    try {
      const { file, fileName, mimeType, folder = 'uploads' } = params;

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const key = `${folder}/${timestamp}-${randomString}-${fileName}`;

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: key,
        Body: file,
        ContentType: mimeType,
        ACL: 'public-read', // Make file publicly accessible
      });

      await s3Client.send(command);

      // Return public URL
      const url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
      
      logger.info(`File uploaded to S3: ${url}`);
      
      return url;
    } catch (error: any) {
      logger.error('S3 upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    return this.uploadFile({
      file,
      fileName,
      mimeType,
      folder: 'avatars',
    });
  }

  /**
   * Upload cover image
   */
  async uploadCover(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    return this.uploadFile({
      file,
      fileName,
      mimeType,
      folder: 'covers',
    });
  }

  /**
   * Upload KYC document
   */
  async uploadKycDocument(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    return this.uploadFile({
      file,
      fileName,
      mimeType,
      folder: 'kyc',
    });
  }

  /**
   * Delete file from S3
   */
  async deleteFile(url: string): Promise<void> {
    try {
      // Extract key from URL
      const urlParts = url.split('.amazonaws.com/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid S3 URL');
      }

      const key = urlParts[1];

      const command = new DeleteObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: key,
      });

      await s3Client.send(command);

      logger.info(`File deleted from S3: ${url}`);
    } catch (error: any) {
      logger.error('S3 delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Check if S3 is configured
   */
  isConfigured(): boolean {
    return !!(AWS_S3_BUCKET && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);
  }
}

export const s3Service = new S3Service();
