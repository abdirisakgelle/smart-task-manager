import express from 'express';
const router = express.Router();
import * as productionController from '../controllers/productionController.js';

// Filtered endpoints
router.get('/status/:production_status', productionController.getProductionByStatus);
router.get('/editor/:editor_id', productionController.getProductionByEditor);
router.get('/content/:content_id', productionController.getProductionByContent);
router.get('/sent-to-social/:sent_to_social_team', productionController.getProductionBySentToSocial);

// Basic CRUD operations
router.post('/', productionController.createProduction);
router.get('/', productionController.getAllProduction);
router.get('/:id', productionController.getProductionById);
router.put('/:id', productionController.updateProduction);
router.delete('/:id', productionController.deleteProduction);

export default router; 