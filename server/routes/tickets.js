import express from 'express';
const router = express.Router();
import * as ticketsController from '../controllers/ticketsController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkPageAccess, addUserContext } from '../middleware/pageAccess.js';

// Filtered endpoints
router.get('/agent/:agent_id', ticketsController.getTicketsByAgent);
router.get('/resolution-status/:resolution_status', ticketsController.getTicketsByResolutionStatus);
router.get('/issue-type/:issue_type', ticketsController.getTicketsByIssueType);
router.get('/device-type/:device_type', ticketsController.getTicketsByDeviceType);
router.get('/first-call-resolution/:first_call_resolution', ticketsController.getTicketsByFirstCallResolution);
router.get('/communication-channel/:communication_channel', ticketsController.getTicketsByCommunicationChannel);

// Basic CRUD operations - require authentication and page access
router.post('/', verifyToken, checkPageAccess('tickets'), addUserContext(), ticketsController.createTicket);
router.get('/', verifyToken, checkPageAccess('tickets'), addUserContext(), ticketsController.getAllTickets);
router.get('/:id', verifyToken, checkPageAccess('tickets'), addUserContext(), ticketsController.getTicketById);
router.put('/:id', verifyToken, checkPageAccess('tickets'), addUserContext(), ticketsController.updateTicket);
router.delete('/:id', verifyToken, checkPageAccess('tickets'), addUserContext(), ticketsController.deleteTicket);

export default router; 