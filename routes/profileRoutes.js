const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');
const { validateProfile } = require('../middleware/validate');

// Profile routes (requires authentication)
router.use(verifyToken);

router.get('/', profileController.getProfile);
router.put('/', validateProfile, profileController.updateProfile);
router.get('/stats', profileController.getProfileStats);
router.put('/goal', profileController.updateGoal);

module.exports = router;