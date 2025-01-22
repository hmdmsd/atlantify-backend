import { Router } from 'express';
import { MusicBoxController } from '../controllers/musicbox.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const musicBoxController = new MusicBoxController();

// Public routes
router.get('/suggestions', musicBoxController.getSuggestions);

// Protected routes - require authentication
router.use(authMiddleware);
router.post('/suggestions', musicBoxController.addSuggestion);
router.post('/suggestions/:id/toggle-vote', musicBoxController.toggleVote);
router.delete('/suggestions/:id', musicBoxController.removeSuggestion);

// Admin routes - require admin role
router.put(
  '/suggestions/:id/status',
  adminMiddleware,
  musicBoxController.updateSuggestionStatus
);

export default router;
