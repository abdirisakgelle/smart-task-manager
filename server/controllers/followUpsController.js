import pool from '../config/db.js';

// Create new follow-up
export const createFollowUp = async (req, res) => {
  const { ticket_id, follow_up_agent_id, follow_up_date, issue_solved, customer_location, satisfied, repeated_issue, follow_up_notes } = req.body;
  if (!ticket_id || !follow_up_agent_id || !follow_up_date || issue_solved === undefined) {
    return res.status(400).json({ error: 'ticket_id, follow_up_agent_id, follow_up_date, and issue_solved are required.' });
  }
  
  try {
    // Start a transaction to ensure data consistency
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 1. Insert the follow-up data
      const [result] = await connection.query(
        'INSERT INTO follow_ups (ticket_id, follow_up_agent_id, follow_up_date, issue_solved, customer_location, satisfied, repeated_issue, follow_up_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [ticket_id, follow_up_agent_id, follow_up_date, !!issue_solved, customer_location || null, satisfied === undefined ? null : !!satisfied, repeated_issue === undefined ? null : !!repeated_issue, follow_up_notes || null]
      );
      
      // 2. If issue was not solved, reopen the ticket and clear end_time
      if (issue_solved === false) {
        await connection.query(
          'UPDATE tickets SET resolution_status = ?, end_time = NULL WHERE ticket_id = ?',
          ['Reopened', ticket_id]
        );
      }
      
      await connection.commit();
      
      res.status(201).json({
        follow_up_id: result.insertId,
        ticket_id,
        follow_up_agent_id,
        follow_up_date,
        issue_solved: !!issue_solved,
        customer_location: customer_location || null,
        satisfied: satisfied === undefined ? null : !!satisfied,
        repeated_issue: repeated_issue === undefined ? null : !!repeated_issue,
        follow_up_notes: follow_up_notes || null,
        ticket_reopened: issue_solved === false
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all follow-ups
export const getAllFollowUps = async (req, res) => {
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
export const getFollowUpById = async (req, res) => {
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
export const updateFollowUp = async (req, res) => {
  const { ticket_id, follow_up_agent_id, follow_up_date, issue_solved, customer_location, feedback_rating, satisfied, repeated_issue, resolved_after_follow_up, resolution_status, follow_up_notes } = req.body;
  if (!ticket_id || !follow_up_agent_id || !follow_up_date || issue_solved === undefined) {
    return res.status(400).json({ error: 'ticket_id, follow_up_agent_id, follow_up_date, and issue_solved are required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE follow_ups SET ticket_id = ?, follow_up_agent_id = ?, follow_up_date = ?, issue_solved = ?, customer_location = ?, feedback_rating = ?, satisfied = ?, repeated_issue = ?, resolved_after_follow_up = ?, resolution_status = ?, follow_up_notes = ? WHERE follow_up_id = ?',
      [ticket_id, follow_up_agent_id, follow_up_date, !!issue_solved, customer_location || null, feedback_rating || null, satisfied === undefined ? null : !!satisfied, repeated_issue === undefined ? null : !!repeated_issue, resolved_after_follow_up === undefined ? null : !!resolved_after_follow_up, resolution_status || null, follow_up_notes || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Follow-up not found.' });
    res.json({
      follow_up_id: req.params.id,
      ticket_id,
      follow_up_agent_id,
      follow_up_date,
      issue_solved: !!issue_solved,
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
export const deleteFollowUp = async (req, res) => {
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
export const getFollowUpsByAgent = async (req, res) => {
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

export const getFollowUpsByTicket = async (req, res) => {
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

export const getFollowUpsByResolutionStatus = async (req, res) => {
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

export const getFollowUpsBySatisfied = async (req, res) => {
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

export const getFollowUpsByRepeatedIssue = async (req, res) => {
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

export const getFollowUpsByResolvedAfterFollowUp = async (req, res) => {
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

// Get eligible tickets for follow-up (last 7 days, not in follow_ups, with optional supervisor review)
export const getEligibleFollowUps = async (req, res) => {
  try {
    // Optional: support for custom date range via query params
    const days = req.query.days ? parseInt(req.query.days, 10) : 7;
    
    // Use a more efficient query with EXISTS and proper indexing
    const [rows] = await pool.query(`
      SELECT 
        t.ticket_id,
        t.customer_phone,
        t.issue_type,
        t.resolution_status,
        t.created_at,
        sr.review_id,
        sr.review_date,
        sr.issue_status AS supervisor_status
      FROM tickets t
      LEFT JOIN supervisor_reviews sr ON t.ticket_id = sr.ticket_id 
        AND sr.review_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      WHERE (
        t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        OR sr.review_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      )
      AND NOT EXISTS (
        SELECT 1 
        FROM follow_ups f 
        WHERE f.ticket_id = t.ticket_id
      )
      ORDER BY 
        CASE 
          WHEN sr.review_date IS NOT NULL THEN sr.review_date
          ELSE t.created_at 
        END DESC
      LIMIT 100
    `, [days, days, days]);

    res.json(rows);
  } catch (err) {
    console.error('Error in getEligibleFollowUps:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get reopened tickets for agents (tickets with status 'Reopened')
export const getReopenedTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.*,
        e.name AS agent_name
      FROM tickets t
      LEFT JOIN employees e ON t.agent_id = e.employee_id
      WHERE t.resolution_status = 'Reopened'
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reopened tickets by agent
export const getReopenedTicketsByAgent = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.*,
        e.name AS agent_name
      FROM tickets t
      LEFT JOIN employees e ON t.agent_id = e.employee_id
      WHERE t.resolution_status = 'Reopened' AND t.agent_id = ?
      ORDER BY t.created_at DESC
    `, [req.params.agent_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sidebarMenu = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", icon: "dashboard" }
    ]
  },
  {
    section: "Call Center",
    items: [
      { label: "New Tickets", icon: "headset" },
      { label: "Follow-ups", icon: "refresh" },
      { label: "Supervisor Reviews", icon: "review" }
    ]
  },
  {
    section: "Content Production",
    items: [
      { label: "New Creative Ideas", icon: "lightbulb" },
      { label: "Content Management", icon: "file" },
      { label: "Production Workflow", icon: "tools" },
      { label: "Social Media", icon: "share" }
    ]
  },
  {
    section: "Analytics & Reports",
    items: [
      { label: "Ticket Analytics", icon: "pie-chart" },
      { label: "Content Analytics", icon: "bar-chart" },
      { label: "Employee Analytics", icon: "user-analytics" }
    ]
  }
]; 


