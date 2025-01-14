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
exports.RadioService = void 0;
const queue_model_1 = require("../models/queue.model");
const song_model_1 = require("../models/song.model");
class RadioService {
    /**
     * Retrieves the current radio queue sorted by position.
     */
    getQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            return queue_model_1.QueueModel.findAll({ order: [['position', 'ASC']] });
        });
    }
    /**
     * Adds a song to the radio queue.
     * @param songId - The ID of the song to add.
     * @param userId - The ID of the user adding the song.
     * @returns The newly added queue item.
     */
    addToQueue(songId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const position = (yield queue_model_1.QueueModel.count()) + 1;
            return queue_model_1.QueueModel.create({ songId, addedBy: userId, position });
        });
    }
    /**
     * Removes a song from the queue by its ID.
     * @param queueId - The ID of the queue item to remove.
     * @returns True if the item was removed, false otherwise.
     */
    removeFromQueue(queueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const queueItem = yield queue_model_1.QueueModel.findByPk(queueId);
            if (!queueItem)
                return false;
            yield queueItem.destroy();
            return true;
        });
    }
    /**
     * Retrieves the current song playing on the radio (position 1 in queue).
     */
    getCurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield queue_model_1.QueueModel.findOne({
                where: { position: 1 },
                include: song_model_1.SongModel,
            });
            return current ? current.getDataValue('Song') : null;
        });
    }
    /**
     * Retrieves the next song in the queue (position 2 in queue).
     */
    getNext() {
        return __awaiter(this, void 0, void 0, function* () {
            const next = yield queue_model_1.QueueModel.findOne({
                where: { position: 2 },
                include: song_model_1.SongModel,
            });
            return next ? next.getDataValue('Song') : null;
        });
    }
}
exports.RadioService = RadioService;
