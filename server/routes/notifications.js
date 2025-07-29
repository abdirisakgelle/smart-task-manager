const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { verifyToken } = require('../middleware/auth');

// Protected routes - require authentication
router.use(verifyToken);

// Get current user's notifications
router.get('/my', notificationsController.getCurrentUserNotifications);

// Get current user's unread count
router.get('/my/unread-count', notificationsController.getCurrentUserUnreadCount);

// Mark notification as read
router.put('/:notification_id/read', notificationsController.markAsRead);

// Mark all notifications as read for current user
router.put('/my/mark-all-read', notificationsController.markAllAsRead);

// Delete a notification
router.delete('/:notification_id', notificationsController.deleteNotification);

// Task assignment notifications
router.post('/task-assignment', notificationsController.createTaskAssignmentNotifications);

// Manual cleanup endpoint (admin only)
router.post('/cleanup', notificationsController.manualCleanup);

// Admin routes (optional - for user management)
router.get('/user/:user_id', notificationsController.getUserNotifications);
router.get('/user/:user_id/unread-count', notificationsController.getUnreadCount);
router.put('/user/:user_id/mark-all-read', notificationsController.markAllAsRead);

module.exports = router; 