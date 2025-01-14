import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.config';

export class SuggestionModel extends Model {
  public id!: string;
  public title!: string;
  public artist!: string;
  public suggestedBy!: string;
  public votes!: number;
  public status!: 'pending' | 'approved' | 'rejected';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SuggestionModel.init(
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
    suggestedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'suggestions',
    timestamps: true,
  }
);
