import { SongModel } from './song.model';
import { UserModel } from './user.model';
import { QueueModel } from './queue.model';
import { SuggestionModel } from './suggestion.model';
import { VoteModel } from './vote.model';
import { PlaylistModel } from './playlist.model';
import { PlaylistSongModel } from './playlist-song.model';
import { LikedSongModel } from './liked-song.model';
import { SongStatsModel } from './song-stats.model';

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

  UserModel.hasMany(LikedSongModel, {
    foreignKey: 'userId',
    as: 'likedSongs',
  });

  UserModel.hasMany(PlaylistModel, {
    foreignKey: 'createdBy',
    as: 'playlists',
  });

  // Queue associations
  UserModel.hasMany(QueueModel, {
    foreignKey: 'addedBy',
    as: 'queuedItems',
  });

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

  SongModel.hasMany(LikedSongModel, {
    foreignKey: 'songId',
    as: 'likedBy',
  });

  SongModel.hasMany(PlaylistSongModel, {
    foreignKey: 'songId',
    as: 'inPlaylists',
  });

  SongModel.hasOne(SongStatsModel, {
    foreignKey: 'songId',
    as: 'stats',
  });

  // Playlist associations
  PlaylistModel.belongsTo(UserModel, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  PlaylistModel.hasMany(PlaylistSongModel, {
    foreignKey: 'playlistId',
    as: 'songs',
  });

  PlaylistSongModel.belongsTo(PlaylistModel, {
    foreignKey: 'playlistId',
    as: 'playlist',
  });

  PlaylistSongModel.belongsTo(SongModel, {
    foreignKey: 'songId',
    as: 'song',
  });

  PlaylistSongModel.belongsTo(UserModel, {
    foreignKey: 'addedBy',
    as: 'addedByUser',
  });

  // Liked Songs associations
  LikedSongModel.belongsTo(UserModel, {
    foreignKey: 'userId',
    as: 'user',
  });

  LikedSongModel.belongsTo(SongModel, {
    foreignKey: 'songId',
    as: 'song',
  });

  // Song Stats associations
  SongStatsModel.belongsTo(SongModel, {
    foreignKey: 'songId',
    as: 'song',
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
