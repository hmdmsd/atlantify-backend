import { Transaction } from 'sequelize';
import { sequelize } from '../config/database.config';
import { PlaylistModel } from '../models/playlist.model';
import { PlaylistSongModel } from '../models/playlist-song.model';
import { SongModel } from '../models/song.model';
import logger from '../utils/logger';

export class PlaylistService {
  async createPlaylist(data: {
    name: string;
    description?: string;
    createdBy: string;
    coverImage?: string;
  }) {
    const transaction = await sequelize.transaction();

    try {
      const playlist = await PlaylistModel.create(data, { transaction });
      await transaction.commit();
      return playlist;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating playlist:', error);
      throw error;
    }
  }

  async getUserPlaylists(userId: string) {
    try {
      const playlists = await PlaylistModel.findAll({
        where: { createdBy: userId },
        include: [
          {
            model: PlaylistSongModel,
            as: 'songs',
            include: [
              {
                model: SongModel,
                as: 'song',
                attributes: ['id', 'title', 'artist', 'duration'],
              },
            ],
          },
        ],
        order: [
          ['createdAt', 'DESC'],
          [{ model: PlaylistSongModel, as: 'songs' }, 'position', 'ASC'],
        ],
      });

      return playlists;
    } catch (error) {
      logger.error('Error fetching user playlists:', error);
      throw error;
    }
  }

  async getPlaylistDetails(playlistId: string, userId: string) {
    try {
      const playlist = await PlaylistModel.findOne({
        where: { id: playlistId, createdBy: userId },
        include: [
          {
            model: PlaylistSongModel,
            as: 'songs',
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
          },
        ],
        order: [[{ model: PlaylistSongModel, as: 'songs' }, 'position', 'ASC']],
      });

      return playlist;
    } catch (error) {
      logger.error('Error fetching playlist details:', error);
      throw error;
    }
  }

  async addSongToPlaylist(data: {
    playlistId: string;
    songId: string;
    addedBy: string;
  }) {
    const transaction = await sequelize.transaction();

    try {
      const playlist = await PlaylistModel.findByPk(data.playlistId, {
        transaction,
      });

      if (!playlist || playlist.createdBy !== data.addedBy) {
        throw new Error('Playlist not found or unauthorized');
      }

      // Get the highest position
      const lastSong = await PlaylistSongModel.findOne({
        where: { playlistId: data.playlistId },
        order: [['position', 'DESC']],
        transaction,
      });

      const position = lastSong ? lastSong.position + 1 : 0;

      const playlistSong = await PlaylistSongModel.create(
        {
          ...data,
          position,
        },
        { transaction }
      );

      await transaction.commit();
      return playlistSong;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error adding song to playlist:', error);
      throw error;
    }
  }

  async removeSongFromPlaylist(
    playlistId: string,
    songId: string,
    userId: string
  ) {
    const transaction = await sequelize.transaction();

    try {
      const playlist = await PlaylistModel.findByPk(playlistId, {
        transaction,
      });

      if (!playlist || playlist.createdBy !== userId) {
        throw new Error('Playlist not found or unauthorized');
      }

      await PlaylistSongModel.destroy({
        where: { playlistId, songId },
        transaction,
      });

      // Reorder remaining songs
      const remainingSongs = await PlaylistSongModel.findAll({
        where: { playlistId },
        order: [['position', 'ASC']],
        transaction,
      });

      for (let i = 0; i < remainingSongs.length; i++) {
        await remainingSongs[i].update({ position: i }, { transaction });
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error removing song from playlist:', error);
      throw error;
    }
  }

  async updatePlaylist(
    playlistId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      coverImage?: string;
    }
  ) {
    const transaction = await sequelize.transaction();

    try {
      const playlist = await PlaylistModel.findOne({
        where: { id: playlistId, createdBy: userId },
        transaction,
      });

      if (!playlist) {
        throw new Error('Playlist not found or unauthorized');
      }

      await playlist.update(data, { transaction });
      await transaction.commit();
      return playlist;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error updating playlist:', error);
      throw error;
    }
  }

  async deletePlaylist(playlistId: string, userId: string) {
    const transaction = await sequelize.transaction();

    try {
      const playlist = await PlaylistModel.findOne({
        where: { id: playlistId, createdBy: userId },
        transaction,
      });

      if (!playlist) {
        throw new Error('Playlist not found or unauthorized');
      }

      // Delete all playlist songs first
      await PlaylistSongModel.destroy({
        where: { playlistId },
        transaction,
      });

      // Delete the playlist
      await playlist.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error deleting playlist:', error);
      throw error;
    }
  }
}
