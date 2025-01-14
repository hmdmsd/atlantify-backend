import { Request, Response } from 'express';
import { SongsService } from '../services/songs.service';

const songsService = new SongsService();

export class SongsController {
  /**
   * Lists all songs.
   */
  async listSongs(req: Request, res: Response): Promise<void> {
    try {
      const songs = await songsService.listSongs();
      res.status(200).json({ success: true, songs });
    } catch (error) {
      console.error('Error listing songs:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Uploads a new song.
   */
  async uploadSong(req: Request, res: Response): Promise<void> {
    try {
      const { title, artist } = req.body;
      const userId = req.user?.sub as string;

      if (!req.file || !title || !artist || !userId) {
        res.status(400).json({
          success: false,
          message: 'File, title, artist, and user ID are required.',
        });
        return;
      }

      const song = await songsService.uploadSong({
        title,
        artist,
        filePath: req.file.path,
        size: req.file.size,
        uploadedBy: userId,
      });

      res.status(201).json({ success: true, song });
    } catch (error) {
      console.error('Error uploading song:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Retrieves details of a specific song by ID.
   */
  async getSongDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const song = await songsService.getSongDetails(id);
      if (!song) {
        res.status(404).json({ success: false, message: 'Song not found.' });
        return;
      }

      res.status(200).json({ success: true, song });
    } catch (error) {
      console.error('Error retrieving song details:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Deletes a song by ID.
   */
  async deleteSong(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await songsService.deleteSong(id);
      if (!success) {
        res.status(404).json({ success: false, message: 'Song not found.' });
        return;
      }

      res
        .status(200)
        .json({ success: true, message: 'Song deleted successfully.' });
    } catch (error) {
      console.error('Error deleting song:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }
}
