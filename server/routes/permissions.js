import express from 'express';
const router = express.Router();
import * as permissionsController from '../controllers/permissionsController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { addUserContext } from '../middleware/pageAccess.js';

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

export default router; 