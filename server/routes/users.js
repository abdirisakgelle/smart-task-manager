import express from 'express';
import * as usersController from '../controllers/usersController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireAdmin, canManageUsers } from '../middleware/rbac.js';
import { checkPageAccess, addUserContext } from '../middleware/pageAccess.js';

const router = express.Router();

// Public routes
router.post('/login', usersController.loginUser);
router.post('/refresh-token', usersController.refreshToken);
router.get('/demo-credentials', usersController.getDemoCredentials);

// Admin-only routes for user management
router.post('/create', verifyToken, requireAdmin, usersController.createUser);
router.get('/available-employees', verifyToken, requireAdmin, usersController.getAvailableEmployees);
router.get('/available-users-for-linking', verifyToken, requireAdmin, usersController.getAvailableUsersForLinking);

// Protected routes with role-based access
// Ensure middleware order: verifyToken -> addUserContext -> checkPageAccess
router.get('/', verifyToken, addUserContext(), checkPageAccess('users'), usersController.getAllUsers);
router.get('/profile', verifyToken, usersController.getCurrentUser);
router.get('/:id', verifyToken, requireAdmin, usersController.getUserById);

// User management routes (admin only)
router.put('/:user_id/role', verifyToken, requireAdmin, usersController.updateUserRole);
router.put('/:user_id/status', verifyToken, requireAdmin, usersController.updateUserStatus);
router.put('/:user_id/password', verifyToken, requireAdmin, usersController.resetUserPassword);
router.put('/:id', verifyToken, requireAdmin, usersController.updateUser);
router.delete('/:id', verifyToken, requireAdmin, usersController.deleteUser);

export default router; 