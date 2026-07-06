const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { login, logout, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/login',
  [
    body('role').isIn(['student', 'teacher', 'admin']).withMessage('Please select a valid role.'),
    body('identifier').trim().notEmpty().withMessage('Institute ID or Email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

router.post('/logout', logout);
router.get('/me', protect, me);

module.exports = router;
