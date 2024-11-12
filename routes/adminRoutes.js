const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { validateUserCreate, validateUserUpdate } = require('../middleware/validate');

// Middleware bảo vệ routes admin
router.use(verifyToken, isAdmin);

// User Management
router.get('/users', AdminController.getAllUsers.bind(AdminController));
router.post('/users', validateUserCreate, AdminController.createUser.bind(AdminController));
router.put('/users/:id', validateUserUpdate, AdminController.updateUser.bind(AdminController));
router.delete('/users/:id', AdminController.deleteUser.bind(AdminController));

// Role Management
router.get('/roles', AdminController.getAllRoles.bind(AdminController));

// Dashboard Stats
router.get('/dashboard', AdminController.getDashboardStats.bind(AdminController));

module.exports = router;