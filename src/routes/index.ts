import { Router } from 'express';
import authRouter from './auth.routes';
import songsRouter from './songs.routes';
import musicBoxRouter from './musicbox.routes';
import playlistRouter from './playlist.routes';
import likedSongsRouter from './liked-songs.routes';
import songStatsRouter from './song-stats.routes';

const router = Router();

// Base API routes
router.use('/auth', authRouter);
router.use('/songs', songsRouter);
router.use('/musicbox', musicBoxRouter);
router.use('/playlists', playlistRouter);
router.use('/liked-songs', likedSongsRouter);
router.use('/stats', songStatsRouter);

export default router;
