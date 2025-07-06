const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employeesController');

// Filtered endpoints
router.get('/department/:department', employeesController.getEmployeesByDepartment);
router.get('/shift/:shift', employeesController.getEmployeesByShift);

// Basic CRUD operations
router.post('/', employeesController.createEmployee);
router.get('/', employeesController.getAllEmployees);
router.get('/:id', employeesController.getEmployeeById);
router.put('/:id', employeesController.updateEmployee);
router.delete('/:id', employeesController.deleteEmployee);

module.exports = router; 