import express from 'express';
const router = express.Router();
import * as contentController from '../controllers/contentController.js';

// Filtered endpoints
router.get('/script-status/:script_status', contentController.getContentByScriptStatus);
router.get('/director/:director_id', contentController.getContentByDirector);
router.get('/idea/:idea_id', contentController.getContentByIdea);

// Basic CRUD operations
router.post('/', contentController.createContent);
router.get('/', contentController.getAllContent);
router.get('/:id', contentController.getContentById);
router.put('/:id', contentController.updateContent);
router.delete('/:id', contentController.deleteContent);

export default router; 