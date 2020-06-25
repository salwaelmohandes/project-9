'use strict';

const express = require('express');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { check, validationResult } = require('express-validator');
const { models } = require('./models');

// This array is used to keep track of user records as they are created.
// const users = [];

// Construct a router instance.
const router = express.Router();

const authenticateUser = async (req, res, next) => {
  let message = null;

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);
  try {
  const users = await User.findAll();
  } catch (err) {
  // If the user's credentials are available...
  if (credentials) {
    // Attempt to retrieve the user from the data store by their emailAddress (i.e. the user's "key" from the Authorization header).
    const user = users.find(u => u.emailAddress === credentials.name);
    // If a user was successfully retrieved from the data store...
    if (user) {
      // Using the bcryptjs npm package to compare the user's password (from the Authorization header) to the user's password that was retrieved from the data store.
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
      // If the passwords match...
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.emailAddress}`);
        // Storing the retrieved user object on the request object so any middleware functions that follow this middleware function will have access to the user's information.
        req.currentUser = user;
      
      } else {
        message = `Authentication failure for emailAddress: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for name: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  // If user authentication failed...
  if (message) {
    console.warn(message);

    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  } else {
    // Or if user authentication succeeded... Call the next() method.
    next();
    }
  }
};

// Route that returns the current authenticated user.
router.get('/users', authenticateUser, async (req, res) => {
  const user = req.currentUser;

  res.json({
    // id:user.id,
    // userId:user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    password:user.password,
  });
});

// // Route that returns a list of users.
// router.get('/users', (req, res) => {
//   res.json(users);
// });

// const firstNameValidationChain = check('firstName')
//   .exists({ checkNull: true, checkFalsy: true })
//   .withMessage('Please provide a value for "first name"');
  
  // Route that creates a new user.
router.post('/users', [
  check('firstName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "first name"'),
  check('lastName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "last name"'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "email address"')
    .isEmail()
    .withMessage('Please provide a valid email address for "email"'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "password"'),
], async (req, res) => {
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req);
  const users = await User.create({
    // id: req.body.id,
    // userId: req.body.userId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailAddress: req.body.emailAddress,
    password: req.body.password,
  });

  // // If there are validation errors...
  if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);

      // Return the validation errors to the client.
      return res.status(400).json({ errors: errorMessages });
  }
      // } else {

  // Get the user from the request body.
  const user = req.body;
  // const errors = [];

  // Hash the new user's password.
  user.password = bcryptjs.hashSync(user.password);

  // Add the user to the `users` array.
  users.push(user);

  // Set the status to 201 Created and end the response.
  res.location('/');
  res.status(201).end();
  
});

router.get('/courses', async (req, res) => {
  const courses = await Course.findAll();
  console.log(courses);
  res.json(courses);
});

router.get('/courses/:id', async (req, res) => {
  const course = await Course.find(req.params.id);
  res.json(course);
});

router.post('/courses', async(req, res) => {
  const course = await Course.create({
    // id: req.body.id,
    title: req.body.title,
    description: req.body.description,
    estimatetime: req.body.estimatetime,
    materialsNeeded: req.body.materialsNeeded,
  });
  res.location('/courses/:id')
  res.json(course);
});

module.exports = router;