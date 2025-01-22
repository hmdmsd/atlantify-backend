import { Request, Response } from 'express';
import { MusicBoxService } from '../services/musicbox.service';

const musicBoxService = new MusicBoxService();

export class MusicBoxController {
  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      console.log('Getting suggestions with query:', req.query);

      const result = await musicBoxService.getSuggestions({
        sort: req.query.sort as 'popular' | 'newest',
        search: req.query.search as string,
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
      });

      res.status(200).json({
        success: true,
        suggestions: result.items,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      });
    } catch (error) {
      console.error('Error retrieving suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async addSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { title, artist } = req.body;
      const user = req.user as { id: string; username: string };

      if (!user?.id) {
        res.status(401).json({
          success: false,
          message: 'User must be authenticated to add suggestions.',
        });
        return;
      }

      if (!title || !artist) {
        res.status(400).json({
          success: false,
          message: 'Title and artist are required.',
        });
        return;
      }

      // Check for existing suggestion
      const existingSuggestion = await musicBoxService.findExistingSuggestion(
        title,
        artist
      );
      if (existingSuggestion) {
        res.status(409).json({
          success: false,
          message: 'This song has already been suggested.',
          existingSuggestion,
        });
        return;
      }

      const suggestion = await musicBoxService.addSuggestion(
        title,
        artist,
        user.id
      );

      res.status(201).json({
        success: true,
        suggestion: {
          id: suggestion.id,
          title: suggestion.title,
          artist: suggestion.artist,
          suggestedBy: suggestion.suggestedBy,
          status: suggestion.status,
          createdAt: suggestion.createdAt,
          updatedAt: suggestion.updatedAt,
          votes: suggestion.voteCount,
        },
      });
    } catch (error) {
      console.error('Error adding suggestion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add suggestion.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async toggleVote(req: Request, res: Response): Promise<void> {
    try {
      const { id: suggestionId } = req.params;
      const user = req.user as { id: string };

      if (!user?.id) {
        res.status(401).json({
          success: false,
          message: 'User must be authenticated to vote.',
        });
        return;
      }

      if (!suggestionId) {
        res.status(400).json({
          success: false,
          message: 'Suggestion ID is required.',
        });
        return;
      }

      const result = await musicBoxService.toggleVote(suggestionId, user.id);

      res.status(200).json({
        success: true,
        message: result.hasVoted ? 'Vote added.' : 'Vote removed.',
        hasVoted: result.hasVoted,
      });
    } catch (error) {
      console.error('Error toggling vote:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle vote.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateSuggestionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: suggestionId } = req.params;
      const { status } = req.body;
      const user = req.user as { id: string; role: string };

      if (!user?.id || user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Only administrators can update suggestion status.',
        });
        return;
      }

      if (
        !suggestionId ||
        !status ||
        !['approved', 'rejected'].includes(status)
      ) {
        res.status(400).json({
          success: false,
          message: 'Valid suggestion ID and status are required.',
        });
        return;
      }

      const suggestion = await musicBoxService.updateSuggestionStatus(
        suggestionId,
        status as 'approved' | 'rejected'
      );

      res.status(200).json({
        success: true,
        message: `Suggestion ${status}.`,
        suggestion,
      });
    } catch (error) {
      console.error('Error updating suggestion status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update suggestion status.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async removeSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id: suggestionId } = req.params;
      const user = req.user as { id: string; role: string };

      if (!user?.id) {
        res.status(401).json({
          success: false,
          message: 'User must be authenticated to remove suggestions.',
        });
        return;
      }

      const suggestion = await musicBoxService.getSuggestionById(suggestionId);
      if (!suggestion) {
        res.status(404).json({
          success: false,
          message: 'Suggestion not found.',
        });
        return;
      }

      if (suggestion.suggestedBy !== user.id && user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Not authorized to remove this suggestion.',
        });
        return;
      }

      const success = await musicBoxService.removeSuggestion(suggestionId);
      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Unable to remove suggestion.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Suggestion removed successfully.',
      });
    } catch (error) {
      console.error('Error removing suggestion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove suggestion.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
