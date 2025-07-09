const pool = require('../config/db');

// Auto-insert tickets into supervisor reviews (runs automatically)
const autoInsertTicketsToReviews = async () => {
  try {
    // Get tickets from last 3 days that are not done and not already in supervisor_reviews
    const [tickets] = await pool.query(`
      SELECT t.ticket_id 
      FROM tickets t 
      LEFT JOIN supervisor_reviews sr ON t.ticket_id = sr.ticket_id 
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)
        AND t.resolution_status != 'done' 
        AND t.resolution_status != 'Done'
        AND sr.review_id IS NULL
    `);

    if (tickets.length > 0) {
      // Insert these tickets into supervisor_reviews with default supervisor_id = 1
      const values = tickets.map(ticket => [ticket.ticket_id, 1, null, false, null]);
      await pool.query(
        'INSERT INTO supervisor_reviews (ticket_id, supervisor_id, issue_status, resolved, notes) VALUES ?',
        [values]
      );
      console.log(`Auto-inserted ${tickets.length} tickets into supervisor reviews`);
    }
  } catch (err) {
    console.error('Error in auto-insert tickets to reviews:', err);
  }
};

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

// Get all supervisor reviews with joined ticket data and auto-insertion
exports.getAllSupervisorReviews = async (req, res) => {
  try {
    // First, run auto-insertion to ensure all eligible tickets are in the review table
    await autoInsertTicketsToReviews();
    
    // Get supervisor reviews with joined ticket and agent name, filtered for last 3 days and not done
    const [rows] = await pool.query(`
      SELECT 
        sr.review_id,
        sr.ticket_id,
        sr.supervisor_id,
        sr.review_date,
        sr.issue_status,
        sr.notes,
        t.customer_phone,
        t.communication_channel,
        t.device_type,
        t.issue_type,
        t.issue_description,
        t.agent_id,
        e.name AS agent_name,
        t.first_call_resolution,
        t.resolution_status,
        t.end_time,
        t.created_at as ticket_created_at
      FROM supervisor_reviews sr
      INNER JOIN tickets t ON sr.ticket_id = t.ticket_id
      LEFT JOIN employees e ON t.agent_id = e.employee_id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)
        AND t.resolution_status != 'done' 
        AND t.resolution_status != 'Done'
      ORDER BY t.created_at DESC
    `);
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