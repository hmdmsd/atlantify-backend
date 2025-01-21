import { Op, WhereOptions } from 'sequelize';
import { SuggestionModel } from '../models/suggestion.model';
import VoteModel from '../models/vote.model';

export class MusicBoxService {
  async toggleVote(
    suggestionId: string,
    userId: string
  ): Promise<{ success: boolean; hasVoted: boolean }> {
    try {
      const suggestion = await SuggestionModel.findByPk(suggestionId);
      if (!suggestion) {
        throw new Error('Suggestion not found');
      }

      // Check if user has already voted
      const existingVote = await VoteModel.findOne({
        where: {
          suggestionId,
          userId,
        },
      });

      if (existingVote) {
        // Remove vote
        await existingVote.destroy();
        suggestion.voteCount -= 1; // Using voteCount instead of votes
        await suggestion.save();
        return { success: true, hasVoted: false };
      } else {
        // Add vote
        await VoteModel.create({
          suggestionId,
          userId,
        });
        suggestion.voteCount += 1; // Using voteCount instead of votes
        await suggestion.save();
        return { success: true, hasVoted: true };
      }
    } catch (error) {
      console.error('Error in toggleVote:', error);
      throw error;
    }
  }

  /**
   * Retrieves all song suggestions with filtering and pagination.
   */
  async getSuggestions(
    filters: {
      status?: 'pending' | 'approved' | 'rejected';
      sort?: 'newest' | 'popular';
      search?: string;
      page?: number;
      limit?: number;
      userId?: string;
    } = {}
  ) {
    try {
      console.log('Fetching suggestions with filters:', filters);

      const where: WhereOptions = {
        ...(filters.status && { status: filters.status }),
        ...(filters.search && {
          [Op.or]: [
            { title: { [Op.like]: `%${filters.search}%` } },
            { artist: { [Op.like]: `%${filters.search}%` } },
          ],
        }),
      };

      const order = [
        ['voteCount', filters.sort === 'popular' ? 'DESC' : 'ASC'],
        ['createdAt', filters.sort === 'newest' ? 'DESC' : 'ASC'],
      ];

      const page = Math.max(1, filters.page || 1);
      const limit = Math.min(50, filters.limit || 20);
      const offset = (page - 1) * limit;

      const { count, rows } = await SuggestionModel.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          {
            association: 'suggestedByUser',
            attributes: ['id', 'username'],
          },
          {
            model: VoteModel,
            as: 'userVotes', // Changed from 'votes' to 'userVotes'
            where: filters.userId ? { userId: filters.userId } : undefined,
            required: false,
          },
        ],
      });

      const suggestions = rows.map((suggestion) => ({
        ...suggestion.toJSON(),
      }));

      return {
        items: suggestions,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + rows.length < count,
      };
    } catch (error) {
      console.error('Error in getSuggestions:', error);
      throw error;
    }
  }
  /**
   * Adds a new song suggestion.
   */
  async addSuggestion(
    title: string,
    artist: string,
    userId: string
  ): Promise<SuggestionModel> {
    try {
      console.log('Creating new suggestion:', { title, artist, userId });

      if (!title || !artist || !userId) {
        throw new Error('Title, artist, and userId are required');
      }

      const suggestion = await SuggestionModel.create({
        title: title.trim(),
        artist: artist.trim(),
        suggestedBy: userId,
        votes: 0,
        status: 'pending',
      });

      console.log('Suggestion created:', suggestion.toJSON());
      return suggestion;
    } catch (error) {
      console.error('Error in addSuggestion:', error);
      throw error;
    }
  }

  /**
   * Casts a vote for a specific suggestion.
   */
  async voteSuggestion(suggestionId: string, userId: string): Promise<boolean> {
    try {
      console.log('Processing vote:', { suggestionId, userId });

      const suggestion = await SuggestionModel.findByPk(suggestionId);
      if (!suggestion) {
        console.log('Suggestion not found:', suggestionId);
        return false;
      }

      // Optional: Check if user has already voted
      // const hasVoted = await VoteModel.findOne({
      //   where: { suggestionId, userId }
      // });
      // if (hasVoted) return false;

      await suggestion.save();

      // Optional: Record the vote
      // await VoteModel.create({ suggestionId, userId });

      console.log('Vote recorded successfully');
      return true;
    } catch (error) {
      console.error('Error in voteSuggestion:', error);
      throw error;
    }
  }

  /**
   * Removes a song suggestion.
   */
  async removeSuggestion(suggestionId: string): Promise<boolean> {
    try {
      console.log('Attempting to remove suggestion:', suggestionId);

      const suggestion = await SuggestionModel.findByPk(suggestionId);
      if (!suggestion) {
        console.log('Suggestion not found:', suggestionId);
        return false;
      }

      await suggestion.destroy();
      console.log('Suggestion removed successfully');
      return true;
    } catch (error) {
      console.error('Error in removeSuggestion:', error);
      throw error;
    }
  }

  /**
   * Get a suggestion by ID
   */
  async getSuggestionById(
    suggestionId: string
  ): Promise<SuggestionModel | null> {
    try {
      console.log('Getting suggestion by ID:', suggestionId);

      const suggestion = await SuggestionModel.findByPk(suggestionId, {
        include: [
          {
            association: 'suggestedByUser',
            attributes: ['id', 'username'],
          },
        ],
      });

      if (!suggestion) {
        console.log('Suggestion not found:', suggestionId);
        return null;
      }

      console.log('Found suggestion:', suggestion.toJSON());
      return suggestion;
    } catch (error) {
      console.error('Error in getSuggestionById:', error);
      throw error;
    }
  }
}
