const express = require('express');
const router = express.Router();
const unitsController = require('../controllers/unitsController');

// Get all units
router.get('/', unitsController.getAllUnits);

// Get units by section
router.get('/section/:section_id', unitsController.getUnitsBySection);

// Get unit by ID
router.get('/:id', unitsController.getUnitById);

// Create new unit
router.post('/', unitsController.createUnit);

// Update unit
router.put('/:id', unitsController.updateUnit);

// Delete unit
router.delete('/:id', unitsController.deleteUnit);

module.exports = router; 