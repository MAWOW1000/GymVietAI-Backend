const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateRegister, validateLogin, validatePasswordReset, validateChangePassword } = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');

// Auth routes
router.post('/register', validateRegister, authController.register);
router.post('/login', loginLimiter, validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', validatePasswordReset, authController.resetPassword);
router.post('/change-password', verifyToken, validateChangePassword, authController.changePassword);

module.exports = router;