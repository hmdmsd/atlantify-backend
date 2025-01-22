import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { PlaylistController } from '../controllers/playlist-controller';

const router = Router();
const playlistController = new PlaylistController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new playlist
router.post('/', (req, res) => playlistController.createPlaylist(req, res));

// Get all playlists for the current user
router.get('/', (req, res) => playlistController.getUserPlaylists(req, res));

// Get specific playlist details
router.get('/:id', (req, res) =>
  playlistController.getPlaylistDetails(req, res)
);

// Update playlist details
router.put('/:id', upload.single('coverImage'), (req, res) =>
  playlistController.updatePlaylist(req, res)
);

// Delete a playlist
router.delete('/:id', (req, res) =>
  playlistController.deletePlaylist(req, res)
);

// Add a song to a playlist
router.post('/:id/songs', (req, res) =>
  playlistController.addSongToPlaylist(req, res)
);

// Remove a song from a playlist
router.delete('/:id/songs/:songId', (req, res) =>
  playlistController.removeSongFromPlaylist(req, res)
);

export default router;
