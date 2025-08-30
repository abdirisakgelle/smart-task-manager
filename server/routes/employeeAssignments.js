import express from 'express';
import * as controller from '../controllers/employeeAssignmentsController.js';

const router = express.Router();

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

export default router; 