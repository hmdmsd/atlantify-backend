import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.config';

export class SongModel extends Model {
  public id!: string;
  public title!: string;
  public artist!: string;
  public duration!: number;
  public path!: string;
  public uploadedBy!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SongModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'songs',
    timestamps: true,
  }
);
