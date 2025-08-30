import express from 'express';
const router = express.Router();
import * as employeesController from '../controllers/employeesController.js';

// Employee registration with auto-generated job title
router.post('/register', employeesController.registerEmployee);

// Filtered endpoints
router.get('/department/:department', employeesController.getEmployeesByDepartment);
router.get('/shift/:shift', employeesController.getEmployeesByShift);

// Basic CRUD operations
router.post('/', employeesController.createEmployee);
router.get('/', employeesController.getAllEmployees);
router.get('/:id', employeesController.getEmployeeById);
router.put('/:id', employeesController.updateEmployee);
router.delete('/:id', employeesController.deleteEmployee);

export default router; 