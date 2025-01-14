import AWS from 'aws-sdk';
import { s3Config, s3Credentials } from '../config/s3.config';
import fs from 'fs';
import path from 'path';

export class S3Service {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      accessKeyId: s3Credentials.accessKeyId,
      secretAccessKey: s3Credentials.secretAccessKey,
      s3ForcePathStyle: true, // Needed for S3-compatible services like Deuxfleurs Garage
    });
  }

  /**
   * Uploads a file to S3.
   * @param localFilePath - Path to the file on the local system.
   * @param key - S3 object key (path in the bucket).
   * @returns The S3 URL of the uploaded file.
   */
  async uploadFile(localFilePath: string, key: string): Promise<string> {
    try {
      const fileContent = fs.readFileSync(localFilePath);

      await this.s3
        .putObject({
          Bucket: s3Config.bucket,
          Key: key,
          Body: fileContent,
          ContentType: this.getMimeType(localFilePath),
        })
        .promise();

      console.log(`File uploaded to S3: ${key}`);
      return `${s3Config.endpoint}/${s3Config.bucket}/${key}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3.');
    } finally {
      // Optionally delete the local file after uploading
      fs.unlinkSync(localFilePath);
    }
  }

  /**
   * Deletes a file from S3.
   * @param key - S3 object key (path in the bucket).
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: s3Config.bucket,
          Key: key,
        })
        .promise();

      console.log(`File deleted from S3: ${key}`);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file from S3.');
    }
  }

  /**
   * Retrieves a file's signed URL for direct download.
   * @param key - S3 object key (path in the bucket).
   * @param expiresInSeconds - Expiration time for the signed URL (default: 3600 seconds).
   * @returns The signed URL for downloading the file.
   */
  async getSignedUrl(
    key: string,
    expiresInSeconds: number = 3600
  ): Promise<string> {
    try {
      const signedUrl = this.s3.getSignedUrl('getObject', {
        Bucket: s3Config.bucket,
        Key: key,
        Expires: expiresInSeconds,
      });

      console.log(`Generated signed URL: ${signedUrl}`);
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL.');
    }
  }

  /**
   * Determines the MIME type of a file based on its extension.
   * @param filePath - Path to the file.
   * @returns The MIME type as a string.
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.mp3': 'audio/mpeg',
      '.ogg': 'audio/ogg',
      '.wav': 'audio/wav',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}
