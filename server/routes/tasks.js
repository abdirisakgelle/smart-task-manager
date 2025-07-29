const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { verifyToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all tasks
router.get('/', tasksController.getAllTasks);

// Get task statistics
router.get('/stats/overview', tasksController.getTaskStats);

// Get SMS logs (admin/manager only)
router.get('/sms/logs', tasksController.getSmsLogs);

// Get task by ID
router.get('/:id', tasksController.getTaskById);

// Create new task
router.post('/', tasksController.createTask);

// Update task
router.put('/:id', tasksController.updateTask);

// Delete task
router.delete('/:id', tasksController.deleteTask);

module.exports = router; 