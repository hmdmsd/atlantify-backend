import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { s3Config } from '../config/s3.config';
import logger from '../utils/logger';

interface S3Metadata {
  [key: string]: string;
}

export class S3Service {
  private s3: AWS.S3;

  constructor() {
    // Configure S3 client specifically for Garage
    this.s3 = new AWS.S3({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
      sslEnabled: true,
    });
  }

  async uploadFile(
    filePath: string,
    key: string,
    metadata?: S3Metadata,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const fileStream = fs.createReadStream(filePath);
      const fileSize = fs.statSync(filePath).size;
      let uploadedBytes = 0;

      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: s3Config.bucket,
        Key: `songs/${key}`,
        Body: fileStream,
        ContentType: this.getContentType(key),
        ACL: 'private',
        Metadata: metadata,
      };

      return new Promise((resolve, reject) => {
        const upload = this.s3.upload(uploadParams, (err, data) => {
          if (err) {
            logger.error('S3 Upload Error:', err);
            return reject(err);
          }
          resolve(data.Location);
        });

        fileStream.on('data', (chunk) => {
          uploadedBytes += chunk.length;
          if (onProgress) {
            const progress = Math.round((uploadedBytes / fileSize) * 100);
            onProgress(progress);
          }
        });

        fileStream.on('error', (err) => {
          logger.error('File Stream Error:', err);
          reject(err);
        });
      });
    } catch (error) {
      logger.error('Upload File Error:', error);
      throw error;
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    try {
      const params = {
        Bucket: s3Config.bucket,
        Key: key,
        Expires: 3600, // 1 hour
        ResponseContentType: this.getContentType(path.basename(key)),
        ResponseContentDisposition: 'inline',
      };

      // Get signed URL with specific Garage configuration
      const signedUrl = await this.s3.getSignedUrlPromise('getObject', params);
      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: s3Config.bucket,
          Key: key,
        })
        .promise();
    } catch (error) {
      logger.error('Delete File Error:', error);
      throw error;
    }
  }

  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase().slice(1);
    switch (ext) {
      case 'mp3':
        return 'audio/mpeg';
      case 'ogg':
        return 'audio/ogg';
      case 'wav':
        return 'audio/wav';
      default:
        return 'application/octet-stream';
    }
  }
}
