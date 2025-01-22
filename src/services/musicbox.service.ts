import { col, fn, Sequelize, where, WhereOptions } from 'sequelize';
import { SuggestionModel } from '../models/suggestion.model';
import VoteModel from '../models/vote.model';
import { Op } from 'sequelize';
import logger from '../utils/logger';

export class MusicBoxService {
  async findExistingSuggestion(
    title: string,
    artist: string
  ): Promise<SuggestionModel | null> {
    try {
      const trimmedTitle = title.trim().toLowerCase();
      const trimmedArtist = artist.trim().toLowerCase();

      return await SuggestionModel.findOne({
        where: {
          [Op.and]: [
            where(fn('LOWER', col('title')), '=', trimmedTitle),
            where(fn('LOWER', col('artist')), '=', trimmedArtist),
          ],
        },
      });
    } catch (error) {
      logger.error('Error in findExistingSuggestion:', error);
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
      logger.info('Fetching suggestions with filters:', filters);

      const whereConditions: WhereOptions<any> = {};

      // Add status filter if provided
      if (filters.status) {
        whereConditions.status = filters.status;
      }

      // Add search condition if search term exists
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        (whereConditions as any)[Op.or] = [
          where(fn('LOWER', col('title')), 'LIKE', `%${searchTerm}%`),
          where(fn('LOWER', col('artist')), 'LIKE', `%${searchTerm}%`),
        ];
      }

      const order: [string, 'ASC' | 'DESC'][] = [
        ['voteCount', filters.sort === 'popular' ? 'DESC' : 'ASC'],
        ['createdAt', filters.sort === 'newest' ? 'DESC' : 'ASC'],
      ];

      const page = Math.max(1, filters.page || 1);
      const limit = Math.min(50, filters.limit || 20);
      const offset = (page - 1) * limit;

      const { count, rows } = await SuggestionModel.findAndCountAll({
        where: whereConditions,
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

      return {
        items: rows.map((suggestion) => suggestion.toJSON()),
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + rows.length < count,
      };
    } catch (error) {
      logger.error('Error in getSuggestions:', error);
      throw error;
    }
  }

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

  async addSuggestion(
    title: string,
    artist: string,
    userId: string
  ): Promise<SuggestionModel> {
    try {
      if (!title || !artist || !userId) {
        throw new Error('Title, artist, and userId are required');
      }

      const suggestion = await SuggestionModel.create({
        title: title.trim(),
        artist: artist.trim(),
        suggestedBy: userId,
        voteCount: 0,
        status: 'pending',
      });

      return suggestion;
    } catch (error) {
      console.error('Error in addSuggestion:', error);
      throw error;
    }
  }

  async updateSuggestionStatus(
    suggestionId: string,
    status: 'approved' | 'rejected'
  ): Promise<SuggestionModel> {
    try {
      const suggestion = await SuggestionModel.findByPk(suggestionId);
      if (!suggestion) {
        throw new Error('Suggestion not found');
      }

      suggestion.status = status;
      await suggestion.save();

      return suggestion;
    } catch (error) {
      console.error('Error in updateSuggestionStatus:', error);
      throw error;
    }
  }

  async getSuggestionById(
    suggestionId: string
  ): Promise<SuggestionModel | null> {
    try {
      return await SuggestionModel.findByPk(suggestionId, {
        include: [
          {
            association: 'suggestedByUser',
            attributes: ['id', 'username'],
          },
        ],
      });
    } catch (error) {
      console.error('Error in getSuggestionById:', error);
      throw error;
    }
  }

  async removeSuggestion(suggestionId: string): Promise<boolean> {
    try {
      const suggestion = await SuggestionModel.findByPk(suggestionId);
      if (!suggestion) {
        return false;
      }

      await VoteModel.destroy({
        where: { suggestionId },
      });

      await suggestion.destroy();
      return true;
    } catch (error) {
      console.error('Error in removeSuggestion:', error);
      throw error;
    }
  }
}
