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
exports.quotaMiddleware = void 0;
const song_model_1 = require("../models/song.model");
const MAX_STORAGE_LIMIT_MB = 500; // Define storage limit per user in MB
const quotaMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub; // User ID from auth middleware
        if (!userId) {
            res
                .status(401)
                .json({ success: false, message: 'User not authenticated.' });
            return;
        }
        // Calculate user's current storage usage
        const userSongs = yield song_model_1.SongModel.findAll({
            where: { uploadedBy: userId },
        });
        const totalSizeMB = userSongs.reduce((sum, song) => sum + (song.size || 0), 0) /
            (1024 * 1024);
        if (totalSizeMB >= MAX_STORAGE_LIMIT_MB) {
            res.status(403).json({
                success: false,
                message: `Storage limit exceeded. Maximum allowed is ${MAX_STORAGE_LIMIT_MB} MB.`,
            });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.quotaMiddleware = quotaMiddleware;
