import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.config';

export class SongModel extends Model {
  public id!: string;
  public title!: string;
  public artist!: string;
  public path!: string;
  public publicUrl?: string;
  public size!: number;
  public duration!: number;
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
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    publicUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    uploadedBy: {
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
    tableName: 'songs',
    timestamps: true,
  }
);
