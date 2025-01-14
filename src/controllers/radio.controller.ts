import { Request, Response } from 'express';
import { RadioService } from '../services/radio.service';

const radioService = new RadioService();

export class RadioController {
  /**
   * Retrieves the current radio queue.
   */
  async getQueue(req: Request, res: Response): Promise<void> {
    try {
      const queue = await radioService.getQueue();
      res.status(200).json({ success: true, queue });
    } catch (error) {
      console.error('Error retrieving queue:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Adds a song to the radio queue.
   */
  async addToQueue(req: Request, res: Response): Promise<void> {
    try {
      const { songId } = req.body;
      const userId = req.user?.sub as string;

      if (!songId || !userId) {
        res.status(400).json({
          success: false,
          message: 'Song ID and user ID are required.',
        });
        return;
      }

      const queueItem = await radioService.addToQueue(songId, userId);
      res.status(201).json({ success: true, queueItem });
    } catch (error) {
      console.error('Error adding to queue:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Removes a song from the radio queue by its ID.
   */
  async removeFromQueue(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Queue item ID is required.',
        });
        return;
      }

      const success = await radioService.removeFromQueue(id);
      if (!success) {
        res
          .status(404)
          .json({ success: false, message: 'Queue item not found.' });
        return;
      }

      res
        .status(200)
        .json({ success: true, message: 'Item removed from queue.' });
    } catch (error) {
      console.error('Error removing from queue:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Retrieves the current song playing on the radio.
   */
  async getCurrent(req: Request, res: Response): Promise<void> {
    try {
      const currentSong = await radioService.getCurrent();
      if (!currentSong) {
        res
          .status(404)
          .json({ success: false, message: 'No current song playing.' });
        return;
      }

      res.status(200).json({ success: true, currentSong });
    } catch (error) {
      console.error('Error retrieving current song:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Retrieves the next song in the queue.
   */
  async getNext(req: Request, res: Response): Promise<void> {
    try {
      const nextSong = await radioService.getNext();
      if (!nextSong) {
        res
          .status(404)
          .json({ success: false, message: 'No next song in queue.' });
        return;
      }

      res.status(200).json({ success: true, nextSong });
    } catch (error) {
      console.error('Error retrieving next song:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }
}
