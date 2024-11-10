const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin, hasPermission } = require('../middleware/auth');

// User management routes (Admin only)
router.use(verifyToken, isAdmin);

router.get('/', hasPermission('user_manage'), userController.getAllUsers);
router.get('/:id', hasPermission('user_manage'), userController.getUserById);
router.put('/:id', hasPermission('user_manage'), userController.updateUser);
router.delete('/:id', hasPermission('user_manage'), userController.deleteUser);

module.exports = router;