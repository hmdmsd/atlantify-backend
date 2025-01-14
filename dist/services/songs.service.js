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
exports.SongsService = void 0;
const song_model_1 = require("../models/song.model");
const s3_service_1 = require("./s3.service");
const s3Service = new s3_service_1.S3Service();
class SongsService {
    /**
     * Retrieves all songs.
     */
    listSongs() {
        return __awaiter(this, void 0, void 0, function* () {
            return song_model_1.SongModel.findAll();
        });
    }
    /**
     * Uploads a song to S3 and stores metadata in the database.
     * @param title - Title of the song.
     * @param artist - Artist of the song.
     * @param filePath - Local path to the song file.
     * @param size - Size of the song file.
     * @param uploadedBy - ID of the user uploading the song.
     * @returns The uploaded song metadata.
     */
    uploadSong(_a) {
        return __awaiter(this, arguments, void 0, function* ({ title, artist, filePath, size, uploadedBy, }) {
            const s3Url = yield s3Service.uploadFile(filePath, `songs/${title}`);
            return song_model_1.SongModel.create({ title, artist, path: s3Url, size, uploadedBy });
        });
    }
    /**
     * Retrieves song metadata by ID.
     * @param songId - The ID of the song.
     * @returns The song metadata or null if not found.
     */
    getSongDetails(songId) {
        return __awaiter(this, void 0, void 0, function* () {
            return song_model_1.SongModel.findByPk(songId);
        });
    }
    /**
     * Deletes a song from S3 and removes its metadata from the database.
     * @param songId - The ID of the song.
     * @returns True if the song was deleted, false otherwise.
     */
    deleteSong(songId) {
        return __awaiter(this, void 0, void 0, function* () {
            const song = yield song_model_1.SongModel.findByPk(songId);
            if (!song)
                return false;
            yield s3Service.deleteFile(song.path);
            yield song.destroy();
            return true;
        });
    }
}
exports.SongsService = SongsService;
