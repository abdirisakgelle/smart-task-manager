const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');

// Filtered endpoints
router.get('/agent/:agent_id', ticketsController.getTicketsByAgent);
router.get('/resolution-status/:resolution_status', ticketsController.getTicketsByResolutionStatus);
router.get('/issue-type/:issue_type', ticketsController.getTicketsByIssueType);
router.get('/device-type/:device_type', ticketsController.getTicketsByDeviceType);
router.get('/first-call-resolution/:first_call_resolution', ticketsController.getTicketsByFirstCallResolution);
router.get('/communication-channel/:communication_channel', ticketsController.getTicketsByCommunicationChannel);

// Basic CRUD operations
router.post('/', ticketsController.createTicket);
router.get('/', ticketsController.getAllTickets);
router.get('/:id', ticketsController.getTicketById);
router.put('/:id', ticketsController.updateTicket);
router.delete('/:id', ticketsController.deleteTicket);

module.exports = router; 