import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken, isTokenExpired } from '../config/jwt.js';

// Helper to set refresh cookie with proper flags
const setRefreshCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: true, // required for SameSite=None
    sameSite: isProd ? 'Lax' : 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/users'
  };
  if (isProd && process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN; // e.g., .nasiye.com
  }
  res.cookie('refresh_token', token, cookieOptions);
};

// Create user with hashed password and employee linking
export const createUser = async (req, res) => {
  const { username, password, system_role, employee_id } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  // Validate system role (admin/ceo only)
  const validSystemRoles = ['admin', 'ceo'];
  if (system_role && !validSystemRoles.includes(system_role)) {
    return res.status(400).json({ 
      error: 'Invalid system role', 
      message: `system_role must be one of: ${validSystemRoles.join(', ')}` 
    });
  }
  
  try {
    // Check if username already exists
    const [existingUser] = await pool.query(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Check if employee_id is already linked to another user
    if (employee_id) {
      const [existingEmployee] = await pool.query(
        'SELECT user_id, username FROM users WHERE employee_id = ?',
        [employee_id]
      );
      
      if (existingEmployee.length > 0) {
        return res.status(400).json({ 
          error: 'Employee already has a user account',
          message: `Employee ID ${employee_id} is already linked to user: ${existingEmployee[0].username}`
        });
      }
      
      // Verify employee exists
      const [employee] = await pool.query(
        'SELECT employee_id, name FROM employees WHERE employee_id = ?',
        [employee_id]
      );
      
      if (employee.length === 0) {
        return res.status(400).json({ error: 'Employee not found' });
      }
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, system_role, employee_id, status) VALUES (?, ?, ?, ?, ?)',
      [username, passwordHash, system_role || null, employee_id || null, 'active']
    );
    
    // Get the created user with employee info
    const [newUser] = await pool.query(`
      SELECT u.user_id, u.username, u.system_role, u.status, u.employee_id, u.created_at,
             e.name as employee_name, e.shift,
             un.name AS job_title
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN units un ON e.unit_id = un.unit_id
      WHERE u.user_id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      message: 'User created successfully',
      user: newUser[0]
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all users with employee information (filtered by permissions)
export const getAllUsers = async (req, res) => {
  try {
    // Check user's data access level
    const userDataAccess = req.user.dataAccess;
    
    let query = `
      SELECT u.user_id, u.username, u.system_role, u.status, u.employee_id, u.created_at,
             e.name as employee_name, e.shift, un.name AS job_title
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN units un ON e.unit_id = un.unit_id
    `;
    
    let queryParams = [];
    
    // Filter data based on user's access level
    if (userDataAccess.level === 'admin') {
      // Admin sees all users
      query += ' ORDER BY u.username';
    } else if (userDataAccess.canManageUsers) {
      // Users with user management permission see all users
      query += ' ORDER BY u.username';
    } else if (userDataAccess.canViewTeamData) {
      // Managers and supervisors see team members
      query += ` WHERE u.employee_id IS NOT NULL ORDER BY u.username`;
    } else {
      // Regular users only see themselves
      query += ` WHERE u.user_id = ? ORDER BY u.username`;
      queryParams.push(req.user.user_id);
    }
    
    const [rows] = await pool.query(query, queryParams);
    
    // Remove password_hash from response
    const users = rows.map(user => ({
      user_id: user.user_id,
      username: user.username,
      system_role: user.system_role,
      status: user.status,
      employee_id: user.employee_id,
      employee_name: user.employee_name,
      job_title: user.job_title,
      shift: user.shift,
      created_at: user.created_at
    }));
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get users available for employee linking (users without employee_id)
export const getAvailableUsersForLinking = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT user_id, username, system_role, status, created_at
      FROM users
      WHERE employee_id IS NULL AND status = 'active'
      ORDER BY username
    `);
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching available users:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get employees available for user creation (employees without user accounts)
export const getAvailableEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.employee_id, e.name, un.name as job_title, e.shift,
             s.name as section_name, d.name as department_name
      FROM employees e
      LEFT JOIN units un ON e.unit_id = un.unit_id
      LEFT JOIN sections s ON un.section_id = s.section_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      LEFT JOIN users u ON e.employee_id = u.employee_id
      WHERE u.employee_id IS NULL
      ORDER BY e.name
    `);
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching available employees:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID with employee information
export const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.user_id, u.username, u.system_role, u.status, u.employee_id, u.created_at,
             e.name as employee_name, e.shift, un.name AS job_title
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN units un ON e.unit_id = un.unit_id
      WHERE u.user_id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password_hash from response
    const user = {
      user_id: rows[0].user_id,
      username: rows[0].username,
      system_role: rows[0].system_role,
      status: rows[0].status,
      employee_id: rows[0].employee_id,
      employee_name: rows[0].employee_name,
      job_title: rows[0].job_title,
      shift: rows[0].shift,
      created_at: rows[0].created_at
    };
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  const { system_role } = req.body;
  const userId = req.params.user_id;
  
  if (system_role === undefined) {
    return res.status(400).json({ error: 'system_role is required' });
  }
  
  // Validate role
  const validSystemRoles = ['admin', 'ceo'];
  if (system_role !== null && !validSystemRoles.includes(system_role)) {
    return res.status(400).json({ 
      error: 'Invalid system_role', 
      message: `system_role must be one of: ${validSystemRoles.join(', ')} or null` 
    });
  }
  
  try {
    // Check if user exists
    const [existingUser] = await pool.query(
      'SELECT user_id, username FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user role
    const [result] = await pool.query(
      'UPDATE users SET system_role = ? WHERE user_id = ?',
      [system_role, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get updated user info
    const [updatedUser] = await pool.query(`
      SELECT u.user_id, u.username, u.system_role, u.status, u.employee_id, u.created_at,
             e.name as employee_name, e.shift, un.name AS job_title
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN units un ON e.unit_id = un.unit_id
      WHERE u.user_id = ?
    `, [userId]);
    
    res.json({
      message: 'User role updated successfully',
      user: updatedUser[0]
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res) => {
  const { status } = req.body;
  const userId = req.params.user_id;
  
  if (!status || !['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "active" or "inactive"' });
  }
  
  try {
    // Check if user exists
    const [existingUser] = await pool.query(
      'SELECT user_id, username FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user status
    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE user_id = ?',
      [status, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      user_id: userId,
      status: status
    });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Reset user password
export const resetUserPassword = async (req, res) => {
  const { new_password } = req.body;
  const userId = req.params.user_id;
  
  if (!new_password) {
    return res.status(400).json({ error: 'New password is required' });
  }
  
  try {
    // Check if user exists
    const [existingUser] = await pool.query(
      'SELECT user_id, username FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(new_password, saltRounds);
    
    // Update password
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [passwordHash, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Password reset successfully',
      user_id: userId
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update user (general update)
export const updateUser = async (req, res) => {
  const { employee_id, username, system_role, status } = req.body;
  const userId = req.params.id;
  
  try {
    // Check if user exists
    const [existingUser] = await pool.query(
      'SELECT user_id, username FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Build update query
    let query = 'UPDATE users SET ';
    let params = [];
    let updates = [];
    
    if (username !== undefined) {
      updates.push('username = ?');
      params.push(username);
    }
    
    if (system_role !== undefined) {
      updates.push('system_role = ?');
      params.push(system_role);
    }
    
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (employee_id !== undefined) {
      updates.push('employee_id = ?');
      params.push(employee_id);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    query += updates.join(', ') + ' WHERE user_id = ?';
    params.push(userId);
    
    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get updated user info
    const [updatedUser] = await pool.query(`
      SELECT u.user_id, u.username, u.system_role, u.status, u.employee_id, u.created_at,
             e.name as employee_name, e.shift, un.name AS job_title
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN units un ON e.unit_id = un.unit_id
      WHERE u.user_id = ?
    `, [userId]);
    
    res.json({
      message: 'User updated successfully',
      user: updatedUser[0]
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Check if user exists
    const [existingUser] = await pool.query(
      'SELECT user_id, username FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user
    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'User deleted successfully',
      deleted_user_id: userId
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  }
};

// Login user with bcrypt password verification
export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    // Join with employees table to get employee information
    const [rows] = await pool.query(
      `SELECT u.*, e.name as employee_name, e.shift, un.name AS job_title, d.name as department 
       FROM users u 
       LEFT JOIN employees e ON u.employee_id = e.employee_id 
       LEFT JOIN units un ON e.unit_id = un.unit_id
       LEFT JOIN sections s ON un.section_id = s.section_id
       LEFT JOIN departments d ON s.department_id = d.department_id
       WHERE u.username = ? AND u.status = 'active'`,
      [username]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = rows[0];
    
    // Check if password matches using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate tokens
    const tokenType = user.role === 'admin' ? 'admin' : 'access';
    const accessToken = generateToken(
      { 
        user_id: user.user_id, 
        username: user.username,
        system_role: user.role,
        employee_id: user.employee_id
      },
      tokenType
    );
    const refreshToken = generateToken(
      { 
        user_id: user.user_id, 
        username: user.username,
        system_role: user.role,
        employee_id: user.employee_id
      },
      'refresh'
    );

    // Set refresh cookie
    setRefreshCookie(res, refreshToken);
    
    res.json({
      token: accessToken,
      user: {
        user_id: user.user_id,
        username: user.username,
        system_role: user.role,
        employee_id: user.employee_id,
        name: user.employee_name,
        job_title: user.job_title,
        shift: user.shift,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Refresh JWT token
export const refreshToken = async (req, res) => {
  try {
    // Prefer httpOnly cookie; fall back to body for backward compat
    const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token missing' });
    }
    
    // Verify the refresh token
    const decoded = verifyToken(refreshToken);
    
    // Check if it's actually a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Get user data
    const [rows] = await pool.query(
      `SELECT u.*, e.name as employee_name, e.shift, un.name AS job_title, d.name as department 
       FROM users u 
       LEFT JOIN employees e ON u.employee_id = e.employee_id 
       LEFT JOIN units un ON e.unit_id = un.unit_id
       LEFT JOIN sections s ON un.section_id = s.section_id
       LEFT JOIN departments d ON s.department_id = d.department_id
       WHERE u.user_id = ? AND u.status = 'active'`,
      [decoded.user_id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = rows[0];
    
    // Generate new access token
    const tokenType = user.system_role === 'admin' ? 'admin' : 'access';
    const newAccessToken = generateToken(
      { 
        user_id: user.user_id, 
        username: user.username,
        system_role: user.system_role,
        employee_id: user.employee_id
      },
      tokenType
    );
    
    // Rotate refresh token
    const newRefreshToken = generateToken(
      { 
        user_id: user.user_id, 
        username: user.username,
        system_role: user.system_role,
        employee_id: user.employee_id
      },
      'refresh'
    );

    setRefreshCookie(res, newRefreshToken);
    
    res.json({
      accessToken: newAccessToken,
      user: {
        user_id: user.user_id,
        username: user.username,
        system_role: user.system_role,
        employee_id: user.employee_id,
        name: user.employee_name,
        job_title: user.job_title,
        shift: user.shift,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.employee_id, u.username, u.system_role, u.status, u.created_at,
              e.name as employee_name, e.shift, un.name AS job_title, d.name as department 
       FROM users u 
       LEFT JOIN employees e ON u.employee_id = e.employee_id 
       LEFT JOIN units un ON e.unit_id = un.unit_id
       LEFT JOIN sections s ON un.section_id = s.section_id
       LEFT JOIN departments d ON s.department_id = d.department_id
       WHERE u.user_id = ? AND u.status = 'active'`,
      [req.user.user_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    // Return the same structure as login response
    res.json({
      user_id: rows[0].user_id,
      username: rows[0].username,
      system_role: rows[0].system_role,
      status: rows[0].status,
      employee_id: rows[0].employee_id,
      name: rows[0].employee_name,
      job_title: rows[0].job_title,
      shift: rows[0].shift,
      department: rows[0].department
    });
  } catch (err) {
    console.error('Error getting current user:', err);
    res.status(500).json({ error: err.message });
  }
};


// Public: Get demo credentials grouped by role (reads from DB; no passwords stored)
export const getDemoCredentials = async (req, res) => {
  try {
    // Keep demo buckets but align to system_role where applicable
    const roles = ['admin', 'media', 'agent'];
    const result = {};

    // Known demo passwords we seed via scripts/reset-passwords.js
    const knownDemoPasswords = {
      admin: 'admin123',
      gelle: 'gelle123',
      adna: 'adna123',
      harun: 'harun123',
      agent: 'agent123'
    };

    // Detect if users.system_role exists
    let hasSystemRole = false;
    try {
      const [colRows] = await pool.query(`
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'system_role' LIMIT 1
      `);
      hasSystemRole = colRows.length > 0;
    } catch (_) {
      hasSystemRole = false;
    }

    for (const role of roles) {
      if (role === 'admin') {
        let rows;
        if (hasSystemRole) {
          [rows] = await pool.query(
            `SELECT username FROM users WHERE system_role = 'admin' AND status = 'active' ORDER BY username LIMIT 5`
          );
        } else {
          // Fallback for pre-migration databases
          [rows] = await pool.query(
            `SELECT username FROM users WHERE (role = 'admin' OR username IN ('admin')) AND status = 'active' ORDER BY username LIMIT 5`
          );
        }
        result[role] = rows.map(r => ({
          username: r.username,
          role: 'admin',
          demoPassword: knownDemoPasswords[r.username] || knownDemoPasswords.admin || undefined
        }));
      } else {
        // For non-system roles, just list active users (demo convenience)
        const [rows] = await pool.query(
          `SELECT username FROM users WHERE status = 'active' ORDER BY username LIMIT 5`
        );
        result[role] = rows.map(r => ({
          username: r.username,
          role,
          demoPassword: knownDemoPasswords[r.username] || (role === 'agent' && knownDemoPasswords.agent) || undefined
        }));
      }
    }

    res.json({ roles: result });
  } catch (err) {
    console.error('Error fetching demo credentials:', err);
    res.status(500).json({ error: 'Failed to load demo credentials' });
  }
};

