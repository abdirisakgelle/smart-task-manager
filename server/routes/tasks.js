const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { verifyToken, scopeDataByRole } = require('../middleware/auth');
const { requireAuth, requireRole } = require('../middleware/pageAccess');

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(scopeDataByRole);

// Get all tasks
router.get('/', tasksController.getAllTasks);

// Get my tasks (self scope)
router.get('/my', tasksController.getMyTasks);

// Get task statistics
router.get('/stats/overview', tasksController.getTaskStats);

// Get task statistics with source breakdown
router.get('/stats/with-source', tasksController.getTaskStatsWithSource);

// Get tasks created from ideas
router.get('/from-ideas', tasksController.getTasksFromIdeas);

// Get tasks by source module and ID
router.get('/source/:source_module/:source_id', tasksController.getTasksBySource);

// Get SMS logs (admin/manager only)
router.get('/sms/logs', tasksController.getSmsLogs);

// Get team members (for Section Managers)
router.get('/team-members', tasksController.getTeamMembers);

// Update task status (for regular users)
router.put('/:id/status', tasksController.updateTaskStatus);

// Get task timeline (for admins and managers)
router.get('/:taskId/timeline', tasksController.getTaskTimeline);

// Get task by ID
router.get('/:id', tasksController.getTaskById);

// Create new task
router.post('/', tasksController.createTask);

// Update task
router.put('/:id', tasksController.updateTask);

// Delete task
router.delete('/:id', tasksController.deleteTask);

// Request task extension (for assigned users)
router.post('/:id/extension-request', tasksController.requestExtension);

// Mark task as completed (for assigned users)
router.post('/:id/complete', tasksController.completeTask);

// Approve/reject extension request (for managers/admins)
router.post('/:id/approve-extension', tasksController.approveExtension);

module.exports = router; 