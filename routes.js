'use strict';

const express = require('express');

// const { check, validationResult } = require('express-validator/check');
const { check, validationResult } = require('express-validator');

// This array is used to keep track of user records as they are created.
const users = [];

// Construct a router instance.
const router = express.Router();


// Route that returns a list of users.
router.get('/users', (req, res) => {
  res.json(users);
});

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
    .withMessage('Please provide a value for "email address"'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "password"'),
], (req, res) => {
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req);

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
  // if (!user.firstName) {
  //   // The `user.name` property isn't defined or is set to `undefined`, `null`, or an empty string
  //   errors.push('Please provide a value for "first name"');
  // }
  // if (!user.email) {
  //   errors.push('Please provide a value for "email"');
  // }
  // if (errors.length > 0) {

  // Return the validation errors to the client.
  // res.status(400).json({ errors });
  // } else {

  // Add the user to the `users` array.
  users.push(user);

  // Set the status to 201 Created and end the response.
  res.location('/');
  res.status(201).end();
  
});

router.get('/courses', async (req, res) => {
  const courses = await courses.getCourses();
  res.json(courses);

});

router.get('/courses/:id', async (req, res) => {
  const course = await courses.getCourse(req.params.id);
  res.json(course);
});

router.post('/courses', async(req, res) => {
  const course = await courses.createCourse({
    course: req.body.course,
    // title: req.body.title
  });
  res.json(course);
});

module.exports = router;