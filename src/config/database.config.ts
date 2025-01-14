import { Sequelize } from 'sequelize';
import path from 'path';

export const sequelize = new Sequelize({
  dialect: 'sqlite', // Specify SQLite as the dialect
  storage: path.resolve(__dirname, '../../database.sqlite'), // Path to SQLite database file
  logging: console.log, // Enable logging of SQL queries (optional)
});
