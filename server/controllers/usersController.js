const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create user with hashed password
exports.createUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    // For now, store password as plain text (as requested)
    // In production, you should hash passwords
    const passwordToStore = password; // No hashing for now
    
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, passwordToStore, role || 'user']
    );
    res.status(201).json({
      user_id: result.insertId,
      username,
      role: role || 'user'
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Read all users (do not return password_hash)
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, employee_id, username, role, created_at FROM users'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one user by user_id (do not return password_hash)
exports.getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, employee_id, username, role, created_at FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user (by user_id)
exports.updateUser = async (req, res) => {
  const { employee_id, username, password, role } = req.body;
  try {
    let query = 'UPDATE users SET employee_id = ?, username = ?, role = ?';
    let params = [employee_id || null, username, role || 'user'];

    // Only update password if it's provided
    if (password) {
      query += ', password_hash = ?';
      params.push(password); // Store as plain text for now
    }

    query += ' WHERE user_id = ?';
    params.push(req.params.id);

    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      user_id: req.params.id,
      employee_id: employee_id || null,
      username,
      role: role || 'user'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user (by user_id)
exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user with plain text password check and JWT
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    // Join with employees table to get employee information
    const [rows] = await pool.query(
      `SELECT u.*, e.name as employee_name, e.department 
       FROM users u 
       LEFT JOIN employees e ON u.employee_id = e.employee_id 
       WHERE u.username = ?`,
      [username]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = rows[0];
    
    // Check if password matches (plain text comparison for now)
    const isPasswordValid = password === user.password_hash;
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        username: user.username,
        role: user.role,
        employee_id: user.employee_id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        employee_id: user.employee_id,
        name: user.employee_name,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.employee_id, u.username, u.role, u.created_at,
              e.name as employee_name, e.department 
       FROM users u 
       LEFT JOIN employees e ON u.employee_id = e.employee_id 
       WHERE u.user_id = ?`,
      [req.user.user_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


