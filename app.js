'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');


const { sequelize, models } = require('./models');
// const { User, Course } = models;
const Course = models;
const User = models;

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

// app.get('/courses', async (req, res) => {
//   const courses = await courses.getCourses();
//   res.json(courses);

// });

// app.get('/courses/:id', async (req, res) => {
//   const course = await courses.getCourse(req.params.id);
//   res.json(course);
// });

// app.post('/courses', async(req, res) => {
//   const course = await courses.createCourse({
//     course: req.body.course,
//     // title: req.body.title
//   });
//   res.json(course);
// });

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err,
    // error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
