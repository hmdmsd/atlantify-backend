import { Request, Response } from 'express';
import { LikedSongsService } from '../services/liked-songs.service';

export class LikedSongsController {
  private likedSongsService: LikedSongsService;

  constructor() {
    this.likedSongsService = new LikedSongsService();
  }

  async getLikedSongs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const likedSongs = await this.likedSongsService.getLikedSongs(userId);

      res.status(200).json({
        success: true,
        songs: likedSongs,
      });
    } catch (error) {
      console.error('Error fetching liked songs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch liked songs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async toggleLikeSong(req: Request, res: Response): Promise<void> {
    try {
      const { songId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await this.likedSongsService.toggleLikeSong(
        userId,
        songId
      );

      const { success, ...restResult } = result;
      res.status(200).json({
        success: true,
        ...restResult,
      });
    } catch (error) {
      console.error('Error toggling song like:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle song like',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async checkIfLiked(req: Request, res: Response): Promise<void> {
    try {
      const { songId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const isLiked = await this.likedSongsService.checkIfLiked(userId, songId);

      res.status(200).json({
        success: true,
        isLiked,
      });
    } catch (error) {
      console.error('Error checking if song is liked:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check if song is liked',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getUserLikedSongIds(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const songIds = await this.likedSongsService.getUserLikedSongIds(userId);

      res.status(200).json({
        success: true,
        songIds,
      });
    } catch (error) {
      console.error('Error fetching liked song IDs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch liked song IDs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
