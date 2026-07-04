const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const basename = path.basename(__filename);
const db = {};

// Auto-loads every model file in this folder (except this one) and registers
// it on `db` by name, so adding a new model later means adding a file here —
// nothing else needs to change.
fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith('.js'))
  .forEach((file) => {
    const defineModel = require(path.join(__dirname, file));
    const model = defineModel(sequelize, DataTypes);
    db[model.name] = model;
  });

// Wires up associations after all models exist, so every model.associate()
// can safely reference any other model regardless of file load order.
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;
