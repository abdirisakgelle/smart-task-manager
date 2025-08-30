import pool from '../config/db.js';

// Get all units with section and department info
export const getAllUnits = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.unit_id, u.name, u.section_id, s.name as section_name, s.department_id, d.name as department_name
      FROM units u
      LEFT JOIN sections s ON u.section_id = s.section_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      ORDER BY d.name, s.name, u.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get units by section
export const getUnitsBySection = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT unit_id, name, section_id FROM units WHERE section_id = ? ORDER BY name',
      [req.params.section_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get unit by ID
export const getUnitById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.unit_id, u.name, u.section_id, s.name as section_name, s.department_id, d.name as department_name
      FROM units u
      LEFT JOIN sections s ON u.section_id = s.section_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      WHERE u.unit_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Unit not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new unit
export const createUnit = async (req, res) => {
  const { name, section_id } = req.body;
  if (!name || !section_id) {
    return res.status(400).json({ error: 'Unit name and section_id are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO units (name, section_id) VALUES (?, ?)',
      [name, section_id]
    );
    res.status(201).json({
      unit_id: result.insertId,
      name,
      section_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update unit by ID
export const updateUnit = async (req, res) => {
  const { name, section_id } = req.body;
  if (!name || !section_id) {
    return res.status(400).json({ error: 'Unit name and section_id are required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE units SET name = ?, section_id = ? WHERE unit_id = ?',
      [name, section_id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Unit not found.' });
    res.json({
      unit_id: req.params.id,
      name,
      section_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete unit by ID
export const deleteUnit = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM units WHERE unit_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Unit not found.' });
    res.json({ message: 'Unit deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 