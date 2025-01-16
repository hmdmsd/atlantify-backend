import { Router } from 'express';
import { MusicBoxController } from '../controllers/musicbox.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const musicBoxController = new MusicBoxController();

// Public routes
router.get('/suggestions', musicBoxController.getSuggestions);

// Protected routes
router.use(authMiddleware);
router.post('/suggestions', musicBoxController.addSuggestion);
router.post('/suggestions/:id/toggle-vote', musicBoxController.toggleVote);
router.delete('/suggestions/:id', musicBoxController.removeSuggestion);

export default router;
