"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicBoxService = void 0;
const suggestion_model_1 = require("../models/suggestion.model");
class MusicBoxService {
    /**
     * Retrieves all song suggestions, sorted by votes in descending order.
     */
    getSuggestions() {
        return __awaiter(this, void 0, void 0, function* () {
            return suggestion_model_1.SuggestionModel.findAll({ order: [['votes', 'DESC']] });
        });
    }
    /**
     * Adds a new song suggestion.
     * @param title - The title of the suggested song.
     * @param artist - The artist of the suggested song.
     * @param userId - The ID of the user making the suggestion.
     * @returns The newly created suggestion.
     */
    addSuggestion(title, artist, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return suggestion_model_1.SuggestionModel.create({
                title,
                artist,
                suggestedBy: userId,
                votes: 0,
                status: 'pending',
            });
        });
    }
    /**
     * Casts a vote for a specific suggestion.
     * @param suggestionId - The ID of the suggestion to vote for.
     * @param userId - The ID of the user casting the vote.
     * @returns True if the vote was successful, false otherwise.
     */
    voteSuggestion(suggestionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const suggestion = yield suggestion_model_1.SuggestionModel.findByPk(suggestionId);
            if (!suggestion)
                return false;
            suggestion.votes += 1;
            yield suggestion.save();
            return true;
        });
    }
    /**
     * Removes a song suggestion by its ID.
     * @param suggestionId - The ID of the suggestion to remove.
     * @returns True if the suggestion was removed, false otherwise.
     */
    removeSuggestion(suggestionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const suggestion = yield suggestion_model_1.SuggestionModel.findByPk(suggestionId);
            if (!suggestion)
                return false;
            yield suggestion.destroy();
            return true;
        });
    }
}
exports.MusicBoxService = MusicBoxService;
