import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import logger from './utils/logger';

const app: Application = express();

// Middleware
app.use(helmet());
// Global CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges'],
  })
);
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorMiddleware);

// Start message
logger.info('Express app configured.');

export default app;
