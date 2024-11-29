const express = require('express');
const router = express.Router();
const chatPromptController = require('../controllers/chatPromptController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public route để lấy prompt active
router.get('/active', chatPromptController.getActivePrompt);

// Admin routes
router.use(verifyToken, isAdmin);
router.put('/:id', chatPromptController.updatePrompt);

module.exports = router; 