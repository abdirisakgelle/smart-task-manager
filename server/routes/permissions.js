const express = require('express');
const router = express.Router();
const permissionsController = require('../controllers/permissionsController');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { addUserContext } = require('../middleware/pageAccess');

// Get available pages (admin only)
router.get('/pages', verifyToken, requireAdmin, permissionsController.getAvailablePages);

// Get all users with permission summary (admin only)
router.get('/users', verifyToken, addUserContext(), requireAdmin, permissionsController.getAllUsersPermissions);

// Get specific user permissions (admin only)
router.get('/users/:userId', verifyToken, addUserContext(), requireAdmin, permissionsController.getUserPermissions);

// Update user permissions (admin only)
router.put('/users/:userId', verifyToken, addUserContext(), requireAdmin, permissionsController.updateUserPermissions);

// Get current user's allowed pages (for frontend caching)
router.get('/current-user', verifyToken, addUserContext(), permissionsController.getCurrentUserPermissions);

// Check page access for current user
router.get('/check/:pageName', verifyToken, permissionsController.checkPageAccess);

module.exports = router; 