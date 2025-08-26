const express = require('express');
const router = express.Router();
const sectionsController = require('../controllers/sectionsController');

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

module.exports = router; 