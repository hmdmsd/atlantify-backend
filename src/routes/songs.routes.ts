import { Router } from 'express';
import { SongsController } from '../controllers/songs.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload, validateFileUpload } from '../middleware/upload.middleware';
import cors from 'cors';

const router = Router();
const songsController = new SongsController();

// CORS configuration for streaming
const streamingCors = cors({
  origin: true, // Allow all origins
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Range', 'Authorization', 'Content-Type'],
  exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges'],
  credentials: true,
});

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply specific CORS for streaming endpoint
router.options('/stream/:id', streamingCors);
router.get('/stream/:id', streamingCors, (req, res) =>
  songsController.streamSong(req, res)
);

// Regular routes
router.get('/', (req, res) => songsController.listSongs(req, res));
router.post('/upload', upload.single('song'), validateFileUpload, (req, res) =>
  songsController.uploadSong(req, res)
);
router.get('/:id', (req, res) => songsController.getSongDetails(req, res));
router.delete('/:id', (req, res) => songsController.deleteSong(req, res));

export default router;
