import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Define Multer file interface locally
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: AWS.S3;
  private bucket: string;
  private cdnUrl: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get('S3_ENDPOINT', 'http://localhost:9000');
    const accessKeyId = this.configService.get('S3_ACCESS_KEY', 'minioadmin');
    const secretAccessKey = this.configService.get('S3_SECRET_KEY', 'minioadmin');
    this.bucket = this.configService.get('S3_BUCKET', 'afrify');
    this.cdnUrl = this.configService.get('CDN_URL', endpoint);

    this.s3 = new AWS.S3({
      endpoint,
      accessKeyId,
      secretAccessKey,
      s3ForcePathStyle: true, // Required for MinIO
      signatureVersion: 'v4',
    });

    this.ensureBucketExists();
  }

  /**
   * Ensure S3 bucket exists
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3.headBucket({ Bucket: this.bucket }).promise();
      this.logger.log(`Bucket ${this.bucket} exists`);
    } catch (error: any) {
      if (error.statusCode === 404) {
        this.logger.log(`Creating bucket ${this.bucket}`);
        await this.s3.createBucket({ Bucket: this.bucket }).promise();
        
        // Set bucket policy to allow public read
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        };
        
        await this.s3
          .putBucketPolicy({
            Bucket: this.bucket,
            Policy: JSON.stringify(policy),
          })
          .promise();
      } else {
        this.logger.error('Failed to check bucket', error);
      }
    }
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    file: MulterFile,
    folder: string = 'uploads',
  ): Promise<UploadResult> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const key = `${folder}/${uuidv4()}.${fileExtension}`;

      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      await this.s3.upload(uploadParams).promise();

      const url = `${this.cdnUrl}/${this.bucket}/${key}`;

      this.logger.log(`File uploaded: ${key}`);

      return {
        url,
        key,
        bucket: this.bucket,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('File upload failed', error);
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload and optimize image
   */
  async uploadImage(
    file: MulterFile,
    folder: string = 'images',
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {},
  ): Promise<UploadResult> {
    try {
      if (!file.mimetype.startsWith('image/')) {
        throw new HttpException(
          'File must be an image',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Default options
      const {
        width = 1920,
        height,
        quality = 80,
        format = 'jpeg',
      } = options;

      // Process image
      let processor = sharp(file.buffer);

      if (width || height) {
        processor = processor.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert format and optimize
      switch (format) {
        case 'jpeg':
          processor = processor.jpeg({ quality, progressive: true });
          break;
        case 'png':
          processor = processor.png({ quality, progressive: true });
          break;
        case 'webp':
          processor = processor.webp({ quality });
          break;
      }

      const optimizedBuffer = await processor.toBuffer();

      // Upload optimized image
      const key = `${folder}/${uuidv4()}.${format}`;

      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: key,
        Body: optimizedBuffer,
        ContentType: `image/${format}`,
        ACL: 'public-read',
        CacheControl: 'max-age=31536000', // 1 year cache
      };

      await this.s3.upload(uploadParams).promise();

      const url = `${this.cdnUrl}/${this.bucket}/${key}`;

      this.logger.log(
        `Image uploaded and optimized: ${key} (${file.size} -> ${optimizedBuffer.length} bytes)`,
      );

      return {
        url,
        key,
        bucket: this.bucket,
        size: optimizedBuffer.length,
        mimeType: `image/${format}`,
      };
    } catch (error) {
      this.logger.error('Image upload failed', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to upload image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload multiple images with different sizes
   */
  async uploadImageVariants(
    file: MulterFile,
    folder: string = 'images',
  ): Promise<{
    original: UploadResult;
    large: UploadResult;
    medium: UploadResult;
    thumbnail: UploadResult;
  }> {
    try {
      const [original, large, medium, thumbnail] = await Promise.all([
        this.uploadImage(file, folder, { quality: 90 }),
        this.uploadImage(file, folder, { width: 1200, quality: 85 }),
        this.uploadImage(file, folder, { width: 600, quality: 80 }),
        this.uploadImage(file, folder, { width: 200, quality: 75 }),
      ]);

      return { original, large, medium, thumbnail };
    } catch (error) {
      this.logger.error('Failed to upload image variants', error);
      throw new HttpException(
        'Failed to upload image variants',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();

      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error('File deletion failed', error);
      throw new HttpException(
        'Failed to delete file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;

      await this.s3
        .deleteObjects({
          Bucket: this.bucket,
          Delete: {
            Objects: keys.map((key) => ({ Key: key })),
          },
        })
        .promise();

      this.logger.log(`Deleted ${keys.length} files`);
    } catch (error) {
      this.logger.error('Batch file deletion failed', error);
      throw new HttpException(
        'Failed to delete files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const url = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn,
      });

      return url;
    } catch (error) {
      this.logger.error('Failed to generate signed URL', error);
      throw new HttpException(
        'Failed to generate signed URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3
        .headObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<AWS.S3.HeadObjectOutput> {
    try {
      const metadata = await this.s3
        .headObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();

      return metadata;
    } catch (error) {
      this.logger.error('Failed to get file metadata', error);
      throw new HttpException(
        'Failed to get file metadata',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
