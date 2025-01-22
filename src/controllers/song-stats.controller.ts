import { Request, Response } from 'express';
import { SongStatsService } from '../services/song-stats.service';

export class SongStatsController {
  private songStatsService: SongStatsService;

  constructor() {
    this.songStatsService = new SongStatsService();
  }

  async incrementPlayCount(req: Request, res: Response): Promise<void> {
    try {
      const { id: songId } = req.params;

      const stats = await this.songStatsService.incrementPlayCount(songId);

      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('Error incrementing play count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to increment play count',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMostPlayedSongs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const songs = await this.songStatsService.getMostPlayedSongs(limit);

      res.status(200).json({
        success: true,
        songs,
      });
    } catch (error) {
      console.error('Error fetching most played songs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch most played songs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getRecentlyPlayedSongs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const songs = await this.songStatsService.getRecentlyPlayedSongs(limit);

      res.status(200).json({
        success: true,
        songs,
      });
    } catch (error) {
      console.error('Error fetching recently played songs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recently played songs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getSongStats(req: Request, res: Response): Promise<void> {
    try {
      const { id: songId } = req.params;
      const stats = await this.songStatsService.getSongStats(songId);

      if (!stats) {
        res.status(404).json({
          success: false,
          message: 'Song stats not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('Error fetching song stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch song stats',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
