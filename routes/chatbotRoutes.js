const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { verifyToken } = require('../middleware/auth');
const { validateChatMessage } = require('../middleware/validate');

router.use(verifyToken);

router.post('/chat', validateChatMessage, (req, res) => chatbotController.chat(req, res));
router.get('/history', (req, res) => chatbotController.getChatHistory(req, res));

module.exports = router; 