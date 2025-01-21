import { Op, WhereOptions, Sequelize } from 'sequelize';
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

      const existingVote = await VoteModel.findOne({
        where: {
          suggestionId,
          userId,
        },
      });

      if (existingVote) {
        await existingVote.destroy();
        suggestion.voteCount -= 1;
        await suggestion.save();
        return { success: true, hasVoted: false };
      } else {
        await VoteModel.create({
          suggestionId,
          userId,
        });
        suggestion.voteCount += 1;
        await suggestion.save();
        return { success: true, hasVoted: true };
      }
    } catch (error) {
      console.error('Error in toggleVote:', error);
      throw error;
    }
  }

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
        order,
        limit,
        offset,
        include: [
          {
            association: 'suggestedByUser',
            attributes: ['id', 'username'],
          },
          {
            model: VoteModel,
            as: 'userVotes',
            where: filters.userId ? { userId: filters.userId } : undefined,
            required: false,
          },
        ],
      });

      const suggestions = rows.map((suggestion) => ({
        ...suggestion.toJSON(),
        hasVoted: suggestion.userVotes?.length > 0,
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

  async addSuggestion(
    title: string,
    artist: string,
    userId: string
  ): Promise<{ suggestion: SuggestionModel | null; exists: boolean }> {
    try {
      console.log('Creating new suggestion:', { title, artist, userId });

      if (!title || !artist || !userId) {
        throw new Error('Title, artist, and userId are required');
      }

      // Check for existing suggestion with same title and artist
      // Using LOWER() for case-insensitive comparison in SQLite
      const existingSuggestion = await SuggestionModel.findOne({
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('title')),
              Sequelize.fn('LOWER', title.trim())
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('artist')),
              Sequelize.fn('LOWER', artist.trim())
            )
          ]
        }
      });

      if (existingSuggestion) {
        return { suggestion: existingSuggestion, exists: true };
      }

      const suggestion = await SuggestionModel.create({
        title: title.trim(),
        artist: artist.trim(),
        suggestedBy: userId,
        voteCount: 0,
        status: 'pending',
      });

      console.log('Suggestion created:', suggestion.toJSON());
      return { suggestion, exists: false };
    } catch (error) {
      console.error('Error in addSuggestion:', error);
      throw error;
    }
  }

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

  async removeSuggestion(suggestionId: string): Promise<boolean> {
    try {
      console.log('Attempting to remove suggestion:', suggestionId);

      const suggestion = await SuggestionModel.findByPk(suggestionId);
      if (!suggestion) {
        console.log('Suggestion not found:', suggestionId);
        return false;
      }

      // Remove all associated votes first to maintain referential integrity
      await VoteModel.destroy({
        where: {
          suggestionId
        }
      });

      // Then remove the suggestion itself
      await suggestion.destroy();
      
      console.log('Suggestion and associated votes removed successfully');
      return true;
    } catch (error) {
      console.error('Error in removeSuggestion:', error);
      throw error;
    }
  }
}