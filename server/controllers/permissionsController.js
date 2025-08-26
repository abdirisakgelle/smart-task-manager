const pool = require('../config/db');

// Available pages for permission management
const availablePages = [
  // Dashboard permissions - only active dashboards
  { name: 'admin_dashboard', display: 'Admin Dashboard (/dashboard/admin)', category: 'Dashboards' },
  { name: 'agent_dashboard', display: 'Agent Dashboard (/dashboard/agent)', category: 'Dashboards' },
  { name: 'content_dashboard', display: 'Content Dashboard (/dashboard/content)', category: 'Dashboards' },
  { name: 'user_dashboard', display: 'User Dashboard (/dashboard/user)', category: 'Dashboards' },
  
  // Administration
  { name: 'users', display: 'User Management', category: 'Administration' },
  { name: 'employees', display: 'Employee Management', category: 'Administration' },
  { name: 'permissions', display: 'Permission Management', category: 'Administration' },
  
  // Support
  { name: 'tickets', display: 'Tickets', category: 'Support' },
  { name: 'supervisor_reviews', display: 'Supervisor Reviews', category: 'Support' },
  { name: 'follow_ups', display: 'Follow-ups', category: 'Support' },
  
  // Content
  { name: 'ideas', display: 'Creative Ideas', category: 'Content' },
  { name: 'content', display: 'Content Management', category: 'Content' },
  { name: 'production', display: 'Production', category: 'Content' },
  { name: 'social_media', display: 'Social Media', category: 'Content' },
  
  // Productivity - separate My Tasks and Tasks
  { name: 'my_tasks', display: 'My Tasks', category: 'Productivity' },
  { name: 'tasks', display: 'Tasks Management', category: 'Productivity' },
  { name: 'calendar', display: 'Calendar', category: 'Productivity' },
  { name: 'boards', display: 'Kanban Boards', category: 'Productivity' },
  
  // System
  { name: 'notifications', display: 'Notifications', category: 'System' },
  { name: 'profile', display: 'Profile', category: 'Personal' },
  
  // Analytics
  { name: 'ticket_analytics', display: 'Ticket Analytics', category: 'Analytics' },
  { name: 'content_analytics', display: 'Content Analytics', category: 'Analytics' },
  { name: 'employee_analytics', display: 'Employee Analytics', category: 'Analytics' }
];

// Get all users with their permission summary
exports.getAllUsersPermissions = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.user_id, u.username, u.system_role, u.status,
             e.name as employee_name, un.name as job_title
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN units un ON e.unit_id = un.unit_id
      WHERE u.status = 'active'
      ORDER BY u.username
    `);

    // Get permission counts for each user
    const usersWithPermissions = await Promise.all(
      users.map(async (user) => {
        const [permCount] = await pool.query(`
          SELECT COUNT(*) as permission_count
          FROM permissions 
          WHERE user_id = ? AND can_access = TRUE
        `, [user.user_id]);

        return {
          ...user,
          permission_count: permCount[0].permission_count
        };
      })
    );

    res.json(usersWithPermissions);
  } catch (err) {
    console.error('Error fetching users permissions:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get specific user permissions
exports.getUserPermissions = async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get user info
    const [userInfo] = await pool.query(`
      SELECT u.user_id, u.username, u.system_role, u.status,
             e.name as employee_name, un.name as job_title
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN units un ON e.unit_id = un.unit_id
      WHERE u.user_id = ?
    `, [userId]);

    if (userInfo.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's current permissions
    const [userPermissions] = await pool.query(`
      SELECT page_name, can_access 
      FROM permissions 
      WHERE user_id = ?
    `, [userId]);

    // Create a map of existing permissions
    const permissionMap = userPermissions.reduce((acc, perm) => {
      acc[perm.page_name] = perm.can_access;
      return acc;
    }, {});

    // Combine with available pages
    const permissions = availablePages.map(page => ({
      page_name: page.name,
      display_name: page.display,
      category: page.category,
      can_access: Boolean(permissionMap[page.name]) || false
    }));

    res.json({
      user: userInfo[0],
      permissions: permissions
    });
  } catch (err) {
    console.error('Error fetching user permissions:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update user permissions
exports.updateUserPermissions = async (req, res) => {
  const { userId } = req.params;
  const { permissions } = req.body; // Array of {page_name, can_access}

  try {
    await pool.query('START TRANSACTION');

    // Delete all existing permissions for this user
    await pool.query('DELETE FROM permissions WHERE user_id = ?', [userId]);

    // Insert new permissions (only for pages with can_access = TRUE)
    for (const perm of permissions) {
      if (perm.can_access) {
        await pool.query(`
          INSERT INTO permissions (user_id, page_name, can_access) 
          VALUES (?, ?, ?)
        `, [userId, perm.page_name, perm.can_access]);
      }
    }

    await pool.query('COMMIT');
    res.json({ message: 'User permissions updated successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error updating user permissions:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get current user's allowed pages (for frontend caching)
exports.getCurrentUserPermissions = async (req, res) => {
  const userId = req.user.user_id;
  
  try {
    const [permissions] = await pool.query(`
      SELECT page_name 
      FROM permissions 
      WHERE user_id = ? AND can_access = TRUE
    `, [userId]);

    const allowedPages = permissions.map(p => p.page_name);
    res.json({ allowed_pages: allowedPages });
  } catch (err) {
    console.error('Error fetching current user permissions:', err);
    res.status(500).json({ error: err.message });
  }
};

// Check if user has access to a specific page
exports.checkPageAccess = async (req, res) => {
  const { pageName } = req.params;
  const userId = req.user.user_id;

  try {
    const [result] = await pool.query(`
      SELECT can_access 
      FROM permissions 
      WHERE user_id = ? AND page_name = ? AND can_access = TRUE
    `, [userId, pageName]);

    const hasAccess = result.length > 0;
    res.json({ has_access: hasAccess });
  } catch (err) {
    console.error('Error checking page access:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get available pages list
exports.getAvailablePages = async (req, res) => {
  res.json(availablePages);
};

module.exports = {
  getAllUsersPermissions: exports.getAllUsersPermissions,
  getUserPermissions: exports.getUserPermissions,
  updateUserPermissions: exports.updateUserPermissions,
  getCurrentUserPermissions: exports.getCurrentUserPermissions,
  checkPageAccess: exports.checkPageAccess,
  getAvailablePages: exports.getAvailablePages
}; 