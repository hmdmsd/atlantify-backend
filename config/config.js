const path = require('path');
require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../database.sqlite'), // Path to SQLite file
    logging: console.log,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:', // Use in-memory database for testing
  },
  production: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../database.sqlite'),
    logging: false,
  },
};
