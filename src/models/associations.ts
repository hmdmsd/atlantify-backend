// src/models/associations.ts
import { SuggestionModel } from './suggestion.model';
import { UserModel } from './user.model';
import { VoteModel } from './vote.model';

export function initializeAssociations() {
  // User associations
  UserModel.hasMany(SuggestionModel, {
    foreignKey: 'suggestedBy',
    as: 'suggestions',
  });

  UserModel.hasMany(VoteModel, {
    foreignKey: 'userId',
    as: 'votes',
  });

  // Suggestion associations
  SuggestionModel.belongsTo(UserModel, {
    foreignKey: 'suggestedBy',
    as: 'suggestedByUser',
  });

  SuggestionModel.hasMany(VoteModel, {
    foreignKey: 'suggestionId',
    as: 'userVotes',
  });

  // Vote associations
  VoteModel.belongsTo(SuggestionModel, {
    foreignKey: 'suggestionId',
    as: 'suggestion',
  });

  VoteModel.belongsTo(UserModel, {
    foreignKey: 'userId',
    as: 'user',
  });
}
