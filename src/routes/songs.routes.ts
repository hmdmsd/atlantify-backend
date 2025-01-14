import { Router } from 'express';
import { SongsController } from '../controllers/songs.controller';

const router = Router();
const songsController = new SongsController();

// Define song routes
router.get('/', (req, res) => songsController.listSongs(req, res));
router.post('/upload', (req, res) => songsController.uploadSong(req, res));
router.get('/:id', (req, res) => songsController.getSongDetails(req, res));
router.delete('/:id', (req, res) => songsController.deleteSong(req, res));

export default router;
