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
exports.SongsController = void 0;
const songs_service_1 = require("../services/songs.service");
const songsService = new songs_service_1.SongsService();
class SongsController {
    /**
     * Lists all songs.
     */
    listSongs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const songs = yield songsService.listSongs();
                res.status(200).json({ success: true, songs });
            }
            catch (error) {
                console.error('Error listing songs:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Uploads a new song.
     */
    uploadSong(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { title, artist } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
                if (!req.file || !title || !artist || !userId) {
                    res.status(400).json({
                        success: false,
                        message: 'File, title, artist, and user ID are required.',
                    });
                    return;
                }
                const song = yield songsService.uploadSong({
                    title,
                    artist,
                    filePath: req.file.path,
                    size: req.file.size,
                    uploadedBy: userId,
                });
                res.status(201).json({ success: true, song });
            }
            catch (error) {
                console.error('Error uploading song:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Retrieves details of a specific song by ID.
     */
    getSongDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const song = yield songsService.getSongDetails(id);
                if (!song) {
                    res.status(404).json({ success: false, message: 'Song not found.' });
                    return;
                }
                res.status(200).json({ success: true, song });
            }
            catch (error) {
                console.error('Error retrieving song details:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Deletes a song by ID.
     */
    deleteSong(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const success = yield songsService.deleteSong(id);
                if (!success) {
                    res.status(404).json({ success: false, message: 'Song not found.' });
                    return;
                }
                res
                    .status(200)
                    .json({ success: true, message: 'Song deleted successfully.' });
            }
            catch (error) {
                console.error('Error deleting song:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
}
exports.SongsController = SongsController;
