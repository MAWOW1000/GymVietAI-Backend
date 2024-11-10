const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken, isAdmin, hasPermission } = require('../middleware/auth');
const { validateRole } = require('../middleware/validate');

// Role management routes (Admin only)
router.use(verifyToken, isAdmin);

router.get('/', hasPermission('role_manage'), roleController.getAllRoles);
router.post('/', hasPermission('role_manage'), validateRole, roleController.createRole);
router.put('/:id', hasPermission('role_manage'), validateRole, roleController.updateRole);
router.delete('/:id', hasPermission('role_manage'), roleController.deleteRole);
router.get('/:id/permissions', hasPermission('role_manage'), roleController.getRolePermissions);

module.exports = router;