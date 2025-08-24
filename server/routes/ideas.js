const express = require('express');
const router = express.Router();
const ideasController = require('../controllers/ideasController');
const { verifyToken } = require('../middleware/auth');
const { rbac } = require('../middleware/rbac');

// Basic CRUD operations
router.post('/', verifyToken, rbac({ allow: ['admin','manager','media'] }), ideasController.createIdea);
router.get('/', verifyToken, ideasController.getAllIdeas);
router.get('/:id', verifyToken, ideasController.getIdeaById);
router.put('/:id', verifyToken, rbac({ allow: ['admin','manager','media'] }), ideasController.updateIdea);
router.delete('/:id', verifyToken, rbac({ allow: ['admin'] }), ideasController.deleteIdea);

// Filtered endpoints
router.get('/status/:status', verifyToken, ideasController.getIdeasByStatus);
router.get('/priority/:priority', verifyToken, ideasController.getIdeasByPriority);

// Move-forward action
router.post('/:id/move-forward', verifyToken, rbac({ allow: ['admin','manager','media'] }), ideasController.moveForward);

module.exports = router; 