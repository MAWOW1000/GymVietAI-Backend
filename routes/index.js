const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const profileRoutes = require('./profileRoutes');
const roleRoutes = require('./roleRoutes');
const { apiLimiter } = require('../middleware/rateLimiter');
const { notFound } = require('../middleware/errorHandler');

// Apply rate limiting to all routes
router.use(apiLimiter);

// Route groups
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/roles', roleRoutes);

// Handle 404
router.use(notFound);

module.exports = router;