// src/models/associations.ts
import { SuggestionModel } from './suggestion.model';
import { UserModel } from './user.model';
import { VoteModel } from './vote.model';
import { PlaylistModel } from './playlist.model';
import { PlaylistSongModel } from './playlist_song.model';
import { SongModel } from './song.model';

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

  UserModel.hasMany(PlaylistModel, {
    foreignKey: 'userId',
    as: 'playlists',
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

  // Playlist associations
  PlaylistModel.belongsTo(UserModel, {
    foreignKey: 'userId',
    as: 'user',
  });

  PlaylistModel.belongsToMany(SongModel, {
    through: PlaylistSongModel,
    foreignKey: 'playlistId',
    otherKey: 'songId',
    as: 'songs',
  });

  SongModel.belongsToMany(PlaylistModel, {
    through: PlaylistSongModel,
    foreignKey: 'songId',
    otherKey: 'playlistId',
    as: 'playlists',
  });
}