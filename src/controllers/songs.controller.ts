import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { SongsService } from '../services/songs.service';
import { S3Service } from '../services/s3.service';
import logger from '../utils/logger';
import { UploadedRequest } from '../middleware/upload.middleware';

export class SongsController {
  private songsService: SongsService;
  private s3Service: S3Service;

  constructor() {
    this.songsService = new SongsService();
    this.s3Service = new S3Service();
  }

  async listSongs(req: Request, res: Response): Promise<void> {
    try {
      const songs = await this.songsService.listSongs();

      // Get signed URLs for all songs
      const songsWithUrls = await Promise.all(
        songs.map(async (song) => ({
          ...song.toJSON(),
          publicUrl: await this.s3Service.getSignedUrl(song.path),
        }))
      );

      res.status(200).json({ success: true, songs: songsWithUrls });
    } catch (error) {
      logger.error('Error listing songs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve songs',
      });
    }
  }

  async getSongDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const song = await this.songsService.getSongDetails(id);

      if (!song) {
        res.status(404).json({
          success: false,
          message: 'Song not found',
        });
        return;
      }

      // Generate a signed URL that expires in 1 hour
      const signedUrl = await this.s3Service.getSignedUrl(song.path);

      res.status(200).json({
        success: true,
        song: {
          ...song.toJSON(),
          publicUrl: signedUrl,
        },
      });
    } catch (error) {
      logger.error('Error retrieving song details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve song details',
      });
    }
  }

  async uploadSong(req: UploadedRequest, res: Response): Promise<void> {
    let filePath: string | null = null;
    try {
      const file = req.file;
      const { title, artist } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('Authentication required');
      }

      filePath = file.path;

      // Sanitize filename
      const sanitizedFilename =
        `${artist}-${title}`.toLowerCase().replace(/[^a-z0-9-]/g, '-') +
        path.extname(file.originalname);

      const s3Key = `songs/${sanitizedFilename}`;

      // Upload to S3 with proper metadata
      const s3Url = await this.s3Service.uploadFile(
        filePath,
        sanitizedFilename,
        {
          'Content-Type': file.mimetype,
          'x-amz-meta-title': title,
          'x-amz-meta-artist': artist,
          'x-amz-meta-uploadedBy': userId,
        }
      );

      // Calculate duration
      const duration = this.estimateDuration(file.size);

      // Create song entry in database
      const song = await this.songsService.createSong({
        title,
        artist,
        path: s3Key,
        size: file.size,
        duration,
        uploadedBy: userId,
      });

      // Get signed URL
      const signedUrl = await this.s3Service.getSignedUrl(s3Key);

      // Clean up local file
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.status(201).json({
        success: true,
        song: {
          ...song.toJSON(),
          publicUrl: signedUrl,
        },
      });
    } catch (error) {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      logger.error('Error uploading song:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to upload song',
      });
    }
  }

  async streamSong(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const song = await this.songsService.getSongDetails(id);

      if (!song) {
        res.status(404).json({
          success: false,
          message: 'Song not found',
        });
        return;
      }

      // Get a signed URL for the song
      const signedUrl = await this.s3Service.getSignedUrl(song.path);

      // Redirect to the signed URL
      res.redirect(signedUrl);
    } catch (error) {
      logger.error('Error streaming song:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stream song',
      });
    }
  }

  private estimateDuration(fileSize: number): number {
    const estimatedDurationInSeconds = Math.round(
      (fileSize / (1024 * 1024)) * 3 * 60
    );
    return Math.max(0, estimatedDurationInSeconds);
  }

  async deleteSong(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const song = await this.songsService.getSongDetails(id);
      if (!song || song.uploadedBy !== userId) {
        res.status(404).json({
          success: false,
          message: 'Song not found or unauthorized',
        });
        return;
      }

      await this.s3Service.deleteFile(song.path);
      await this.songsService.deleteSong(id, userId);

      res.status(200).json({
        success: true,
        message: 'Song deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting song:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete song',
      });
    }
  }
}
