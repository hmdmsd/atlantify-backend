import { Router } from 'express';
import authRoutes from './auth.routes';
import musicBoxRoutes from './musicbox.routes';
import radioRoutes from './radio.routes';
import songsRoutes from './songs.routes';

const router = Router();

// Combine all routes
router.use('/auth', authRoutes);
router.use('/musicbox', musicBoxRoutes);
router.use('/radio', radioRoutes);
router.use('/songs', songsRoutes);

export default router;
