import { Request, Response } from 'express';
import { MusicBoxService } from '../services/musicbox.service';

const musicBoxService = new MusicBoxService();

export class MusicBoxController {
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
      console.log('Request headers:', req.headers);
      console.log('Request user:', req.user);

      // Type assertion for req.user
      interface AuthUser {
        id: string;
        username: string;
      }

      const user = req.user as AuthUser;

      if (!user || !user.id) {
        console.error('No user ID found in request');
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

      console.log('Adding suggestion:', { title, artist, userId: user.id });
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

  async voteSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id: suggestionId } = req.params;
      const user = req.user as { id: string };

      console.log('Vote request:', { suggestionId, user });

      if (!user || !user.id) {
        console.error('No user ID found in request');
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

      const success = await musicBoxService.voteSuggestion(
        suggestionId,
        user.id
      );
      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Unable to vote on suggestion.',
        });
        return;
      }

      res.status(200).json({ success: true, message: 'Vote registered.' });
    } catch (error) {
      console.error('Error voting on suggestion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register vote.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async removeSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id: suggestionId } = req.params;
      const user = req.user as { id: string; role: string };

      console.log('Remove suggestion request:', { suggestionId, user });

      if (!user || !user.id) {
        console.error('No user ID found in request');
        res.status(401).json({
          success: false,
          message: 'User must be authenticated to remove suggestions.',
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

      // Optional: Check if user is admin or the suggestion creator
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
