const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getDashboardStats);
router.get('/admin-kpis', dashboardController.getAdminKPIs);
router.get('/top-contributors', dashboardController.getTopContributors);
router.get('/top-complained-issues', dashboardController.getTopComplainedIssues);
router.get('/ticket-resolution-overview', dashboardController.getTicketResolutionOverview);
router.get('/weekly-ticket-trends', dashboardController.getWeeklyTicketTrends);
router.get('/daily-ticket-volume', dashboardController.getDailyTicketVolume);
router.get('/simple-ticket-volume', dashboardController.getSimpleTicketVolume);
router.get('/all-ticket-volume', dashboardController.getAllTicketVolume);
router.get('/ticket-states', dashboardController.getTicketStates);
router.get('/fcr-rate', dashboardController.getFcrRate);

module.exports = router; 