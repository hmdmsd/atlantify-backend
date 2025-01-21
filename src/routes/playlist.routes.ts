import { Router } from 'express';
import { PlaylistController } from '../controllers/playlist.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const playlistController = new PlaylistController();

router.use(authMiddleware);

router.post('/', playlistController.createPlaylist.bind(playlistController));
router.get('/user', playlistController.getUserPlaylists.bind(playlistController));
router.get('/:id', playlistController.getPlaylist.bind(playlistController));
router.put('/:id', playlistController.updatePlaylist.bind(playlistController));
router.delete('/:id', playlistController.deletePlaylist.bind(playlistController));

export default router;