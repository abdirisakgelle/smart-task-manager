const pool = require('../config/db');

// Create new follow-up
exports.createFollowUp = async (req, res) => {
  const { ticket_id, follow_up_agent_id, follow_up_date, customer_location, feedback_rating, satisfied, repeated_issue, resolved_after_follow_up, resolution_status, follow_up_notes } = req.body;
  if (!ticket_id || !follow_up_agent_id || !follow_up_date) {
    return res.status(400).json({ error: 'ticket_id, follow_up_agent_id, and follow_up_date are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO follow_ups (ticket_id, follow_up_agent_id, follow_up_date, customer_location, feedback_rating, satisfied, repeated_issue, resolved_after_follow_up, resolution_status, follow_up_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ticket_id, follow_up_agent_id, follow_up_date, customer_location || null, feedback_rating || null, satisfied === undefined ? null : !!satisfied, repeated_issue === undefined ? null : !!repeated_issue, resolved_after_follow_up === undefined ? null : !!resolved_after_follow_up, resolution_status || null, follow_up_notes || null]
    );
    res.status(201).json({
      follow_up_id: result.insertId,
      ticket_id,
      follow_up_agent_id,
      follow_up_date,
      customer_location: customer_location || null,
      feedback_rating: feedback_rating || null,
      satisfied: satisfied === undefined ? null : !!satisfied,
      repeated_issue: repeated_issue === undefined ? null : !!repeated_issue,
      resolved_after_follow_up: resolved_after_follow_up === undefined ? null : !!resolved_after_follow_up,
      resolution_status: resolution_status || null,
      follow_up_notes: follow_up_notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all follow-ups
exports.getAllFollowUps = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM follow_ups ORDER BY follow_up_date DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get follow-up by ID
exports.getFollowUpById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM follow_ups WHERE follow_up_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Follow-up not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update follow-up by ID
exports.updateFollowUp = async (req, res) => {
  const { ticket_id, follow_up_agent_id, follow_up_date, customer_location, feedback_rating, satisfied, repeated_issue, resolved_after_follow_up, resolution_status, follow_up_notes } = req.body;
  if (!ticket_id || !follow_up_agent_id || !follow_up_date) {
    return res.status(400).json({ error: 'ticket_id, follow_up_agent_id, and follow_up_date are required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE follow_ups SET ticket_id = ?, follow_up_agent_id = ?, follow_up_date = ?, customer_location = ?, feedback_rating = ?, satisfied = ?, repeated_issue = ?, resolved_after_follow_up = ?, resolution_status = ?, follow_up_notes = ? WHERE follow_up_id = ?',
      [ticket_id, follow_up_agent_id, follow_up_date, customer_location || null, feedback_rating || null, satisfied === undefined ? null : !!satisfied, repeated_issue === undefined ? null : !!repeated_issue, resolved_after_follow_up === undefined ? null : !!resolved_after_follow_up, resolution_status || null, follow_up_notes || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Follow-up not found.' });
    res.json({
      follow_up_id: req.params.id,
      ticket_id,
      follow_up_agent_id,
      follow_up_date,
      customer_location: customer_location || null,
      feedback_rating: feedback_rating || null,
      satisfied: satisfied === undefined ? null : !!satisfied,
      repeated_issue: repeated_issue === undefined ? null : !!repeated_issue,
      resolved_after_follow_up: resolved_after_follow_up === undefined ? null : !!resolved_after_follow_up,
      resolution_status: resolution_status || null,
      follow_up_notes: follow_up_notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete follow-up by ID
exports.deleteFollowUp = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM follow_ups WHERE follow_up_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Follow-up not found.' });
    res.json({ message: 'Follow-up deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Filtered endpoints
exports.getFollowUpsByAgent = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM follow_ups WHERE follow_up_agent_id = ? ORDER BY follow_up_date DESC',
      [req.params.follow_up_agent_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFollowUpsByTicket = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM follow_ups WHERE ticket_id = ? ORDER BY follow_up_date DESC',
      [req.params.ticket_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFollowUpsByResolutionStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM follow_ups WHERE resolution_status = ? ORDER BY follow_up_date DESC',
      [req.params.resolution_status]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFollowUpsBySatisfied = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM follow_ups WHERE satisfied = ? ORDER BY follow_up_date DESC',
      [req.params.satisfied === 'true']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFollowUpsByRepeatedIssue = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM follow_ups WHERE repeated_issue = ? ORDER BY follow_up_date DESC',
      [req.params.repeated_issue === 'true']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFollowUpsByResolvedAfterFollowUp = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM follow_ups WHERE resolved_after_follow_up = ? ORDER BY follow_up_date DESC',
      [req.params.resolved_after_follow_up === 'true']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 