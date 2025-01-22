import { Op } from 'sequelize';
import { sequelize } from '../config/database.config';
import { SongStatsModel } from '../models/song-stats.model';
import { SongModel } from '../models/song.model';
import logger from '../utils/logger';

export class SongStatsService {
  async incrementPlayCount(songId: string) {
    const transaction = await sequelize.transaction();

    try {
      let stats = await SongStatsModel.findOne({
        where: { songId },
        transaction,
      });

      if (!stats) {
        stats = await SongStatsModel.create(
          {
            songId,
            playCount: 1,
            lastPlayedAt: new Date(),
          },
          { transaction }
        );
      } else {
        await stats.update(
          {
            playCount: stats.playCount + 1,
            lastPlayedAt: new Date(),
          },
          { transaction }
        );
      }

      await transaction.commit();
      return stats;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error incrementing play count:', error);
      throw error;
    }
  }

  async getMostPlayedSongs(limit: number = 10) {
    try {
      const songs = await SongModel.findAll({
        include: [
          {
            model: SongStatsModel,
            as: 'stats',
            where: {
              playCount: { [Op.gt]: 0 },
            },
          },
        ],
        order: [[{ model: SongStatsModel, as: 'stats' }, 'playCount', 'DESC']],
        limit,
      });

      return songs;
    } catch (error) {
      logger.error('Error fetching most played songs:', error);
      throw error;
    }
  }

  async getRecentlyPlayedSongs(limit: number = 10) {
    try {
      const songs = await SongModel.findAll({
        include: [
          {
            model: SongStatsModel,
            as: 'stats',
            where: {
              lastPlayedAt: { [Op.ne]: null },
            },
          },
        ],
        order: [
          [{ model: SongStatsModel, as: 'stats' }, 'lastPlayedAt', 'DESC'],
        ],
        limit,
      });

      return songs;
    } catch (error) {
      logger.error('Error fetching recently played songs:', error);
      throw error;
    }
  }

  async getSongStats(songId: string) {
    try {
      const stats = await SongStatsModel.findOne({
        where: { songId },
        include: [
          {
            model: SongModel,
            as: 'song',
            attributes: ['id', 'title', 'artist'],
          },
        ],
      });

      return stats;
    } catch (error) {
      logger.error('Error fetching song stats:', error);
      throw error;
    }
  }
}
