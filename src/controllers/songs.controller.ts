import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { SongsService } from '../services/songs.service';
import { S3Service } from '../services/s3.service';
import logger from '../utils/logger';
import * as mm from 'music-metadata';
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
      res.status(200).json({ success: true, songs });
    } catch (error) {
      logger.error('Error listing songs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve songs',
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

      // Fallback duration calculation
      const duration = this.estimateDuration(file.size);

      // Sanitize filename
      const sanitizedFilename =
        `${artist}-${title}`.toLowerCase().replace(/[^a-z0-9-]/g, '-') +
        path.extname(file.originalname);

      const s3Key = `songs/${sanitizedFilename}`;

      // Upload to S3
      const s3Url = await this.s3Service.uploadFile(
        filePath,
        sanitizedFilename
      );

      // Create song entry in database
      const song = await this.songsService.createSong({
        title,
        artist,
        path: s3Key,
        size: file.size,
        duration: duration,
        uploadedBy: userId,
      });

      // Always try to delete local file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        logger.error('Error cleaning up local file:', cleanupError);
      }

      res.status(201).json({
        success: true,
        song,
        uploadUrl: s3Url,
      });
    } catch (error) {
      // If local file exists, try to delete it
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          logger.error('Error cleaning up local file:', cleanupError);
        }
      }

      logger.error('Error uploading song:', error);

      // More detailed error response
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to upload song',
      });
    }
  }

  // Simple duration estimation based on file size
  private estimateDuration(fileSize: number): number {
    // Rough estimate: assume 1 MB = ~3 minutes for MP3
    // This is a very rough approximation and should be replaced with proper audio duration detection
    const estimatedDurationInSeconds = Math.round(
      (fileSize / (1024 * 1024)) * 3 * 60
    );
    return Math.max(0, estimatedDurationInSeconds);
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

      res.status(200).json({
        success: true,
        song: {
          ...song.toJSON(),
          // Generate public URL
          publicUrl: this.s3Service.getPublicUrl(song.path),
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

      // Delete from S3
      await this.s3Service.deleteFile(song.path);

      // Delete from database
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
