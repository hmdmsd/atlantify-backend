import { SongModel } from '../models/song.model';
import logger from '../utils/logger';

interface CreateSongDto {
  title: string;
  artist: string;
  path: string;
  size: number;
  duration: number;
  uploadedBy: string;
}

export class SongsService {
  async listSongs(): Promise<SongModel[]> {
    try {
      return await SongModel.findAll({
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Error listing songs:', error);
      throw error;
    }
  }

  async createSong(songData: CreateSongDto): Promise<SongModel> {
    try {
      return await SongModel.create(songData);
    } catch (error) {
      logger.error('Error creating song:', error);
      throw error;
    }
  }

  async getSongDetails(songId: string): Promise<SongModel | null> {
    try {
      return await SongModel.findByPk(songId);
    } catch (error) {
      logger.error('Error getting song details:', error);
      throw error;
    }
  }

  async deleteSong(songId: string, userId: string): Promise<boolean> {
    try {
      const song = await SongModel.findByPk(songId);

      if (!song || song.uploadedBy !== userId) {
        return false;
      }

      await song.destroy();
      return true;
    } catch (error) {
      logger.error('Error deleting song:', error);
      throw error;
    }
  }
}
