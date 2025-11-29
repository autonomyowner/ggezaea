import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('r2.endpoint');
    const accessKeyId = this.configService.get<string>('r2.accessKeyId');
    const secretAccessKey = this.configService.get<string>('r2.secretAccessKey');
    const bucketName = this.configService.get<string>('r2.bucketName');

    this.isConfigured = !!(endpoint && accessKeyId && secretAccessKey && bucketName);

    if (!this.isConfigured) {
      this.logger.warn('R2 storage not fully configured - storage features disabled');
      this.bucket = '';
      this.client = null as any;
      return;
    }

    this.bucket = bucketName!;
    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });

    this.logger.log('R2 storage configured successfully');
  }

  /**
   * Upload a file to R2
   */
  async upload(params: {
    key: string;
    body: Buffer | string;
    contentType: string;
    metadata?: Record<string, string>;
  }): Promise<{ key: string; url: string }> {
    if (!this.isConfigured) {
      throw new Error('R2 storage not configured');
    }

    const { key, body, contentType, metadata } = params;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
      }),
    );

    this.logger.log(`Uploaded file: ${key}`);

    return {
      key,
      url: await this.getSignedUrl(key),
    };
  }

  /**
   * Get a signed URL for private file access
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('R2 storage not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Download a file from R2
   */
  async download(key: string): Promise<Buffer> {
    if (!this.isConfigured) {
      throw new Error('R2 storage not configured');
    }

    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    const stream = response.Body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  /**
   * Delete a file from R2
   */
  async delete(key: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('R2 storage not configured');
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    this.logger.log(`Deleted file: ${key}`);
  }

  /**
   * Check if a file exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a unique key for user files
   */
  generateKey(userId: string, folder: string, filename: string): string {
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `users/${userId}/${folder}/${timestamp}-${sanitized}`;
  }

  /**
   * Check if R2 is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}
