import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';

export class PlaylistSongModel extends Model {
    public playlistId!: number;
    public songId!: number;
    public position!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }
  
  PlaylistSongModel.init(
    {
      playlistId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      songId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'playlist_songs',
    }
  );