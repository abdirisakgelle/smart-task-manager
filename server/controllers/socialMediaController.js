const pool = require('../config/db');

// Create new social media post
exports.createSocialMedia = async (req, res) => {
  const { content_id, platforms, post_type, post_date, caption, status, approved, notes } = req.body;
  if (!content_id || !platforms || !post_type || !status) {
    return res.status(400).json({ error: 'content_id, platforms, post_type, and status are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO social_media (content_id, platforms, post_type, post_date, caption, status, approved, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [content_id, platforms, post_type, post_date || null, caption || null, status, approved === undefined ? false : !!approved, notes || null]
    );
    res.status(201).json({
      post_id: result.insertId,
      content_id,
      platforms,
      post_type,
      post_date: post_date || null,
      caption: caption || null,
      status,
      approved: approved === undefined ? false : !!approved,
      notes: notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all social media posts
exports.getAllSocialMedia = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM social_media ORDER BY post_id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get social media post by ID
exports.getSocialMediaById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM social_media WHERE post_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Social media post not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update social media post by ID
exports.updateSocialMedia = async (req, res) => {
  const { content_id, platforms, post_type, post_date, caption, status, approved, notes } = req.body;
  if (!content_id || !platforms || !post_type || !status) {
    return res.status(400).json({ error: 'content_id, platforms, post_type, and status are required.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE social_media SET content_id = ?, platforms = ?, post_type = ?, post_date = ?, caption = ?, status = ?, approved = ?, notes = ? WHERE post_id = ?',
      [content_id, platforms, post_type, post_date || null, caption || null, status, approved === undefined ? false : !!approved, notes || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Social media post not found.' });
    res.json({
      post_id: req.params.id,
      content_id,
      platforms,
      post_type,
      post_date: post_date || null,
      caption: caption || null,
      status,
      approved: approved === undefined ? false : !!approved,
      notes: notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete social media post by ID
exports.deleteSocialMedia = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM social_media WHERE post_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Social media post not found.' });
    res.json({ message: 'Social media post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Filtered endpoints
exports.getSocialMediaByStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM social_media WHERE status = ? ORDER BY post_id DESC',
      [req.params.status]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSocialMediaByContent = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM social_media WHERE content_id = ? ORDER BY post_id DESC',
      [req.params.content_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSocialMediaByPlatform = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM social_media WHERE platforms LIKE ? ORDER BY post_id DESC',
      [`%${req.params.platform}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSocialMediaByPostType = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM social_media WHERE post_type = ? ORDER BY post_id DESC',
      [req.params.post_type]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSocialMediaByApproved = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM social_media WHERE approved = ? ORDER BY post_id DESC',
      [req.params.approved === 'true']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 