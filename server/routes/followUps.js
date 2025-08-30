import express from 'express';
const router = express.Router();
import * as followUpsController from '../controllers/followUpsController.js';

// Get eligible tickets for follow-up
router.get('/eligible', followUpsController.getEligibleFollowUps);

// Get reopened tickets
router.get('/reopened', followUpsController.getReopenedTickets);
router.get('/reopened/agent/:agent_id', followUpsController.getReopenedTicketsByAgent);

// Filtered endpoints
router.get('/agent/:follow_up_agent_id', followUpsController.getFollowUpsByAgent);
router.get('/ticket/:ticket_id', followUpsController.getFollowUpsByTicket);
router.get('/resolution-status/:resolution_status', followUpsController.getFollowUpsByResolutionStatus);
router.get('/satisfied/:satisfied', followUpsController.getFollowUpsBySatisfied);
router.get('/repeated-issue/:repeated_issue', followUpsController.getFollowUpsByRepeatedIssue);
router.get('/resolved-after-follow-up/:resolved_after_follow_up', followUpsController.getFollowUpsByResolvedAfterFollowUp);

// Basic CRUD operations
router.post('/', followUpsController.createFollowUp);
router.get('/', followUpsController.getAllFollowUps);
router.get('/:id', followUpsController.getFollowUpById);
router.put('/:id', followUpsController.updateFollowUp);
router.delete('/:id', followUpsController.deleteFollowUp);

export default router; 