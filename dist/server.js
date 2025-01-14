"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const ws_1 = require("ws");
const logger_1 = __importDefault(require("./utils/logger"));
const database_config_1 = require("./config/database.config");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
// Start Express server
const PORT = process.env.PORT || 4000;
const server = http_1.default.createServer(app_1.default);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_config_1.sequelize.authenticate(); // Test the SQLite connection
        logger_1.default.info('SQLite database connected successfully.');
        yield database_config_1.sequelize.sync(); // Sync models with the database
        logger_1.default.info('Database synced.');
        server.listen(PORT, () => {
            logger_1.default.info(`Server running at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        if (error instanceof Error) {
            // Narrow error type
            logger_1.default.error('Failed to start server or connect to database:', {
                message: error.message,
                stack: error.stack,
            });
        }
        else {
            logger_1.default.error('Failed to start server or connect to database:', {
                message: 'Unknown error occurred.',
            });
        }
        process.exit(1);
    }
}))();
// Start WebSocket server
const wss = new ws_1.Server({ server });
wss.on('connection', (ws) => {
    logger_1.default.info('WebSocket connection established.');
    ws.on('message', (message) => {
        logger_1.default.info(`WebSocket message received: ${message}`);
    });
    ws.on('close', () => {
        logger_1.default.info('WebSocket connection closed.');
    });
});
