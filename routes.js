'use strict';

const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { check, validationResult } = require('express-validator');
const { models } = require('./db');
const { User, Course } = models;

// Middleware function 
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
      console.log(err);
    }
  };
}

// This array is used to keep track of user records as they are created.
const users = [];

/**
 * Middleware to authenticate the request using Basic Authentication
 */
const authenticateUser = async (req, res, next) => {
  let message = null;

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);
  // If the user's credentials are available...
  if (credentials) {
    console.log(User);

    // Attempt to retrieve the user from the data store by their emailAddress (i.e. the user's "key" from the Authorization header).
    const user = await models.User.findOne({
      where: {emailAddress: credentials.name}
    });
    console.log(user);

    // If a user was successfully retrieved from the data store...
    if (user) {
      // Using the bcryptjs npm package to compare the user's password (from the Authorization header) to the user's password that was retrieved from the data store.
      const authenticated = bcryptjs.compareSync(
        credentials.pass, 
        user.password
      );

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
};


// Route that returns the current authenticated user.
router.get('/users', 
  authenticateUser, 
  asyncHandler(async (req, res) => {
    const user = req.currentUser;

    if (user) {
      res.json({
        id:user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
      });
    } else {
      res.json({message: err.message});
    }
  })
);  

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
], asyncHandler( async (req, res) => {
  
  const errors = validationResult(req);
  // // If there are validation errors...
  if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      // Return the validation errors to the client.
      return res.status(400).json({ errors: errorMessages });
  }

  // Attempt to get the validation result from the Request object.
  // And hash the new user's password.
  await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailAddress: req.body.emailAddress,
    password: bcryptjs.hashSync(req.body.password),
  });

  // Set the status to 201 Created and end the response.
  res.location('/');
  res.status(201).end();  
}));

router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({  
  attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [{
          model: User,
          as: "owner",
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
        },
      ],
    });
  if (courses) {
  res.json(courses);
  } else {
    res.json({message: err.message});
  }
}));

router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [{
        model: User,
        as: "owner",
        attributes: { exclude: ["createdAt", "updatedAt", "password"] },
      },
    ],
  });
  if (course) {
    res.json({course});
  } else {
    res.json({message: err.message});
  } 
}));

router.post('/courses', [
  check("title")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide "title"'),
  check("description")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide "description"'),
  ], authenticateUser, asyncHandler(async(req, res) => {
  const errors = validationResult(req);
    // // If there are validation errors...
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        // Return the validation errors to the client.
        return res.status(400).json({ errors: errorMessages });
    }

  const course = await Course.create({
    userId: req.body.userId,
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
  });
  res.location("/courses/" + course.id)
  res.status(201).end();  
}));

router.put('/courses/:id', [
  check("title")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide "title"'),
  check("description")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide "description"'),
  ], authenticateUser, asyncHandler( async(req, res) => {
    const errors = validationResult(req);
    // // If there are validation errors...
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        // Return the validation errors to the client.
        return res.status(400).json({ errors: errorMessages });
    }
    const course = await Course.findByPk(req.params.id);
    const user = req.currentUser;
  
    if (course.userId === user.id) {
      await models.Course.update({
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded,
      },
      { where: { id: req.params.id } }
      );
      res.status(201).end();  
    } else {
    res.status(403).json("User doesn't own the requested course");
    }
  }
));

router.delete('/courses/:id', authenticateUser, asyncHandler( async(req, res) => {
      const course = await models.Course.findOne({where: { id: req.params.id }});
      const user = req.currentUser;
      if (course.userId === user.id) {
        await models.Course.destroy(
          { where: { id: req.params.id } }
        );
        res.status(201).end();  
      } else {
        res.status(403).json("User doesn't own the requested course");
      }
    }));

module.exports = router;