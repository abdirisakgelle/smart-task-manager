const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeAssignmentsController');

// Test route to verify file is loaded
router.get('/test', (req, res) => res.json({ message: 'Test route works' }));

// Filtered
router.get('/employee/:employee_id', controller.getAssignmentsByEmployee);

// CRUD
router.post('/', controller.createAssignment);
router.get('/', controller.getAllAssignments);
router.get('/:id', controller.getAssignmentById);
router.put('/:id', controller.updateAssignment);
router.delete('/:id', controller.deleteAssignment);

module.exports = router; 