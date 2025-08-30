import { verifyToken } from '../config/jwt.js';

// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has required role (use system_role for admin/ceo, otherwise check org context)
    const userRole = req.user.system_role || req.orgContext?.systemRole || req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`
      });
    }

    next();
  };
};

// Admin-only middleware
const requireAdmin = requireRole(['admin']);

// Manager and above middleware
const requireManagerOrAbove = requireRole(['admin', 'manager']);

// Agent and above middleware
const requireAgentOrAbove = requireRole(['admin', 'manager', 'agent']);

// Supervisor and above middleware
const requireSupervisorOrAbove = requireRole(['admin', 'manager', 'supervisor']);

// Media role middleware
const requireMediaRole = requireRole(['admin', 'media']);

// Follow-up role middleware
const requireFollowUpRole = requireRole(['admin', 'follow_up']);

// Check if user can manage users (admin only)
const canManageUsers = requireRole(['admin']);

// Check if user can view sensitive data
const canViewSensitiveData = requireRole(['admin', 'manager']);

// Check if user can assign tasks
const canAssignTasks = requireRole(['admin', 'manager']);

// Check if user can review tickets
const canReviewTickets = requireRole(['admin', 'supervisor']);

// Check if user can manage content
const canManageContent = requireRole(['admin', 'media']);

// Check if user can access follow-ups
const canAccessFollowUps = requireRole(['admin', 'follow_up']);

export {
  requireRole,
  requireAdmin,
  requireManagerOrAbove,
  requireAgentOrAbove,
  requireSupervisorOrAbove,
  requireMediaRole,
  requireFollowUpRole,
  canManageUsers,
  canViewSensitiveData,
  canAssignTasks,
  canReviewTickets,
  canManageContent,
  canAccessFollowUps
}; 