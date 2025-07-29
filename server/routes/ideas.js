const express = require('express');
const router = express.Router();
const ideasController = require('../controllers/ideasController');

// Basic CRUD operations
router.post('/', ideasController.createIdea);
router.get('/', ideasController.getAllIdeas);
router.get('/:id', ideasController.getIdeaById);
router.put('/:id', ideasController.updateIdea);
router.delete('/:id', ideasController.deleteIdea);

// Filtered endpoints
router.get('/status/:status', ideasController.getIdeasByStatus);
router.get('/priority/:priority', ideasController.getIdeasByPriority);

module.exports = router; 