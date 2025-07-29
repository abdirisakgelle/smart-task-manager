const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { adminAuth } = require('../middleware/auth');

router.get('/stats', dashboardController.getDashboardStats);
router.get('/admin-kpis', adminAuth, dashboardController.getAdminKPIs);
router.get('/top-contributors', dashboardController.getTopContributors);
router.get('/top-complained-issues', dashboardController.getTopComplainedIssues);
router.get('/ticket-resolution-overview', dashboardController.getTicketResolutionOverview);
router.get('/weekly-ticket-trends', dashboardController.getWeeklyTicketTrends);
router.get('/daily-ticket-volume', dashboardController.getDailyTicketVolume);
router.get('/simple-ticket-volume', dashboardController.getSimpleTicketVolume);
router.get('/all-ticket-volume', dashboardController.getAllTicketVolume);
router.get('/ticket-volume-by-category', dashboardController.getTicketVolumeByCategory);
router.get('/ticket-states', dashboardController.getTicketStates);
router.get('/fcr-rate', dashboardController.getFcrRate);
router.get('/ticket-volume-debug', dashboardController.getTicketVolumeDebug);
router.get('/test-timezone', dashboardController.testTimezoneConversion);
router.get('/debug-database', dashboardController.debugDatabase);
router.get('/debug-all-dates', dashboardController.debugAllDates);

// New widget endpoints
router.get('/recent-tickets', dashboardController.getRecentTickets);
router.get('/ideas-produced-today', dashboardController.getIdeasProducedToday);

// Test endpoint to create sample data
router.post('/create-test-tickets', dashboardController.createTestTickets);

// Debug endpoint to check database contents
router.get('/debug-tickets', dashboardController.debugTickets);

module.exports = router; 