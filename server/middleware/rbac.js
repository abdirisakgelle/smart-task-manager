const pool = require('../config/db');

/**
 * RBAC Middleware for Content Production Pipeline
 * Roles: admin, user, manager, media (inferred from existing system)
 */

// Check if user has required role
const hasRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: `Required role: ${allowedRoles.join(' or ')}, your role: ${userRole}` 
      });
    }

    next();
  };
};

// Stage-specific access control
const stageAccess = {
  // Idea stage: admin, media, manager can create/edit; others read-only
  idea: {
    read: ['admin', 'user', 'manager', 'media'],
    write: ['admin', 'media', 'manager']
  },
  
  // Script stage: media, manager, admin can edit + move
  script: {
    read: ['admin', 'user', 'manager', 'media'],
    write: ['admin', 'media', 'manager'],
    move: ['admin', 'media', 'manager']
  },
  
  // Production stage: media (editors), manager, admin can edit + move
  production: {
    read: ['admin', 'user', 'manager', 'media'],
    write: ['admin', 'media', 'manager'],
    move: ['admin', 'media', 'manager']
  },
  
  // Social stage: media (social), manager, admin can schedule/publish + finalize
  social: {
    read: ['admin', 'user', 'manager', 'media'],
    write: ['admin', 'media', 'manager'],
    move: ['admin', 'media', 'manager'],
    publish: ['admin', 'media', 'manager']
  }
};

// Middleware factory for stage-specific access
const requireStageAccess = (stage, action = 'read') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = stageAccess[stage]?.[action] || [];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: `Stage: ${stage}, Action: ${action} requires role: ${allowedRoles.join(' or ')}, your role: ${userRole}` 
      });
    }

    next();
  };
};

// Check if user can move forward from a specific stage
const canMoveForward = (stage) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = stageAccess[stage]?.move || stageAccess[stage]?.write || [];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Move forward not allowed', 
        message: `Cannot move from ${stage} stage with role: ${userRole}` 
      });
    }

    next();
  };
};

// Enhanced user context middleware (gets full user info from DB)
const enhanceUserContext = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next();
  }

  try {
    const { roPool } = require('../config/db');
    const [users] = await roPool.query(`
      SELECT u.*, e.name as employee_name, e.department 
      FROM users u 
      LEFT JOIN employees e ON u.employee_id = e.employee_id 
      WHERE u.user_id = ?
    `, [req.user.id]);

    if (users.length > 0) {
      req.user = { ...req.user, ...users[0] };
    }
    
    next();
  } catch (error) {
    console.error('Error enhancing user context:', error);
    next(); // Continue even if enhancement fails
  }
};

module.exports = {
  hasRole,
  requireStageAccess,
  canMoveForward,
  enhanceUserContext,
  stageAccess
};