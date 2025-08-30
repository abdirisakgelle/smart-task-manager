import pool from '../config/db.js';
import { verifyToken as verifyJWTToken, isTokenExpired } from '../config/jwt.js';

// Middleware to check page access for protected routes
const checkPageAccess = (pageName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      
      // Admin/CEO always have access (bypass permission checks)
      if (req.user.system_role === 'admin' || req.user.system_role === 'ceo') {
        req.user.accessLevel = req.user.system_role || 'admin';
        return next();
      }

      // Check if user has permission for this page
      const [result] = await pool.query(`
        SELECT can_access 
        FROM permissions 
        WHERE user_id = ? AND page_name = ? AND can_access = TRUE
      `, [userId, pageName]);

      if (result.length === 0) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: `You don't have permission to access ${pageName}. Please contact your system administrator.`,
          page: pageName
        });
      }

      // Set user's access level based on system role and permissions
      req.user.accessLevel = req.user.system_role || 'user';
      req.user.allowedPages = await getUserAllowedPages(userId);
      
      next();
    } catch (err) {
      console.error('Error checking page access:', err);
      res.status(500).json({ error: 'Server error checking permissions' });
    }
  };
};

// Middleware to check if user can access a specific feature/action
const checkFeatureAccess = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      
      // Admin always has access
      if (req.user.system_role === 'admin') {
        return next();
      }

      // Check if user has permission for this feature
      const [result] = await pool.query(`
        SELECT can_access 
        FROM permissions 
        WHERE user_id = ? AND page_name = ? AND can_access = TRUE
      `, [userId, featureName]);

      if (result.length === 0) {
        return res.status(403).json({ 
          error: 'Feature access denied',
          message: `You don't have permission to use this feature. Please contact your system administrator.`,
          feature: featureName
        });
      }

      next();
    } catch (err) {
      console.error('Error checking feature access:', err);
      res.status(500).json({ error: 'Server error checking feature permissions' });
    }
  };
};

// Helper function to get user's allowed pages
const getUserAllowedPages = async (userId) => {
  try {
    const [permissions] = await pool.query(`
      SELECT page_name 
      FROM permissions 
      WHERE user_id = ? AND can_access = TRUE
    `, [userId]);
    
    return permissions.map(p => p.page_name);
  } catch (err) {
    console.error('Error getting user allowed pages:', err);
    return [];
  }
};

// Middleware to add user context for data filtering
const addUserContext = () => {
  return async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      
      // Resolve org context via normalized hierarchy and attach to request
      const [ctxRows] = await pool.query(`
        SELECT 
          u.user_id,
          u.employee_id,
          e.unit_id,
          un.name AS unit_name,
          s.section_id,
          s.name AS section_name,
          d.department_id,
          d.name AS department_name
        FROM users u
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN units un ON e.unit_id = un.unit_id
        LEFT JOIN sections s ON un.section_id = s.section_id
        LEFT JOIN departments d ON s.department_id = d.department_id
        WHERE u.user_id = ?
        LIMIT 1
      `, [userId]);

      const org = ctxRows[0] || {};

      req.orgContext = {
        userId: org.user_id || userId,
        systemRole: req.user?.system_role || null,
        employeeId: org.employee_id || null,
        unitId: org.unit_id || null,
        unitName: org.unit_name || null,
        sectionId: org.section_id || null,
        sectionName: org.section_name || null,
        departmentId: org.department_id || null,
        departmentName: org.department_name || null
      };

      // Get user's permissions for data access control
      const [permissions] = await pool.query(`
        SELECT page_name 
        FROM permissions 
        WHERE user_id = ? AND can_access = TRUE
      `, [userId]);

      const allowedPages = permissions.map(p => p.page_name);

      // Define data access based on system_role and permissions
      const isAdmin = req.orgContext.systemRole === 'admin';
      req.user.dataAccess = {
        level: req.orgContext.systemRole || 'user',
        canViewAll: isAdmin,
        canEditAll: isAdmin,
        canDeleteAll: isAdmin,
        canManageUsers: isAdmin || allowedPages.includes('users'),
        canManagePermissions: isAdmin,
        allowedPages
      };

      // Backward-compatible scope used by some controllers
      req.dataScope = {
        userId: req.orgContext.userId,
        systemRole: req.orgContext.systemRole,
        employeeId: req.orgContext.employeeId,
        unitId: req.orgContext.unitId,
        unitName: req.orgContext.unitName,
        sectionId: req.orgContext.sectionId,
        sectionName: req.orgContext.sectionName,
        departmentId: req.orgContext.departmentId,
        departmentName: req.orgContext.departmentName
      };

      next();
    } catch (err) {
      console.error('Error adding user context:', err);
      // Return 422 for missing/broken relations instead of 500 to avoid client logout
      return res.status(422).json({ error: 'Missing or inconsistent user relations', details: err?.message });
    }
  };
};

// Middleware to filter data based on user permissions
const filterDataByPermission = (dataType) => {
  return async (req, res, next) => {
    try {
      // Add user context if not already present
      if (!req.orgContext) {
        await addUserContext()(req, res, () => {});
      }

      // Store data type for controllers to use
      req.user.dataType = dataType;
      
      next();
    } catch (err) {
      console.error('Error filtering data by permission:', err);
      res.status(500).json({ error: 'Server error filtering data' });
    }
  };
};

export { 
  checkPageAccess,
  checkFeatureAccess,
  addUserContext,
  filterDataByPermission
}; 

// ===== Added: Auth and Team-Scoping Utilities =====

// Require authentication (JWT)
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  if (isTokenExpired(token)) {
    return res.status(401).json({ error: 'Token expired' });
  }
  try {
    const decoded = verifyJWTToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Require any of the specified roles
const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowed.includes(req.user.system_role)) {
      return res.status(403).json({ 
        error: 'Access forbidden', 
        message: `One of roles [${allowed.join(', ')}] required, user has '${req.user.system_role}'` 
      });
    }
    next();
  };
};

// Resolve current user's org context from employees
const resolveUserOrgContext = async (employeeId) => {
  if (!employeeId) return { departmentId: null, sectionId: null };
  try {
    const [rows] = await pool.query(
      `SELECT d.department_id, s.section_id
       FROM employees e
       JOIN units un ON e.unit_id = un.unit_id
       JOIN sections s ON un.section_id = s.section_id
       JOIN departments d ON s.department_id = d.department_id
       WHERE e.employee_id = ?
       LIMIT 1`,
      [employeeId]
    );
    if (rows.length === 0) return { departmentId: null, sectionId: null };
    return { departmentId: rows[0].department_id, sectionId: rows[0].section_id };
  } catch (err) {
    return { departmentId: null, sectionId: null };
  }
};

// Build a team scope WHERE clause
// options: { ownerField: 't.assigned_to', prefer: 'section_or_department' }
const buildTeamScope = async (req, poolRef, options = {}) => {
  const ownerField = options.ownerField || 't.assigned_to';
  const prefer = options.prefer || 'section_or_department';

  // Org scope: admin, ceo
  if (['admin', 'ceo'].includes(req.user?.system_role)) {
    return { where: '', params: [] };
  }

  // Resolve current user's org context
  const { departmentId, sectionId } = await resolveUserOrgContext(req.user?.employee_id);

  // Team scope: manager, supervisor
  if (['manager', 'supervisor'].includes(req.user?.role)) {
    if (prefer === 'section_or_department' && sectionId) {
      return {
        where: ` WHERE ${ownerField} IN (SELECT e2.employee_id FROM employees e2 JOIN units u2 ON e2.unit_id = u2.unit_id WHERE u2.section_id = ?)` ,
        params: [sectionId]
      };
    }
    return {
      where: ` WHERE ${ownerField} IN (SELECT e2.employee_id FROM employees e2 JOIN units u2 ON e2.unit_id = u2.unit_id JOIN sections s2 ON u2.section_id = s2.section_id WHERE s2.department_id = ?)` ,
      params: [departmentId]
    };
  }

  // Self scope: everyone else
  return { where: ` WHERE ${ownerField} = ?`, params: [req.user?.employee_id || -1] };
};

export { requireAuth, requireRole, buildTeamScope, resolveUserOrgContext };