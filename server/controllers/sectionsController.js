import pool from '../config/db.js';

// Get all sections with department info
export const getAllSections = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.section_id, s.name, s.department_id, d.name as department_name
      FROM sections s
      LEFT JOIN departments d ON s.department_id = d.department_id
      ORDER BY d.name, s.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get sections by department
export const getSectionsByDepartment = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT section_id, name, department_id FROM sections WHERE department_id = ? ORDER BY name',
      [req.params.department_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get section by ID
export const getSectionById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.section_id, s.name, s.department_id, d.name as department_name
      FROM sections s
      LEFT JOIN departments d ON s.department_id = d.department_id
      WHERE s.section_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Section not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new section
export const createSection = async (req, res) => {
  const { name, department_id } = req.body;
  if (!name || !department_id) {
    return res.status(400).json({ error: 'Section name and department_id are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO sections (name, department_id) VALUES (?, ?)',
      [name, department_id]
    );
    res.status(201).json({
      section_id: result.insertId,
      name,
      department_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update section by ID
export const updateSection = async (req, res) => {
  const { name, department_id } = req.body;
  if (!name || !department_id) {
    return res.status(400).json({ error: 'Section name and department_id are required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE sections SET name = ?, department_id = ? WHERE section_id = ?',
      [name, department_id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Section not found.' });
    res.json({
      section_id: req.params.id,
      name,
      department_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete section by ID
export const deleteSection = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM sections WHERE section_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Section not found.' });
    res.json({ message: 'Section deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 