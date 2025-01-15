import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.config';
import { SongModel } from './song.model';

export class QueueModel extends Model {
  public id!: string;
  public songId!: string;
  public addedBy!: string;
  public position!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association for typescript type checking
  public song?: SongModel;
}

QueueModel.init(
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
    },
    addedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'queue',
    timestamps: true,
    indexes: [
      {
        fields: ['songId'],
      },
      {
        fields: ['addedBy'],
      },
      {
        fields: ['position'],
      },
    ],
  }
);

// Associations
QueueModel.belongsTo(SongModel, {
  foreignKey: 'songId',
  as: 'song',
});
