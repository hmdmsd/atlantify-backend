import { Router } from 'express';
import { LikedSongsController } from '../controllers/liked-songs.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const likedSongsController = new LikedSongsController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all liked songs for the current user
router.get('/', (req, res) => likedSongsController.getLikedSongs(req, res));

// Toggle like status for a song
router.post('/:songId/toggle', (req, res) =>
  likedSongsController.toggleLikeSong(req, res)
);

// Check if a song is liked by the current user
router.get('/:songId/check', (req, res) =>
  likedSongsController.checkIfLiked(req, res)
);

// Get all liked song IDs for the current user
router.get('/ids', (req, res) =>
  likedSongsController.getUserLikedSongIds(req, res)
);

export default router;
