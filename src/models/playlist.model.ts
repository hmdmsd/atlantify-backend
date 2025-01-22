import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.config';

export class PlaylistModel extends Model {
  public id!: string;
  public name!: string;
  public description?: string;
  public createdBy!: string;
  public coverImage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PlaylistModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'playlists',
    timestamps: true,
  }
);
