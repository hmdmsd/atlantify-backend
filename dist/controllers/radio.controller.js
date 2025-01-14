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
exports.RadioController = void 0;
const radio_service_1 = require("../services/radio.service");
const radioService = new radio_service_1.RadioService();
class RadioController {
    /**
     * Retrieves the current radio queue.
     */
    getQueue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const queue = yield radioService.getQueue();
                res.status(200).json({ success: true, queue });
            }
            catch (error) {
                console.error('Error retrieving queue:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Adds a song to the radio queue.
     */
    addToQueue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { songId } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
                if (!songId || !userId) {
                    res.status(400).json({
                        success: false,
                        message: 'Song ID and user ID are required.',
                    });
                    return;
                }
                const queueItem = yield radioService.addToQueue(songId, userId);
                res.status(201).json({ success: true, queueItem });
            }
            catch (error) {
                console.error('Error adding to queue:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Removes a song from the radio queue by its ID.
     */
    removeFromQueue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: 'Queue item ID is required.',
                    });
                    return;
                }
                const success = yield radioService.removeFromQueue(id);
                if (!success) {
                    res
                        .status(404)
                        .json({ success: false, message: 'Queue item not found.' });
                    return;
                }
                res
                    .status(200)
                    .json({ success: true, message: 'Item removed from queue.' });
            }
            catch (error) {
                console.error('Error removing from queue:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Retrieves the current song playing on the radio.
     */
    getCurrent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentSong = yield radioService.getCurrent();
                if (!currentSong) {
                    res
                        .status(404)
                        .json({ success: false, message: 'No current song playing.' });
                    return;
                }
                res.status(200).json({ success: true, currentSong });
            }
            catch (error) {
                console.error('Error retrieving current song:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Retrieves the next song in the queue.
     */
    getNext(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const nextSong = yield radioService.getNext();
                if (!nextSong) {
                    res
                        .status(404)
                        .json({ success: false, message: 'No next song in queue.' });
                    return;
                }
                res.status(200).json({ success: true, nextSong });
            }
            catch (error) {
                console.error('Error retrieving next song:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
}
exports.RadioController = RadioController;
