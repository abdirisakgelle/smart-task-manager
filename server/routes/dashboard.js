import express from 'express';
const router = express.Router();
import * as dashboardController from '../controllers/dashboardController.js';
import { adminAuth, requireRole, requireAnyRole, scopeDataByRole, verifyToken } from '../middleware/auth.js';

// Generic dashboard route - automatically routes to role-specific dashboard
router.get('/', verifyToken, scopeDataByRole, dashboardController.getGenericDashboard);

// Role-based dashboard routes
router.get('/admin', verifyToken, requireRole('admin'), scopeDataByRole, dashboardController.getAdminDashboard);
router.get('/ceo', verifyToken, requireRole('ceo'), scopeDataByRole, dashboardController.getCeoDashboard);
router.get('/section', verifyToken, requireRole('manager'), scopeDataByRole, dashboardController.getSectionManagerDashboard);
router.get('/agent', verifyToken, requireRole('agent'), scopeDataByRole, dashboardController.getAgentDashboard);
router.get('/content', verifyToken, requireRole('media'), scopeDataByRole, dashboardController.getContentDashboard);
router.get('/supervisor', verifyToken, requireRole('supervisor'), scopeDataByRole, dashboardController.getSupervisorDashboard);
router.get('/follow-up', verifyToken, requireRole('follow_up'), scopeDataByRole, dashboardController.getFollowUpDashboard);
router.get('/user', verifyToken, scopeDataByRole, dashboardController.getUserDashboard);

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

export default router; 