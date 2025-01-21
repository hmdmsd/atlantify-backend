import { Request, Response } from 'express';
import { radioService } from '../services/radio.service';
import { SongModel } from '../models/song.model';
import logger from '../utils/logger';
import { Op } from 'sequelize';

export class RadioController {
  /**
   * Get current radio queue state
   */
  async getQueue(req: Request, res: Response): Promise<void> {
    try {
      const queueState = radioService.getCurrentQueue();
      res.status(200).json({
        success: true,
        ...queueState,
      });
    } catch (error) {
      logger.error('Error retrieving queue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve queue',
      });
    }
  }

  /**
   * Add a song to the radio queue (Admin only)
   */
  async addToQueue(req: Request, res: Response): Promise<void> {
    try {
      const { songId } = req.body;
      const userId = req.user?.id;

      if (!songId || !userId) {
        res.status(400).json({
          success: false,
          message: 'Song ID and user ID are required',
        });
        return;
      }

      const queueItem = await radioService.addToQueue(songId, userId);
      res.status(201).json({
        success: true,
        queueItem,
      });
    } catch (error) {
      logger.error('Error adding to queue:', error);

      // Check for specific error types
      if (error.message === 'Only admin can add tracks to the queue') {
        res.status(403).json({
          success: false,
          message: 'Only admin can add tracks to the queue',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add song to queue',
      });
    }
  }

  /**
   * Remove a song from the radio queue (Admin only)
   */
  async removeFromQueue(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id || !userId) {
        res.status(400).json({
          success: false,
          message: 'Queue item ID and user ID are required',
        });
        return;
      }

      const success = await radioService.removeFromQueue(id, userId);
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Queue item not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Item removed from queue',
      });
    } catch (error) {
      logger.error('Error removing from queue:', error);

      // Check for specific error types
      if (error.message === 'Only admin can remove tracks from the queue') {
        res.status(403).json({
          success: false,
          message: 'Only admin can remove tracks from the queue',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to remove item from queue',
      });
    }
  }

  /**
   * Skip current track in the radio queue (Admin only)
   */
  async skipTrack(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      await radioService.skipCurrentTrack(userId);
      res.status(200).json({
        success: true,
        message: 'Track skipped successfully',
      });
    } catch (error) {
      logger.error('Error skipping track:', error);

      // Check for specific error types
      if (error.message === 'Only admin can skip tracks') {
        res.status(403).json({
          success: false,
          message: 'Only admin can skip tracks',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to skip track',
      });
    }
  }

  /**
   * Toggle radio status (start/stop) - Admin only
   */
  async toggleRadioStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const isRadioActive = await radioService.toggleRadioStatus(userId);
      res.status(200).json({
        success: true,
        isRadioActive,
        message: isRadioActive ? 'Radio started' : 'Radio stopped',
      });
    } catch (error) {
      logger.error('Error toggling radio status:', error);

      // Check for specific error types
      if (error.message === 'Only admin can toggle radio status') {
        res.status(403).json({
          success: false,
          message: 'Only admin can toggle radio status',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to toggle radio status',
      });
    }
  }

  /**
   * Search songs for adding to queue
   */
  async searchSongs(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;

      // If no search term, return all songs
      const whereClause = search
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: `%${search}%` } },
              { artist: { [Op.iLike]: `%${search}%` } },
            ],
          }
        : {};

      const songs = await SongModel.findAll({
        where: whereClause,
        attributes: ['id', 'title', 'artist', 'duration', 'publicUrl'],
        limit: 50, // Limit to prevent overwhelming results
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        songs,
      });
    } catch (error) {
      logger.error('Error searching songs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search songs',
      });
    }
  }
}
