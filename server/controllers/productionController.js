import pool from '../config/db.js';

// Create new production record
export const createProduction = async (req, res) => {
  const { content_id, editor_id, production_status, completion_date, sent_to_social_team, notes } = req.body;
  if (!content_id || !editor_id || !production_status) {
    return res.status(400).json({ error: 'content_id, editor_id, and production_status are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO production (content_id, editor_id, production_status, completion_date, sent_to_social_team, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [content_id, editor_id, production_status, completion_date || null, sent_to_social_team === undefined ? false : !!sent_to_social_team, notes || null]
    );
    res.status(201).json({
      production_id: result.insertId,
      content_id,
      editor_id,
      production_status,
      completion_date: completion_date || null,
      sent_to_social_team: sent_to_social_team === undefined ? false : !!sent_to_social_team,
      notes: notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all production records
export const getAllProduction = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        c.title as content_title,
        c.script_status as content_script_status,
        c.content_status as content_status,
        e.name as editor_name
      FROM production p
      LEFT JOIN content c ON p.content_id = c.content_id
      LEFT JOIN employees e ON p.editor_id = e.employee_id
      ORDER BY p.production_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get production by ID
export const getProductionById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM production WHERE production_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Production not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update production by ID
export const updateProduction = async (req, res) => {
  const { content_id, editor_id, production_status, completion_date, sent_to_social_team, notes } = req.body;
  if (!content_id || !editor_id || !production_status) {
    return res.status(400).json({ error: 'content_id, editor_id, and production_status are required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE production SET content_id = ?, editor_id = ?, production_status = ?, completion_date = ?, sent_to_social_team = ?, notes = ? WHERE production_id = ?',
      [content_id, editor_id, production_status, completion_date || null, sent_to_social_team === undefined ? false : !!sent_to_social_team, notes || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Production not found.' });
    res.json({
      production_id: req.params.id,
      content_id,
      editor_id,
      production_status,
      completion_date: completion_date || null,
      sent_to_social_team: sent_to_social_team === undefined ? false : !!sent_to_social_team,
      notes: notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete production by ID
export const deleteProduction = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM production WHERE production_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Production not found.' });
    res.json({ message: 'Production deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Filtered endpoints
export const getProductionByStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM production WHERE production_status = ? ORDER BY production_id DESC',
      [req.params.production_status]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductionByEditor = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM production WHERE editor_id = ? ORDER BY production_id DESC',
      [req.params.editor_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductionByContent = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM production WHERE content_id = ? ORDER BY production_id DESC',
      [req.params.content_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductionBySentToSocial = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM production WHERE sent_to_social_team = ? ORDER BY production_id DESC',
      [req.params.sent_to_social_team === 'true']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 