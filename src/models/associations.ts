import { SongModel } from './song.model';
import { UserModel } from './user.model';
import { QueueModel } from './queue.model';
import { SuggestionModel } from './suggestion.model';
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

  // Queue-specific user associations
  UserModel.hasMany(QueueModel, {
    foreignKey: 'addedBy',
    as: 'queuedItems',
  });

  // Queue associations
  QueueModel.belongsTo(UserModel, {
    foreignKey: 'addedBy',
    as: 'addedByUser',
  });

  QueueModel.belongsTo(SongModel, {
    foreignKey: 'songId',
    as: 'queueSong',
  });

  // Song associations
  SongModel.hasMany(QueueModel, {
    foreignKey: 'songId',
    as: 'queueEntries',
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