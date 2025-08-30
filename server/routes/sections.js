import express from 'express';
const router = express.Router();
import * as sectionsController from '../controllers/sectionsController.js';

// Get all sections
router.get('/', sectionsController.getAllSections);

// Get sections by department
router.get('/department/:department_id', sectionsController.getSectionsByDepartment);

// Get section by ID
router.get('/:id', sectionsController.getSectionById);

// Create new section
router.post('/', sectionsController.createSection);

// Update section
router.put('/:id', sectionsController.updateSection);

// Delete section
router.delete('/:id', sectionsController.deleteSection);

export default router; 