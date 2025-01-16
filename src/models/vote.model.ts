// src/models/vote.model.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';

export class VoteModel extends Model {
  public suggestionId!: string;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VoteModel.init(
  {
    suggestionId: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'votes',
    timestamps: true,
  }
);

export default VoteModel;
