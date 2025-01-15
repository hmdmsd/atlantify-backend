import { Router } from 'express';
import { SongsController } from '../controllers/songs.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload, validateFileUpload } from '../middleware/upload.middleware';

const router = Router();
const songsController = new SongsController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get list of songs
router.get('/', (req, res) => songsController.listSongs(req, res));

// Upload a new song
router.post('/upload', upload.single('song'), validateFileUpload, (req, res) =>
  songsController.uploadSong(req, res)
);

// Get song details
router.get('/:id', (req, res) => songsController.getSongDetails(req, res));

// Delete a song
router.delete('/:id', (req, res) => songsController.deleteSong(req, res));

export default router;
