import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.config';

export class SongStatsModel extends Model {
  public id!: string;
  public songId!: string;
  public playCount!: number;
  public lastPlayedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SongStatsModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    songId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'songs',
        key: 'id',
      },
      unique: true,
    },
    playCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastPlayedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'song_stats',
    timestamps: true,
    indexes: [
      {
        fields: ['playCount'],
      },
      {
        fields: ['lastPlayedAt'],
      },
    ],
  }
);
