import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.config';

export class LikedSongModel extends Model {
  public id!: string;
  public userId!: string;
  public songId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LikedSongModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
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
  },
  {
    sequelize,
    tableName: 'liked_songs',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'songId'],
      },
    ],
  }
);
