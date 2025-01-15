import { Request, Response } from 'express';
import { MusicBoxService } from '../services/musicbox.service';

const musicBoxService = new MusicBoxService();

export class MusicBoxController {
  /**
   * Retrieves all song suggestions sorted by votes.
   */
  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const {
        items: suggestions,
        total,
        page,
        totalPages,
        hasMore,
      } = await musicBoxService.getSuggestions({
        sort: 'popular',
        search: req.query.search as string,
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
      });
      res
        .status(200)
        .json({ success: true, suggestions, total, page, totalPages, hasMore });
    } catch (error) {
      console.error('Error retrieving suggestions:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }
  /**
   * Adds a new song suggestion.
   */
  async addSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { title, artist } = req.body;
      const userId = req.user?.id;

      if (!title || !artist || !userId) {
        res.status(400).json({
          success: false,
          message: 'Title, artist, and user ID are required.',
        });
        return;
      }

      const suggestion = await musicBoxService.addSuggestion(
        title,
        artist,
        userId
      );
      res.status(201).json({ success: true, suggestion });
    } catch (error) {
      console.error('Error adding suggestion:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Casts a vote for a specific suggestion.
   */
  async voteSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.sub as string;

      if (!id || !userId) {
        res.status(400).json({
          success: false,
          message: 'Suggestion ID and user ID are required.',
        });
        return;
      }

      const success = await musicBoxService.voteSuggestion(id, userId);
      if (!success) {
        res
          .status(400)
          .json({ success: false, message: 'Unable to vote on suggestion.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Vote registered.' });
    } catch (error) {
      console.error('Error voting on suggestion:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Removes a song suggestion.
   */
  async removeSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Suggestion ID is required.',
        });
        return;
      }

      const success = await musicBoxService.removeSuggestion(id);
      if (!success) {
        res
          .status(404)
          .json({ success: false, message: 'Suggestion not found.' });
        return;
      }

      res
        .status(200)
        .json({ success: true, message: 'Suggestion removed successfully.' });
    } catch (error) {
      console.error('Error removing suggestion:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }
}
