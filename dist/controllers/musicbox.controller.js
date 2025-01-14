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
exports.MusicBoxController = void 0;
const musicbox_service_1 = require("../services/musicbox.service");
const musicBoxService = new musicbox_service_1.MusicBoxService();
class MusicBoxController {
    /**
     * Retrieves all song suggestions sorted by votes.
     */
    getSuggestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const suggestions = yield musicBoxService.getSuggestions();
                res.status(200).json({ success: true, suggestions });
            }
            catch (error) {
                console.error('Error retrieving suggestions:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Adds a new song suggestion.
     */
    addSuggestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { title, artist } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
                if (!title || !artist || !userId) {
                    res.status(400).json({
                        success: false,
                        message: 'Title, artist, and user ID are required.',
                    });
                    return;
                }
                const suggestion = yield musicBoxService.addSuggestion(title, artist, userId);
                res.status(201).json({ success: true, suggestion });
            }
            catch (error) {
                console.error('Error adding suggestion:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Casts a vote for a specific suggestion.
     */
    voteSuggestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
                if (!id || !userId) {
                    res.status(400).json({
                        success: false,
                        message: 'Suggestion ID and user ID are required.',
                    });
                    return;
                }
                const success = yield musicBoxService.voteSuggestion(id, userId);
                if (!success) {
                    res
                        .status(400)
                        .json({ success: false, message: 'Unable to vote on suggestion.' });
                    return;
                }
                res.status(200).json({ success: true, message: 'Vote registered.' });
            }
            catch (error) {
                console.error('Error voting on suggestion:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Removes a song suggestion.
     */
    removeSuggestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: 'Suggestion ID is required.',
                    });
                    return;
                }
                const success = yield musicBoxService.removeSuggestion(id);
                if (!success) {
                    res
                        .status(404)
                        .json({ success: false, message: 'Suggestion not found.' });
                    return;
                }
                res
                    .status(200)
                    .json({ success: true, message: 'Suggestion removed successfully.' });
            }
            catch (error) {
                console.error('Error removing suggestion:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
}
exports.MusicBoxController = MusicBoxController;
