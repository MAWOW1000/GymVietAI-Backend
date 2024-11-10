const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { validateUserCreate, validateUserUpdate } = require('../middleware/validate');

// Middleware bảo vệ routes admin
router.use(verifyToken, isAdmin);

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users', validateUserCreate, adminController.createUser);
router.put('/users/:id', validateUserUpdate, adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Role Management
router.get('/roles', adminController.getAllRoles);

// Dashboard Stats
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;