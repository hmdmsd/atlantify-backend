import { Transaction } from 'sequelize';
import { PlaylistModel } from '../models/playlist.model';
import { PlaylistSongModel } from '../models/playlist_song.model';
import { SongModel } from '../models/song.model';
import { CreatePlaylistDTO, UpdatePlaylistDTO } from '../types/playlist.types';

export class PlaylistService {
  async createPlaylist(userId: number, data: CreatePlaylistDTO, transaction?: Transaction): Promise<PlaylistModel> {
    const playlist = await PlaylistModel.create(
      {
        ...data,
        userId,
      },
      { transaction }
    );

    if (data.songIds?.length) {
      const playlistSongs = data.songIds.map((songId, index) => ({
        playlistId: playlist.id,
        songId,
        position: index,
      }));
      await PlaylistSongModel.bulkCreate(playlistSongs, { transaction });
    }

    return playlist;
  }

  async getPlaylist(id: number, userId?: number) {
    const playlist = await PlaylistModel.findOne({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
      include: [
        {
          model: SongModel,
          as: 'songs',
          through: { attributes: ['position'] },
        },
      ],
      order: [[{ model: SongModel, as: 'songs' }, PlaylistSongModel, 'position', 'ASC']],
    });

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    return playlist;
  }

  async updatePlaylist(id: number, userId: number, data: UpdatePlaylistDTO) {
    const playlist = await this.getPlaylist(id, userId);
    
    if (data.songIds) {
      await PlaylistSongModel.destroy({
        where: { playlistId: id },
      });

      const playlistSongs = data.songIds.map((songId, index) => ({
        playlistId: id,
        songId,
        position: index,
      }));
      await PlaylistSongModel.bulkCreate(playlistSongs);
    }

    await playlist.update(data);
    return this.getPlaylist(id, userId);
  }

  async deletePlaylist(id: number, userId: number) {
    const playlist = await this.getPlaylist(id, userId);
    await playlist.destroy();
  }

  async getUserPlaylists(userId: number) {
    return PlaylistModel.findAll({
      where: { userId },
      include: [
        {
          model: SongModel,
          as: 'songs',
          through: { attributes: ['position'] },
        },
      ],
      order: [[{ model: SongModel, as: 'songs' }, PlaylistSongModel, 'position', 'ASC']],
    });
  }
}