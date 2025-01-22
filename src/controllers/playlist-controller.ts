import { Request, Response } from 'express';
import { PlaylistService } from '../services/playlist.service';

export class PlaylistController {
  private playlistService: PlaylistService;

  constructor() {
    this.playlistService = new PlaylistService();
  }

  async createPlaylist(req: Request, res: Response): Promise<void> {
    try {
      console.log('Request body:', req.body);
      console.log('Request files:', req.file);
      console.log('Content-Type:', req.get('Content-Type'));

      // Check both req.body and req.body.data for payload
      const rawBody = req.body || {};
      const payload = rawBody.data || rawBody;

      console.log('Processed payload:', payload);

      // Extract name and description
      const name = payload.name || rawBody.name;
      const description = payload.description || rawBody.description;

      console.log('Extracted name:', name);
      console.log('Extracted description:', description);

      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (!name || name.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Playlist name is required',
        });
        return;
      }

      const playlist = await this.playlistService.createPlaylist({
        name: name.trim(),
        description: description?.trim(),
        createdBy: userId,
        coverImage: req.file ? req.file.path : undefined,
      });

      res.status(201).json({
        success: true,
        playlist,
      });
    } catch (error) {
      console.error('Complete error details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create playlist',
        error: error instanceof Error ? error.message : 'Unknown error',
        rawError: error,
      });
    }
  }

  async getUserPlaylists(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const playlists = await this.playlistService.getUserPlaylists(userId);

      res.status(200).json({
        success: true,
        playlists,
      });
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch playlists',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getPlaylistDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id: playlistId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const playlist = await this.playlistService.getPlaylistDetails(
        playlistId,
        userId
      );

      if (!playlist) {
        res.status(404).json({
          success: false,
          message: 'Playlist not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        playlist,
      });
    } catch (error) {
      console.error('Error fetching playlist details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch playlist details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async addSongToPlaylist(req: Request, res: Response): Promise<void> {
    try {
      const { id: playlistId } = req.params;
      const { songId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const playlistSong = await this.playlistService.addSongToPlaylist({
        playlistId,
        songId,
        addedBy: userId,
      });

      res.status(200).json({
        success: true,
        playlistSong,
      });
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add song to playlist',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async removeSongFromPlaylist(req: Request, res: Response): Promise<void> {
    try {
      const { id: playlistId, songId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      await this.playlistService.removeSongFromPlaylist(
        playlistId,
        songId,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Song removed from playlist',
      });
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove song from playlist',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updatePlaylist(req: Request, res: Response): Promise<void> {
    try {
      const { id: playlistId } = req.params;
      const { name, description, coverImage } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const playlist = await this.playlistService.updatePlaylist(
        playlistId,
        userId,
        {
          name,
          description,
          coverImage,
        }
      );

      res.status(200).json({
        success: true,
        playlist,
      });
    } catch (error) {
      console.error('Error updating playlist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update playlist',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deletePlaylist(req: Request, res: Response): Promise<void> {
    try {
      const { id: playlistId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      await this.playlistService.deletePlaylist(playlistId, userId);

      res.status(200).json({
        success: true,
        message: 'Playlist deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete playlist',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
