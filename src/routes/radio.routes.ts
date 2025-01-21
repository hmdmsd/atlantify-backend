import { Router } from 'express';
import { RadioController } from '../controllers/radio.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const radioController = new RadioController();

// Public routes (all authenticated users can access)
router.get('/queue', authMiddleware, radioController.getQueue);
router.get('/songs', authMiddleware, radioController.searchSongs);

// Admin-only routes
router.post(
  '/queue',
  authMiddleware,
  adminMiddleware,
  radioController.addToQueue
);

router.delete(
  '/queue/:id',
  authMiddleware,
  adminMiddleware,
  radioController.removeFromQueue
);

router.post(
  '/skip',
  authMiddleware,
  adminMiddleware,
  radioController.skipTrack
);

router.post(
  '/toggle',
  authMiddleware,
  adminMiddleware,
  radioController.toggleRadioStatus
);

export default router;
