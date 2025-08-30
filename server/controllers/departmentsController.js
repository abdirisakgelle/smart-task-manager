import pool from '../config/db.js';

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT department_id, name FROM departments ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT department_id, name FROM departments WHERE department_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Department not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new department
export const createDepartment = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Department name is required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO departments (name) VALUES (?)',
      [name]
    );
    res.status(201).json({
      department_id: result.insertId,
      name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update department by ID
export const updateDepartment = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Department name is required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE departments SET name = ? WHERE department_id = ?',
      [name, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Department not found.' });
    res.json({
      department_id: req.params.id,
      name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete department by ID
export const deleteDepartment = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM departments WHERE department_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Department not found.' });
    res.json({ message: 'Department deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 