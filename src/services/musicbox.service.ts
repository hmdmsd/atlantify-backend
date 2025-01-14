import { SuggestionModel } from '../models/suggestion.model';

export class MusicBoxService {
  /**
   * Retrieves all song suggestions, sorted by votes in descending order.
   */
  async getSuggestions(): Promise<SuggestionModel[]> {
    return SuggestionModel.findAll({ order: [['votes', 'DESC']] });
  }

  /**
   * Adds a new song suggestion.
   * @param title - The title of the suggested song.
   * @param artist - The artist of the suggested song.
   * @param userId - The ID of the user making the suggestion.
   * @returns The newly created suggestion.
   */
  async addSuggestion(
    title: string,
    artist: string,
    userId: string
  ): Promise<SuggestionModel> {
    return SuggestionModel.create({
      title,
      artist,
      suggestedBy: userId,
      votes: 0,
      status: 'pending',
    });
  }

  /**
   * Casts a vote for a specific suggestion.
   * @param suggestionId - The ID of the suggestion to vote for.
   * @param userId - The ID of the user casting the vote.
   * @returns True if the vote was successful, false otherwise.
   */
  async voteSuggestion(suggestionId: string, userId: string): Promise<boolean> {
    const suggestion = await SuggestionModel.findByPk(suggestionId);
    if (!suggestion) return false;

    suggestion.votes += 1;
    await suggestion.save();
    return true;
  }

  /**
   * Removes a song suggestion by its ID.
   * @param suggestionId - The ID of the suggestion to remove.
   * @returns True if the suggestion was removed, false otherwise.
   */
  async removeSuggestion(suggestionId: string): Promise<boolean> {
    const suggestion = await SuggestionModel.findByPk(suggestionId);
    if (!suggestion) return false;

    await suggestion.destroy();
    return true;
  }
}
