import http from 'http';
import app from './app';
import { Server as WebSocketServer } from 'ws';
import logger from './utils/logger';
import { sequelize } from './config/database.config';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Start Express server
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

(async () => {
  try {
    await sequelize.authenticate(); // Test the SQLite connection
    logger.info('SQLite database connected successfully.');

    await sequelize.sync(); // Sync models with the database
    logger.info('Database synced.');

    server.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server or connect to database:', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
})();
// Start WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  logger.info('WebSocket connection established.');

  ws.on('message', (message) => {
    logger.info(`WebSocket message received: ${message}`);
  });

  ws.on('close', () => {
    logger.info('WebSocket connection closed.');
  });
});
