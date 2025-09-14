import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export interface UploadResult {
  url: string;
  key: string;
}

export class S3Service {
  static async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
    folder: string = 'uploads'
  ): Promise<UploadResult> {
    try {
      // Validate environment variables
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        throw new Error('AWS credentials not configured');
      }

      if (!BUCKET_NAME) {
        throw new Error('AWS S3 bucket name not configured');
      }

      const key = `${folder}/${Date.now()}-${fileName}`;

      // Debug log removed

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
       
      });

      await s3Client.send(command);

      const region = process.env.AWS_REGION || 'us-east-1';
      const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

      // Debug log removed

      return { url, key };
    } catch (error) {
      console.error('S3 upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown S3 error';
      throw new Error(`Failed to upload file to S3: ${errorMessage}`);
    }
  }

  static async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  static async uploadImage(
    file: Buffer,
    fileName: string,
    folder: string = 'images'
  ): Promise<UploadResult> {
    // Validate image file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const contentType = this.getContentType(fileName);

    if (!allowedTypes.includes(contentType)) {
      throw new Error('Invalid image file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    return this.uploadFile(file, fileName, contentType, folder);
  }

  static async uploadPDF(
    file: Buffer,
    fileName: string,
    folder: string = 'pdfs'
  ): Promise<UploadResult> {
    // Validate PDF file
    const contentType = this.getContentType(fileName);

    if (contentType !== 'application/pdf') {
      throw new Error('Invalid file type. Only PDF files are allowed.');
    }

    return this.uploadFile(file, fileName, contentType, folder);
  }

  static getContentType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const contentTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  static validateFileSize(file: Buffer, maxSizeMB: number = 10): void {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.length > maxSizeBytes) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }
  }
}

export default S3Service;
