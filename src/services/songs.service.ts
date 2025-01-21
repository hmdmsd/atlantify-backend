import { SongModel } from '../models/song.model';
import logger from '../utils/logger';
import { Transaction } from 'sequelize';
import { sequelize } from '../config/database.config';

interface CreateSongDto {
  title: string;
  artist: string;
  path: string;
  size: number;
  duration: number;
  uploadedBy: string;
}

export class SongsService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (
          error.message.includes('SQLITE_BUSY') &&
          attempt < this.MAX_RETRIES
        ) {
          logger.warn(
            `Database locked, attempt ${attempt} of ${this.MAX_RETRIES}. Retrying in ${this.RETRY_DELAY}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  async listSongs(): Promise<SongModel[]> {
    return this.withRetry(async () => {
      try {
        return await SongModel.findAll({
          order: [['createdAt', 'DESC']],
          lock: Transaction.LOCK.SHARE,
        });
      } catch (error) {
        logger.error('Error listing songs:', error);
        throw error;
      }
    });
  }

  async createSong(songData: CreateSongDto): Promise<SongModel> {
    return this.withRetry(async () => {
      const transaction = await sequelize.transaction();

      try {
        const song = await SongModel.create(songData, { transaction });
        await transaction.commit();
        return song;
      } catch (error) {
        await transaction.rollback();
        logger.error('Error creating song:', error);
        throw error;
      }
    });
  }

  async getSongDetails(songId: string): Promise<SongModel | null> {
    return this.withRetry(async () => {
      try {
        return await SongModel.findByPk(songId, {
          lock: Transaction.LOCK.SHARE,
        });
      } catch (error) {
        logger.error('Error getting song details:', error);
        throw error;
      }
    });
  }

  async deleteSong(songId: string, userId: string): Promise<boolean> {
    return this.withRetry(async () => {
      const transaction = await sequelize.transaction();

      try {
        const song = await SongModel.findByPk(songId, {
          transaction,
          lock: Transaction.LOCK.UPDATE,
        });

        if (!song || song.uploadedBy !== userId) {
          await transaction.rollback();
          return false;
        }

        await song.destroy({ transaction });
        await transaction.commit();
        return true;
      } catch (error) {
        await transaction.rollback();
        logger.error('Error deleting song:', error);
        throw error;
      }
    });
  }
}
