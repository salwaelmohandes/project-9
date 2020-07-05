'use strict';

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const Sequelize = require('sequelize');

// sequelize options
const options = {
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
};

// create new sequelize instance
const sequelize = new Sequelize(options);

const models = {};

// Import all of the models.
fs
  .readdirSync(path.join(__dirname, 'models'))
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    console.info(`Importing database model from file: ${file}`);
    const model = sequelize['import'](path.join(__dirname, 'models', file));    
    models[model.name] = model;
  });

// If available, call method to create associations.
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    console.info(`Configuring the associations for the ${modelName} model...`);
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  models
};
