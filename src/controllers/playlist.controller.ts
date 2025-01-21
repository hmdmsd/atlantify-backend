import { Request, Response } from 'express';
import { PlaylistService } from '../services/playlist.service';
import { PlaylistModel } from '../models/playlist.model';

export class PlaylistController {
  private playlistService: PlaylistService;

  constructor() {
    this.playlistService = new PlaylistService();
  }

  async createPlaylist(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, isPublic, songIds } = req.body;
      const user = req.user as { id: string };

      if (!user?.id) {
        res.status(401).json({
          success: false,
          message: 'User must be authenticated to create a playlist.',
        });
        return;
      }

      if (!name) {
        res.status(400).json({
          success: false,
          message: 'Playlist name is required.',
        });
        return;
      }

      const playlist = await this.playlistService.createPlaylist(
        parseInt(user.id),
        { name, description, isPublic, songIds }
      );

      res.status(201).json({
        success: true,
        playlist: {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          isPublic: playlist.isPublic,
          userId: playlist.userId,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
        },
      });
    } catch (error: unknown) {
      console.error('Error creating playlist:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: 'Failed to create playlist.',
        error: errorMessage,
      });
    }
  }

  async getPlaylist(req: Request, res: Response): Promise<void> {
    try {
      const { id: playlistId } = req.params;
      const user = req.user as { id: string };

      if (!playlistId) {
        res.status(400).json({
          success: false,
          message: 'Playlist ID is required.',
        });
        return;
      }

      const playlist = await this.playlistService.getPlaylist(
        parseInt(playlistId),
        req.query.own === 'true' ? parseInt(user.id) : undefined
      );

      res.status(200).json({
        success: true,
        playlist: {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          isPublic: playlist.isPublic,
          userId: playlist.userId,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
        },
      });
    } catch (error: unknown) {
      console.error('Error retrieving playlist:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const isNotFound = errorMessage === 'Playlist not found';
      
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        message: isNotFound ? 'Playlist not found.' : 'Failed to retrieve playlist.',
        error: errorMessage,
      });
    }
  }

  async updatePlaylist(req: Request, res: Response): Promise<void> {
    try {
      const { id: playlistId } = req.params;
      const { name, description, isPublic, songIds } = req.body;
      const user = req.user as { id: string };

      if (!user?.id) {
        res.status(401).json({
          success: false,
          message: 'User must be authenticated to update a playlist.',
        });
        return;
      }

      if (!playlistId) {
        res.status(400).json({
          success: false,
          message: 'Playlist ID is required.',
        });
        return;
      }

      const playlist = await this.playlistService.updatePlaylist(
        parseInt(playlistId),
        parseInt(user.id),
        { name, description, isPublic, songIds }
      );

      res.status(200).json({
        success: true,
        playlist: {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          isPublic: playlist.isPublic,
          userId: playlist.userId,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
        },
      });
    } catch (error: unknown) {
      console.error('Error updating playlist:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const isNotFound = errorMessage === 'Playlist not found';

      res.status(isNotFound ? 404 : 500).json({
        success: false,
        message: isNotFound ? 'Playlist not found.' : 'Failed to update playlist.',
        error: errorMessage,
      });
    }
  }

  async deletePlaylist(req: Request, res: Response): Promise<void> {
    try {
      const { id: playlistId } = req.params;
      const user = req.user as { id: string };

      if (!user?.id) {
        res.status(401).json({
          success: false,
          message: 'User must be authenticated to delete a playlist.',
        });
        return;
      }

      if (!playlistId) {
        res.status(400).json({
          success: false,
          message: 'Playlist ID is required.',
        });
        return;
      }

      await this.playlistService.deletePlaylist(
        parseInt(playlistId),
        parseInt(user.id)
      );

      res.status(200).json({
        success: true,
        message: 'Playlist deleted successfully.',
      });
    } catch (error: unknown) {
      console.error('Error deleting playlist:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const isNotFound = errorMessage === 'Playlist not found';

      res.status(isNotFound ? 404 : 500).json({
        success: false,
        message: isNotFound ? 'Playlist not found.' : 'Failed to delete playlist.',
        error: errorMessage,
      });
    }
  }

  async getUserPlaylists(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string };

      if (!user?.id) {
        res.status(401).json({
          success: false,
          message: 'User must be authenticated to view playlists.',
        });
        return;
      }

      const playlists = await this.playlistService.getUserPlaylists(parseInt(user.id));

      res.status(200).json({
        success: true,
        playlists: playlists.map((playlist: PlaylistModel) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          isPublic: playlist.isPublic,
          userId: playlist.userId,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
        })),
      });
    } catch (error: unknown) {
      console.error('Error retrieving user playlists:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve playlists.',
        error: errorMessage,
      });
    }
  }
}