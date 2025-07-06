const pool = require('../config/db');

// Create a new employee
exports.createEmployee = async (req, res) => {
  const { name, shift, department, phone } = req.body;
  if (!name || !shift) {
    return res.status(400).json({ error: 'Name and shift are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO employees (name, shift, department, phone) VALUES (?, ?, ?, ?)',
      [name, shift, department || null, phone || null]
    );
    res.status(201).json({
      employee_id: result.insertId,
      name,
      shift,
      department: department || null,
      phone: phone || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT employee_id, name, shift, department, phone FROM employees ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT employee_id, name, shift, department, phone FROM employees WHERE employee_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update employee by ID
exports.updateEmployee = async (req, res) => {
  const { name, shift, department, phone } = req.body;
  if (!name || !shift) {
    return res.status(400).json({ error: 'Name and shift are required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE employees SET name = ?, shift = ?, department = ?, phone = ? WHERE employee_id = ?',
      [name, shift, department || null, phone || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json({
      employee_id: req.params.id,
      name,
      shift,
      department: department || null,
      phone: phone || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete employee by ID
exports.deleteEmployee = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM employees WHERE employee_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ message: 'Employee deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get employees by department
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT employee_id, name, shift, department, phone FROM employees WHERE department = ? ORDER BY name',
      [req.params.department]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get employees by shift
exports.getEmployeesByShift = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT employee_id, name, shift, department, phone FROM employees WHERE shift = ? ORDER BY name',
      [req.params.shift]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 