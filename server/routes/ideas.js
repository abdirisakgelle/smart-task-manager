const express = require('express');
const router = express.Router();
const ideasController = require('../controllers/ideasController');
const pipelineController = require('../controllers/pipelineController');
const { verifyToken } = require('../middleware/auth');
const { requireStageAccess, canMoveForward, enhanceUserContext } = require('../middleware/rbac');

// Apply authentication and user context enhancement to all routes
router.use(verifyToken);
router.use(enhanceUserContext);

// Content Production Pipeline endpoints
// GET /api/ideas?stage=Idea|Script|Production|Social - Stage-based listing
router.get('/', requireStageAccess('idea', 'read'), (req, res) => {
  if (req.query.stage) {
    return pipelineController.getIdeasByStage(req, res);
  }
  return ideasController.getAllIdeas(req, res);
});

// GET /api/ideas/:id - Enhanced detail view with all stages
router.get('/:id', requireStageAccess('idea', 'read'), pipelineController.getIdeaDetails);

// GET /api/ideas/:id/validation - Check validation for current stage
router.get('/:id/validation', requireStageAccess('idea', 'read'), pipelineController.getIdeaValidation);

// POST /api/ideas/:id/move-forward - Move to next stage (transactional)
router.post('/:id/move-forward', (req, res, next) => {
  // Dynamic stage access check based on current stage
  // This will be enhanced in the controller to check the actual stage
  next();
}, pipelineController.moveIdeaForward);

// Basic CRUD operations (existing functionality)
router.post('/', requireStageAccess('idea', 'write'), ideasController.createIdea);
router.put('/:id', requireStageAccess('idea', 'write'), ideasController.updateIdea);
router.delete('/:id', requireStageAccess('idea', 'write'), ideasController.deleteIdea);

// Filtered endpoints (existing functionality)
router.get('/status/:status', requireStageAccess('idea', 'read'), ideasController.getIdeasByStatus);
router.get('/priority/:priority', requireStageAccess('idea', 'read'), ideasController.getIdeasByPriority);

module.exports = router; 