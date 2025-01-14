import { Router } from 'express';
import { MusicBoxController } from '../controllers/musicbox.controller';

const router = Router();
const musicBoxController = new MusicBoxController();

// Define music box routes
router.get('/suggestions', (req, res) =>
  musicBoxController.getSuggestions(req, res)
);
router.post('/suggestions', (req, res) =>
  musicBoxController.addSuggestion(req, res)
);
router.post('/suggestions/:id/vote', (req, res) =>
  musicBoxController.voteSuggestion(req, res)
);
router.delete('/suggestions/:id', (req, res) =>
  musicBoxController.removeSuggestion(req, res)
);

export default router;
