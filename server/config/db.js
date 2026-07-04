const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize connection to MySQL. Models (Phase 2) will call sequelize.define()
// or extend Model using this same instance, so there is a single source of truth
// for the database connection across the app.
const sequelize = new Sequelize(
  process.env.DB_NAME || 'institute_portal',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
