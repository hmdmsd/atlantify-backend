import { Request, Response } from 'express';
import { radioService } from '../services/radio.service';
import logger from '../utils/logger';

export class RadioController {
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
      res.status(500).json({
        success: false,
        message: 'Failed to add song to queue',
      });
    }
  }

  async removeFromQueue(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Queue item ID is required',
        });
        return;
      }

      const success = await radioService.removeFromQueue(id);
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
      res.status(500).json({
        success: false,
        message: 'Failed to remove item from queue',
      });
    }
  }

  async skipTrack(req: Request, res: Response): Promise<void> {
    try {
      await radioService.skipCurrentTrack();
      res.status(200).json({
        success: true,
        message: 'Track skipped successfully',
      });
    } catch (error) {
      logger.error('Error skipping track:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to skip track',
      });
    }
  }
}
