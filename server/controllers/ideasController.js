const pool = require('../config/db');

// Create a new idea
exports.createIdea = async (req, res) => {
  const { submission_date, title, contributor_id, script_writer_id, status, script_deadline, priority, notes } = req.body;
  if (!submission_date || !title || !contributor_id || !script_writer_id || !status) {
    return res.status(400).json({ error: 'submission_date, title, contributor_id, script_writer_id, and status are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO ideas (submission_date, title, contributor_id, script_writer_id, status, script_deadline, priority, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [submission_date, title, contributor_id, script_writer_id, status, script_deadline || null, priority || null, notes || null]
    );
    res.status(201).json({
      idea_id: result.insertId,
      submission_date,
      title,
      contributor_id,
      script_writer_id,
      status,
      script_deadline: script_deadline || null,
      priority: priority || null,
      notes: notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all ideas
exports.getAllIdeas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ideas ORDER BY submission_date DESC, idea_id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get idea by ID
exports.getIdeaById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ideas WHERE idea_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Idea not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update idea by ID
exports.updateIdea = async (req, res) => {
  const { submission_date, title, contributor_id, script_writer_id, status, script_deadline, priority, notes } = req.body;
  if (!submission_date || !title || !contributor_id || !script_writer_id || !status) {
    return res.status(400).json({ error: 'submission_date, title, contributor_id, script_writer_id, and status are required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE ideas SET submission_date = ?, title = ?, contributor_id = ?, script_writer_id = ?, status = ?, script_deadline = ?, priority = ?, notes = ? WHERE idea_id = ?',
      [submission_date, title, contributor_id, script_writer_id, status, script_deadline || null, priority || null, notes || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Idea not found.' });
    res.json({
      idea_id: req.params.id,
      submission_date,
      title,
      contributor_id,
      script_writer_id,
      status,
      script_deadline: script_deadline || null,
      priority: priority || null,
      notes: notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete idea by ID
exports.deleteIdea = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM ideas WHERE idea_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Idea not found.' });
    res.json({ message: 'Idea deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Filtered endpoints
exports.getIdeasByStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ideas WHERE status = ? ORDER BY submission_date DESC, idea_id DESC',
      [req.params.status]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIdeasByContributor = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ideas WHERE contributor_id = ? ORDER BY submission_date DESC, idea_id DESC',
      [req.params.contributor_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIdeasByScriptWriter = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ideas WHERE script_writer_id = ? ORDER BY submission_date DESC, idea_id DESC',
      [req.params.script_writer_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIdeasByPriority = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ideas WHERE priority = ? ORDER BY submission_date DESC, idea_id DESC',
      [req.params.priority]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 