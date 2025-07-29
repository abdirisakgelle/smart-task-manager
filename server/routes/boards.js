const express = require('express');
const router = express.Router();
const boardsController = require('../controllers/boardsController');
const { verifyToken } = require('../middleware/auth');

// Protected routes - require authentication
router.use(verifyToken);

// Board routes
router.get('/', boardsController.getAllBoards);
router.post('/', boardsController.createBoard);
router.put('/:boardId', boardsController.updateBoard);
router.delete('/:boardId', boardsController.deleteBoard);

// Task routes
router.post('/:boardId/tasks', boardsController.createTask);
router.put('/:boardId/tasks/:taskId', boardsController.updateTask);
router.delete('/:boardId/tasks/:taskId', boardsController.deleteTask);

module.exports = router; 