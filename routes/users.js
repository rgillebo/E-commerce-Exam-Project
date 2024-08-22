const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// Function to validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Register a new user
router.post("/register", async (req, res) => {
  /* #swagger.tags = ['Guest']
     #swagger.path = '/auth/register'
     #swagger.description = 'Endpoint to register a new user'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'User registration details',
         required: true,
         schema: {
             firstname: 'Test',
             lastname: 'User',
             username: 'testuser',
             email: 'testuser@example.com',
             password: 'securepassword',
             address: 'Stormwind 123',
             telephonenumber: '911'
         }
     }
     #swagger.responses[201] = {
         description: 'User successfully registered',
         schema: {
             status: 'success',
             statuscode: 201,
             data: {
                 user: {
                     id: 1,
                     firstname: 'Test',
                     lastname: 'User',
                     username: 'testuser',
                     email: 'testuser@example.com',
                     address: 'Stormwind 123',
                     telephonenumber: '911',
                     role_id: 2,
                     createdAt: '2023-06-10T00:00:00Z',
                     updatedAt: '2023-06-10T00:00:00Z'
                 }
             }
         }
     }
     #swagger.responses[400] = {
         description: 'Bad request',
         schema: {
             status: 'error',
             statuscode: 400,
             data: {
                 result: 'All fields are required / Invalid email address / Username or email already taken'
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal server error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Error message'
             }
         }
     }
  */
  try {
    const {
      firstname,
      lastname,
      username,
      email,
      password,
      address,
      telephonenumber,
    } = req.body;

    // Check if all required fields are provided
    if (
      !firstname ||
      !lastname ||
      !username ||
      !email ||
      !password ||
      !address ||
      !telephonenumber
    ) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        data: {
          result: "All fields are required",
        },
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        data: {
          result: "Invalid email address",
        },
      });
    }

    // Check if the username or email already exists
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        data: {
          result: "Username or email already taken",
        },
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      address,
      telephonenumber,
      role_id: 2, // Default to user role
    });

    // Exclude password from the response
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    res.status(201).json({
      status: "success",
      statuscode: 201,
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  /* #swagger.tags = ['Guest']
     #swagger.path = '/auth/login'
     #swagger.description = 'Endpoint for user login'
     #swagger.parameters['obj'] = {
         in: 'body',
         description: 'User login credentials',
         required: true,
         schema: {
             identifier: 'testuser',
             password: 'securepassword'
         }
     }
     #swagger.responses[200] = {
         description: 'Successful login',
         schema: {
             status: 'success',
             statuscode: 200,
             data: {
                 result: 'You are logged in',
                 id: 1,
                 email: 'testuser@example.com',
                 name: 'Test User',
                 token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
             }
         }
     }
     #swagger.responses[401] = {
         description: 'Invalid credentials',
         schema: {
             status: 'error',
             statuscode: 401,
             data: {
                 result: 'Invalid credentials'
             }
         }
     }
     #swagger.responses[500] = {
         description: 'Internal server error',
         schema: {
             status: 'error',
             statuscode: 500,
             data: {
                 result: 'Error message'
             }
         }
     }
  */
  try {
    const { identifier, password } = req.body;

    // Find the user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }],
      },
      attributes: { include: ['id', 'username', 'firstname', 'lastname', 'email', 'password'] },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: "error",
        statuscode: 401,
        data: {
          result: "Invalid credentials",
        },
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      status: "success",
      statuscode: 200,
      data: {
        result: "You are logged in",
        id: user.id,
        email: user.email,
        name: `${user.firstname} ${user.lastname}`,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      data: {
        result: error.message,
      },
    });
  }
});

module.exports = router;
