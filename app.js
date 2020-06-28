'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');

const { sequelize, models } = require('./db');
// const { User, Course } = models;
// let User = models;
// let course = models;

// create the Express app
const app = express();

// Setup request body JSON parsing.
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

console.log('Testing the connection to the database...');

(async () => {
  try {
    // Test the connection to the database
    console.log('Connection to the database successful!');
    await sequelize.authenticate();

    // Sync the models
    console.log('Synchronizing the models with the database...');
    await sequelize.sync();

  } catch(error) {
    console.log('Connection to the database failed!', error);
  }
})();

// Variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// Setup api routes 
app.use('/api', routes);

// send 404 if no other route matched
app.use((req, res, next) => {
  const err = new Error
  err.status(404).json({
    message: 'Route Not Found',
  });
  next(err)
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    error: {    
    message: err.message,
    },
    // error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
