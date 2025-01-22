import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.config';

export class PlaylistSongModel extends Model {
  public id!: string;
  public playlistId!: string;
  public songId!: string;
  public position!: number;
  public addedBy!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PlaylistSongModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    playlistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'playlists',
        key: 'id',
      },
    },
    songId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'songs',
        key: 'id',
      },
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    addedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'playlist_songs',
    timestamps: true,
    indexes: [
      {
        fields: ['playlistId', 'position'],
      },
      {
        fields: ['songId'],
      },
    ],
  }
);
