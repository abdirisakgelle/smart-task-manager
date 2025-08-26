const express = require('express');
const router = express.Router();
const departmentsController = require('../controllers/departmentsController');

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

module.exports = router; 