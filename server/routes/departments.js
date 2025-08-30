import express from 'express';
const router = express.Router();
import * as departmentsController from '../controllers/departmentsController.js';

// Get all departments
router.get('/', departmentsController.getAllDepartments);

// Get department by ID
router.get('/:id', departmentsController.getDepartmentById);

// Create new department
router.post('/', departmentsController.createDepartment);

// Update department
router.put('/:id', departmentsController.updateDepartment);

// Delete department
router.delete('/:id', departmentsController.deleteDepartment);

export default router; 