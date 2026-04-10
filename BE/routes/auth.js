import express from 'express';
import { body, validationResult } from 'express-validator';
import { generateToken } from '../config/jwt.js';
import { isStrongPassword } from '../config/security.js';
import { logAudit } from '../utils/logger.js';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Register new user
 */
router.post(
  '/register',
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Check password strength
      if (!isStrongPassword(password)) {
        return res.status(400).json({
          error:
            'Password must contain uppercase, lowercase, number, and special character',
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        await logAudit(
          null,
          'USER_REGISTERED',
          `Username or email already exists: ${username}`,
          req
        );
        return res
          .status(409)
          .json({ error: 'Username or email already exists' });
      }

      // Create user (password will be hashed via pre-save middleware)
      const newUser = new User({
        username,
        email,
        password_hash: password, // Will be hashed in pre-save
      });

      await newUser.save();

      // Log registration
      await logAudit(
        newUser._id,
        'USER_REGISTERED',
        `User ${username} registered`,
        req
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

/**
 * Login user
 */
router.post(
  '/login',
  body('username').notEmpty(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Find user
      const user = await User.findOne({ username });

      if (!user) {
        await logAudit(
          null,
          'USER_LOGIN',
          `Login failed: User not found - ${username}`,
          req
        );
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare passwords
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        await logAudit(
          null,
          'USER_LOGIN',
          `Login failed: Invalid password - ${username}`,
          req
        );
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      user.last_login = new Date();
      await user.save();

      // Generate token
      const token = generateToken({
        id: user._id,
        username: user.username,
        isAdmin: user.is_admin,
      });

      // Log login
      await logAudit(user._id, 'USER_LOGIN', `User ${username} logged in`, req);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.is_admin,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

/**
 * Get current user
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * Logout user (mainly for audit logging)
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    await logAudit(
      req.user.id,
      'USER_LOGOUT',
      `User ${req.user.username} logged out`,
      req
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
