const pool = require('../config/db');

// Create assignment
exports.createAssignment = async (req, res) => {
  const { employee_id, task_type, task_id, role_in_task } = req.body;
  if (!employee_id || !task_type || !task_id || !role_in_task) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO employee_assignments (employee_id, task_type, task_id, role_in_task) VALUES (?, ?, ?, ?)',
      [employee_id, task_type, task_id, role_in_task]
    );
    res.status(201).json({
      assignment_id: result.insertId,
      employee_id,
      task_type,
      task_id,
      role_in_task
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT assignment_id, employee_id, task_type, task_id, role_in_task FROM employee_assignments'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT assignment_id, employee_id, task_type, task_id, role_in_task FROM employee_assignments WHERE assignment_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  const { employee_id, task_type, task_id, role_in_task } = req.body;
  if (!employee_id || !task_type || !task_id || !role_in_task) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE employee_assignments SET employee_id = ?, task_type = ?, task_id = ?, role_in_task = ? WHERE assignment_id = ?',
      [employee_id, task_type, task_id, role_in_task, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Assignment not found' });
    res.json({
      assignment_id: req.params.id,
      employee_id,
      task_type,
      task_id,
      role_in_task
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM employee_assignments WHERE assignment_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all assignments for a specific employee
exports.getAssignmentsByEmployee = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT assignment_id, employee_id, task_type, task_id, role_in_task FROM employee_assignments WHERE employee_id = ?',
      [req.params.employee_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 