import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import logger from './utils/logger';
import playlistRoutes from './routes/playlist.routes';


const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);
app.use('/api/playlists', playlistRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Start message
logger.info('Express app configured.');

export default app;
