import { Router } from 'express';
import authRoutes from './auth.routes';
import musicBoxRoutes from './musicbox.routes';
import radioRoutes from './radio.routes';
import songsRoutes from './songs.routes';
import playlistRouter from './playlist.routes';
import likedSongsRouter from './liked-songs.routes';
import songStatsRouter from './song-stats.routes';

const router = Router();

// Combine all routes
router.use('/auth', authRoutes);
router.use('/musicbox', musicBoxRoutes);
router.use('/radio', radioRoutes);
router.use('/songs', songsRoutes);
router.use('/playlists', playlistRouter);
router.use('/liked-songs', likedSongsRouter);
router.use('/stats', songStatsRouter);

export default router;
