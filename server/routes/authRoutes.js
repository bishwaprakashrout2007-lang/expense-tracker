const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validate,
  ],
  registerUser
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    validate,
  ],
  loginUser
);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(
    protect,
    [
      check('email', 'Please include a valid email').optional().isEmail(),
      check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 }),
      validate,
    ],
    updateUserProfile
  );

module.exports = router;
