const express = require('express');
const router = express.Router();
const ideasController = require('../controllers/ideasController');

// Filtered endpoints
router.get('/status/:status', ideasController.getIdeasByStatus);
router.get('/contributor/:contributor_id', ideasController.getIdeasByContributor);
router.get('/script-writer/:script_writer_id', ideasController.getIdeasByScriptWriter);
router.get('/priority/:priority', ideasController.getIdeasByPriority);

// Basic CRUD operations
router.post('/', ideasController.createIdea);
router.get('/', ideasController.getAllIdeas);
router.get('/:id', ideasController.getIdeaById);
router.put('/:id', ideasController.updateIdea);
router.delete('/:id', ideasController.deleteIdea);

module.exports = router; 