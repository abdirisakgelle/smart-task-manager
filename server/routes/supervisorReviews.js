const express = require('express');
const router = express.Router();
const supervisorReviewsController = require('../controllers/supervisorReviewsController');

// Filtered endpoints
router.get('/supervisor/:supervisor_id', supervisorReviewsController.getSupervisorReviewsBySupervisor);
router.get('/ticket/:ticket_id', supervisorReviewsController.getSupervisorReviewsByTicket);
router.get('/issue-status/:issue_status', supervisorReviewsController.getSupervisorReviewsByIssueStatus);
router.get('/resolved/:resolved', supervisorReviewsController.getSupervisorReviewsByResolved);

// Basic CRUD operations
router.post('/', supervisorReviewsController.createSupervisorReview);
router.get('/', supervisorReviewsController.getAllSupervisorReviews);
router.get('/:id', supervisorReviewsController.getSupervisorReviewById);
router.put('/:id', supervisorReviewsController.updateSupervisorReview);
router.delete('/:id', supervisorReviewsController.deleteSupervisorReview);

module.exports = router; 