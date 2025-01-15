import http from 'http';
import app from './app';
import { Server as WebSocketServer } from 'ws';
import logger from './utils/logger';
import { sequelize } from './config/database.config';
import dotenv from 'dotenv';
import { radioService } from './services/radio.service';

// Load environment variables from .env file
dotenv.config();

// Start Express server
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

(async () => {
  try {
    // Authenticate and sync database
    await sequelize.authenticate();
    logger.info('SQLite database connected successfully.');

    await sequelize.sync();
    logger.info('Database synced.');

    // Start WebSocket server
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
      try {
        logger.info('WebSocket connection established');

        // Attach client IP for logging
        const clientIp = req.socket.remoteAddress;
        logger.info(`WebSocket connection from: ${clientIp}`);

        // Integrate with radio service
        radioService.addWebSocketClient(ws);

        // Message handling
        ws.on('message', (message) => {
          try {
            const parsedMessage = JSON.parse(message.toString());
            logger.info(
              `WebSocket message received: ${JSON.stringify(parsedMessage)}`
            );

            // TODO: Add message type handling if needed
            // Example:
            // switch(parsedMessage.type) {
            //   case 'ADD_TO_QUEUE':
            //     // Handle queue addition logic
            //     break;
            // }
          } catch (parseError) {
            logger.error('Error parsing WebSocket message', {
              error: parseError,
              rawMessage: message,
            });
          }
        });

        // Error handling
        ws.on('error', (error) => {
          logger.error('WebSocket error', {
            clientIp,
            error: error.message,
          });
        });

        // Connection close handling
        ws.on('close', (code, reason) => {
          logger.info('WebSocket connection closed', {
            clientIp,
            code,
            reason: reason.toString(),
          });
        });
      } catch (connectionError) {
        logger.error('WebSocket connection setup error', {
          error: connectionError,
        });
      }
    });

    // WebSocket server error handling
    wss.on('error', (error) => {
      logger.error('WebSocket server error', {
        error: error.message,
      });
    });

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
      logger.info(`WebSocket server running at ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server or connect to database', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
})();
