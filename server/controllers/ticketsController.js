const pool = require('../config/db');
const cors = require('cors');

// Create new ticket
exports.createTicket = async (req, res) => {
  const { customer_phone, communication_channel, device_type, issue_category, issue_type, issue_description, agent_id, first_call_resolution, resolution_status, end_time } = req.body;
  if (!agent_id) {
    return res.status(400).json({ error: 'agent_id is required.' });
  }
  // Validate issue_category
  const validCategories = ['App', 'IPTV'];
  if (!validCategories.includes(issue_category)) {
    return res.status(400).json({ error: 'Invalid issue_category. Must be App or IPTV.' });
  }
  // Validate issue_type based on category
  const validTypes = {
    App: ['Streaming', 'VOD', 'OTP', 'App', 'Other'],
    IPTV: ['Subscription Issue', 'Dark Channels / Black Screen', 'Channel Not Loading', 'VOD', 'Streaming']
  };
  if (!validTypes[issue_category].includes(issue_type)) {
    return res.status(400).json({ error: `Invalid issue_type for category ${issue_category}.` });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO tickets (customer_phone, communication_channel, device_type, issue_category, issue_type, issue_description, agent_id, first_call_resolution, resolution_status, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [customer_phone || null, communication_channel || null, device_type || null, issue_category, issue_type, issue_description || null, agent_id, first_call_resolution === undefined ? null : !!first_call_resolution, resolution_status || null, end_time || null]
    );
    res.status(201).json({
      ticket_id: result.insertId,
      created_at: new Date(),
      customer_phone: customer_phone || null,
      communication_channel: communication_channel || null,
      device_type: device_type || null,
      issue_category,
      issue_type,
      issue_description: issue_description || null,
      agent_id,
      first_call_resolution: first_call_resolution === undefined ? null : !!first_call_resolution,
      resolution_status: resolution_status || null,
      end_time: end_time || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tickets ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tickets WHERE ticket_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update ticket by ID
exports.updateTicket = async (req, res) => {
  const { customer_phone, communication_channel, device_type, issue_category, issue_type, issue_description, agent_id, first_call_resolution, resolution_status, end_time } = req.body;
  if (!agent_id) {
    return res.status(400).json({ error: 'agent_id is required.' });
  }
  // Validate issue_category
  const validCategories = ['App', 'IPTV'];
  if (!validCategories.includes(issue_category)) {
    return res.status(400).json({ error: 'Invalid issue_category. Must be App or IPTV.' });
  }
  // Validate issue_type based on category
  const validTypes = {
    App: ['Streaming', 'VOD', 'OTP', 'App', 'Other'],
    IPTV: ['Subscription Issue', 'Dark Channels / Black Screen', 'Channel Not Loading', 'VOD', 'Streaming']
  };
  if (!validTypes[issue_category].includes(issue_type)) {
    return res.status(400).json({ error: `Invalid issue_type for category ${issue_category}.` });
  }
  try {
    const [result] = await pool.query(
      'UPDATE tickets SET customer_phone = ?, communication_channel = ?, device_type = ?, issue_category = ?, issue_type = ?, issue_description = ?, agent_id = ?, first_call_resolution = ?, resolution_status = ?, end_time = ? WHERE ticket_id = ?',
      [customer_phone || null, communication_channel || null, device_type || null, issue_category, issue_type, issue_description || null, agent_id, first_call_resolution === undefined ? null : !!first_call_resolution, resolution_status || null, end_time || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket not found.' });
    res.json({
      ticket_id: req.params.id,
      customer_phone: customer_phone || null,
      communication_channel: communication_channel || null,
      device_type: device_type || null,
      issue_category,
      issue_type,
      issue_description: issue_description || null,
      agent_id,
      first_call_resolution: first_call_resolution === undefined ? null : !!first_call_resolution,
      resolution_status: resolution_status || null,
      end_time: end_time || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete ticket by ID
exports.deleteTicket = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tickets WHERE ticket_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket not found.' });
    res.json({ message: 'Ticket deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Filtered endpoints
exports.getTicketsByAgent = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tickets WHERE agent_id = ? ORDER BY created_at DESC',
      [req.params.agent_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketsByResolutionStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tickets WHERE resolution_status = ? ORDER BY created_at DESC',
      [req.params.resolution_status]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketsByIssueType = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tickets WHERE issue_type = ? ORDER BY created_at DESC',
      [req.params.issue_type]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketsByDeviceType = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tickets WHERE device_type = ? ORDER BY created_at DESC',
      [req.params.device_type]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketsByFirstCallResolution = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tickets WHERE first_call_resolution = ? ORDER BY created_at DESC',
      [req.params.first_call_resolution === 'true']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketsByCommunicationChannel = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tickets WHERE communication_channel = ? ORDER BY created_at DESC',
      [req.params.communication_channel]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 