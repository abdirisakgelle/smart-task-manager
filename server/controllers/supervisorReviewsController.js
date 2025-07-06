const pool = require('../config/db');

// Create new supervisor review
exports.createSupervisorReview = async (req, res) => {
  const { ticket_id, supervisor_id, issue_status, resolved, notes } = req.body;
  if (!ticket_id || !supervisor_id) {
    return res.status(400).json({ error: 'ticket_id and supervisor_id are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO supervisor_reviews (ticket_id, supervisor_id, issue_status, resolved, notes) VALUES (?, ?, ?, ?, ?)',
      [ticket_id, supervisor_id, issue_status || null, resolved === undefined ? false : !!resolved, notes || null]
    );
    res.status(201).json({
      review_id: result.insertId,
      ticket_id,
      supervisor_id,
      review_date: new Date(),
      issue_status: issue_status || null,
      resolved: resolved === undefined ? false : !!resolved,
      notes: notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all supervisor reviews
exports.getAllSupervisorReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM supervisor_reviews ORDER BY review_date DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get supervisor review by ID
exports.getSupervisorReviewById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM supervisor_reviews WHERE review_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Supervisor review not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update supervisor review by ID
exports.updateSupervisorReview = async (req, res) => {
  const { ticket_id, supervisor_id, issue_status, resolved, notes } = req.body;
  if (!ticket_id || !supervisor_id) {
    return res.status(400).json({ error: 'ticket_id and supervisor_id are required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE supervisor_reviews SET ticket_id = ?, supervisor_id = ?, issue_status = ?, resolved = ?, notes = ? WHERE review_id = ?',
      [ticket_id, supervisor_id, issue_status || null, resolved === undefined ? false : !!resolved, notes || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Supervisor review not found.' });
    res.json({
      review_id: req.params.id,
      ticket_id,
      supervisor_id,
      issue_status: issue_status || null,
      resolved: resolved === undefined ? false : !!resolved,
      notes: notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete supervisor review by ID
exports.deleteSupervisorReview = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM supervisor_reviews WHERE review_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Supervisor review not found.' });
    res.json({ message: 'Supervisor review deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Filtered endpoints
exports.getSupervisorReviewsBySupervisor = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM supervisor_reviews WHERE supervisor_id = ? ORDER BY review_date DESC',
      [req.params.supervisor_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSupervisorReviewsByTicket = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM supervisor_reviews WHERE ticket_id = ? ORDER BY review_date DESC',
      [req.params.ticket_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSupervisorReviewsByIssueStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM supervisor_reviews WHERE issue_status = ? ORDER BY review_date DESC',
      [req.params.issue_status]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSupervisorReviewsByResolved = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM supervisor_reviews WHERE resolved = ? ORDER BY review_date DESC',
      [req.params.resolved === 'true']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 