"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const songs_controller_1 = require("../controllers/songs.controller");
const router = (0, express_1.Router)();
const songsController = new songs_controller_1.SongsController();
// Define song routes
router.get('/', (req, res) => songsController.listSongs(req, res));
router.post('/upload', (req, res) => songsController.uploadSong(req, res));
router.get('/:id', (req, res) => songsController.getSongDetails(req, res));
router.delete('/:id', (req, res) => songsController.deleteSong(req, res));
exports.default = router;
