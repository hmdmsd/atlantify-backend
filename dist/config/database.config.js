"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite', // Specify SQLite as the dialect
    storage: path_1.default.resolve(__dirname, '../../database.sqlite'), // Path to SQLite database file
    logging: console.log, // Enable logging of SQL queries (optional)
});
