import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.config';

export class QueueModel extends Model {
  public id!: string;
  public songId!: string;
  public addedBy!: string;
  public position!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    },
    addedBy: {
      type: DataTypes.UUID,
      allowNull: false,
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
  }
);
