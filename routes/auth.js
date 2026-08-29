const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required')
];

const verifyOtpValidation = [
  body('email').isEmail().withMessage('Email is required'),
  body('otp').isLength({ min: 4, max: 6 }).withMessage('OTP must be 4-6 digits')
];

const resetPasswordValidation = [
  body('email').isEmail().withMessage('Email is required'),
  body('otp').isLength({ min: 4, max: 6 }).withMessage('OTP must be 4-6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/verify-otp', verifyOtpValidation, authController.verifyOtp);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

module.exports = router;