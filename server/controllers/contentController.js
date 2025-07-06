const pool = require('../config/db');

// Create new content
exports.createContent = async (req, res) => {
  const { idea_id, title, script_status, director_id, filming_date, notes } = req.body;
  if (!idea_id || !title || !script_status || !director_id) {
    return res.status(400).json({ error: 'idea_id, title, script_status, and director_id are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO content (idea_id, title, script_status, director_id, filming_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [idea_id, title, script_status, director_id, filming_date || null, notes || null]
    );
    res.status(201).json({
      content_id: result.insertId,
      idea_id,
      title,
      script_status,
      director_id,
      filming_date: filming_date || null,
      notes: notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all content
exports.getAllContent = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM content ORDER BY content_id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get content by ID
exports.getContentById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM content WHERE content_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Content not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update content by ID
exports.updateContent = async (req, res) => {
  const { idea_id, title, script_status, director_id, filming_date, notes } = req.body;
  if (!idea_id || !title || !script_status || !director_id) {
    return res.status(400).json({ error: 'idea_id, title, script_status, and director_id are required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE content SET idea_id = ?, title = ?, script_status = ?, director_id = ?, filming_date = ?, notes = ? WHERE content_id = ?',
      [idea_id, title, script_status, director_id, filming_date || null, notes || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Content not found.' });
    res.json({
      content_id: req.params.id,
      idea_id,
      title,
      script_status,
      director_id,
      filming_date: filming_date || null,
      notes: notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete content by ID
exports.deleteContent = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM content WHERE content_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Content not found.' });
    res.json({ message: 'Content deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Filtered endpoints
exports.getContentByScriptStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM content WHERE script_status = ? ORDER BY content_id DESC',
      [req.params.script_status]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getContentByDirector = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM content WHERE director_id = ? ORDER BY content_id DESC',
      [req.params.director_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getContentByIdea = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM content WHERE idea_id = ? ORDER BY content_id DESC',
      [req.params.idea_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 