import { Router } from 'express';
import { RadioController } from '../controllers/radio.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const radioController = new RadioController();

// Add authentication middleware
router.use(authMiddleware);

// Get current queue
router.get('/queue', radioController.getQueue);

// Add song to queue
router.post('/queue', radioController.addToQueue);

// Remove song from queue
router.delete('/queue/:id', radioController.removeFromQueue);

// Skip current track
router.post('/skip', radioController.skipTrack);

export default router;
