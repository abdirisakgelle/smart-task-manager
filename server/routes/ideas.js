import express from 'express';
const router = express.Router();
import * as ideasController from '../controllers/ideasController.js';

// Basic CRUD operations
router.post('/', ideasController.createIdea);
router.get('/', ideasController.getAllIdeas);
router.get('/:id', ideasController.getIdeaById);
router.put('/:id', ideasController.updateIdea);
router.delete('/:id', ideasController.deleteIdea);

// Filtered endpoints
router.get('/status/:status', ideasController.getIdeasByStatus);
router.get('/priority/:priority', ideasController.getIdeasByPriority);

export default router; 