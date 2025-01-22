import { Transaction } from 'sequelize';
import { sequelize } from '../config/database.config';
import { LikedSongModel } from '../models/liked-song.model';
import { SongModel } from '../models/song.model';
import logger from '../utils/logger';

export class LikedSongsService {
  async getLikedSongs(userId: string) {
    try {
      const likedSongs = await LikedSongModel.findAll({
        where: { userId },
        include: [
          {
            model: SongModel,
            as: 'song',
            attributes: [
              'id',
              'title',
              'artist',
              'duration',
              'path',
              'publicUrl',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return likedSongs;
    } catch (error) {
      logger.error('Error fetching liked songs:', error);
      throw error;
    }
  }

  async toggleLikeSong(userId: string, songId: string) {
    const transaction = await sequelize.transaction();

    try {
      const existingLike = await LikedSongModel.findOne({
        where: { userId, songId },
        transaction,
      });

      if (existingLike) {
        await existingLike.destroy({ transaction });
        await transaction.commit();
        return { success: true, liked: false };
      }

      await LikedSongModel.create({ userId, songId }, { transaction });

      await transaction.commit();
      return { success: true, liked: true };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error toggling song like:', error);
      throw error;
    }
  }

  async checkIfLiked(userId: string, songId: string) {
    try {
      const like = await LikedSongModel.findOne({
        where: { userId, songId },
      });
      return !!like;
    } catch (error) {
      logger.error('Error checking if song is liked:', error);
      throw error;
    }
  }

  async getUserLikedSongIds(userId: string) {
    try {
      const likes = await LikedSongModel.findAll({
        where: { userId },
        attributes: ['songId'],
      });
      return likes.map((like) => like.songId);
    } catch (error) {
      logger.error('Error getting user liked song IDs:', error);
      throw error;
    }
  }
}
