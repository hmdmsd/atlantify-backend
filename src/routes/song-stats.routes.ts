import { Router } from 'express';
import { SongStatsController } from '../controllers/song-stats.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const songStatsController = new SongStatsController();

// Public routes for statistics
router.get('/most-played', (req, res) =>
  songStatsController.getMostPlayedSongs(req, res)
);

// Protected routes
router.use(authMiddleware);

// Increment play count for a song
router.post('/:id/increment-play', (req, res) =>
  songStatsController.incrementPlayCount(req, res)
);

// Get recently played songs
router.get('/recently-played', (req, res) =>
  songStatsController.getRecentlyPlayedSongs(req, res)
);

// Get stats for a specific song
router.get('/:id', (req, res) => songStatsController.getSongStats(req, res));

export default router;
