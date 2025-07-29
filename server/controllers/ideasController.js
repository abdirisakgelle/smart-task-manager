const pool = require('../config/db');

// Get all ideas with employee names
exports.getAllIdeas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.*,
        c.name as contributor_name,
        sw.name as script_writer_name
      FROM ideas i
      LEFT JOIN employees c ON i.contributor_id = c.employee_id
      LEFT JOIN employees sw ON i.script_writer_id = sw.employee_id
      ORDER BY i.submission_date DESC, i.idea_id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ideas:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create a new idea
exports.createIdea = async (req, res) => {
  const { title, contributor_id, script_writer_id, script_deadline, priority, status, notes } = req.body;
  
  if (!title || !contributor_id || !script_writer_id) {
    return res.status(400).json({ error: 'Title, contributor_id, and script_writer_id are required.' });
  }

  try {
    const submission_date = new Date().toISOString().slice(0, 10);
    
    const [result] = await pool.query(
      'INSERT INTO ideas (submission_date, title, contributor_id, script_writer_id, status, script_deadline, priority, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [submission_date, title, contributor_id, script_writer_id, status || 'bank', script_deadline || null, priority || 'medium', notes || null]
    );

    // Fetch the created idea with employee names
    const [newIdea] = await pool.query(`
      SELECT 
        i.*,
        c.name as contributor_name,
        sw.name as script_writer_name
      FROM ideas i
      LEFT JOIN employees c ON i.contributor_id = c.employee_id
      LEFT JOIN employees sw ON i.script_writer_id = sw.employee_id
      WHERE i.idea_id = ?
    `, [result.insertId]);

    // Create notifications for assigned employees
    try {
      const { createNotification } = require('./notificationsController');
      
      // Notify the script writer
      if (script_writer_id) {
        const [scriptWriterUser] = await pool.query(
          'SELECT user_id FROM users WHERE employee_id = ?',
          [script_writer_id]
        );
        
        if (scriptWriterUser.length > 0) {
          const { createNotificationInternal } = require('./notificationsController');
          await createNotificationInternal({
            user_id: scriptWriterUser[0].user_id,
            title: 'New Script Assignment',
            message: `You have been assigned to write a script for the idea: "${title}". Please review and start working on it.`,
            type: 'script_assignment',
            related_id: result.insertId,
            related_type: 'idea'
          });
          console.log('✅ Script writer notification created for idea:', result.insertId);
        }
      }
      
      // Notify the contributor
      if (contributor_id) {
        const [contributorUser] = await pool.query(
          'SELECT user_id FROM users WHERE employee_id = ?',
          [contributor_id]
        );
        
        if (contributorUser.length > 0) {
          const { createNotificationInternal } = require('./notificationsController');
          await createNotificationInternal({
            user_id: contributorUser[0].user_id,
            title: 'New Idea Assignment',
            message: `You have been assigned as a contributor for the idea: "${title}". Please review and provide input.`,
            type: 'idea_assignment',
            related_id: result.insertId,
            related_type: 'idea'
          });
          console.log('✅ Contributor notification created for idea:', result.insertId);
        }
      }
    } catch (error) {
      console.error('❌ Error creating idea notifications:', error);
    }
    
    res.status(201).json(newIdea[0]);
  } catch (err) {
    console.error('Error creating idea:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get idea by ID
exports.getIdeaById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.*,
        c.name as contributor_name,
        sw.name as script_writer_name
      FROM ideas i
      LEFT JOIN employees c ON i.contributor_id = c.employee_id
      LEFT JOIN employees sw ON i.script_writer_id = sw.employee_id
      WHERE i.idea_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching idea:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update idea by ID
exports.updateIdea = async (req, res) => {
  const { title, contributor_id, script_writer_id, script_deadline, priority, status, notes } = req.body;
  
  if (!title || !contributor_id || !script_writer_id) {
    return res.status(400).json({ error: 'Title, contributor_id, and script_writer_id are required.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE ideas SET title = ?, contributor_id = ?, script_writer_id = ?, status = ?, script_deadline = ?, priority = ?, notes = ? WHERE idea_id = ?',
      [title, contributor_id, script_writer_id, status || 'bank', script_deadline || null, priority || 'medium', notes || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Idea not found.' });
    }

    // Fetch the updated idea with employee names
    const [updatedIdea] = await pool.query(`
      SELECT 
        i.*,
        c.name as contributor_name,
        sw.name as script_writer_name
      FROM ideas i
      LEFT JOIN employees c ON i.contributor_id = c.employee_id
      LEFT JOIN employees sw ON i.script_writer_id = sw.employee_id
      WHERE i.idea_id = ?
    `, [req.params.id]);

    // Create notifications for updated assignments
    try {
      const { createNotification } = require('./notificationsController');
      
      // Get the old idea data to compare assignments
      const [oldIdea] = await pool.query(
        'SELECT script_writer_id, contributor_id FROM ideas WHERE idea_id = ?',
        [req.params.id]
      );
      
      if (oldIdea.length > 0) {
        const oldScriptWriter = oldIdea[0].script_writer_id;
        const oldContributor = oldIdea[0].contributor_id;
        
        // Notify if script writer changed
        if (script_writer_id && script_writer_id !== oldScriptWriter) {
          const [scriptWriterUser] = await pool.query(
            'SELECT user_id FROM users WHERE employee_id = ?',
            [script_writer_id]
          );
          
          if (scriptWriterUser.length > 0) {
            const { createNotificationInternal } = require('./notificationsController');
            await createNotificationInternal({
              user_id: scriptWriterUser[0].user_id,
              title: 'Script Assignment Updated',
              message: `You have been assigned to write a script for the idea: "${title}". Please review and start working on it.`,
              type: 'script_assignment',
              related_id: req.params.id,
              related_type: 'idea'
            });
            console.log('✅ Script writer notification updated for idea:', req.params.id);
          }
        }
        
        // Notify if contributor changed
        if (contributor_id && contributor_id !== oldContributor) {
          const [contributorUser] = await pool.query(
            'SELECT user_id FROM users WHERE employee_id = ?',
            [contributor_id]
          );
          
          if (contributorUser.length > 0) {
            const { createNotificationInternal } = require('./notificationsController');
            await createNotificationInternal({
              user_id: contributorUser[0].user_id,
              title: 'Idea Assignment Updated',
              message: `You have been assigned as a contributor for the idea: "${title}". Please review and provide input.`,
              type: 'idea_assignment',
              related_id: req.params.id,
              related_type: 'idea'
            });
            console.log('✅ Contributor notification updated for idea:', req.params.id);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error creating idea update notifications:', error);
    }
    
    res.json(updatedIdea[0]);
  } catch (err) {
    console.error('Error updating idea:', err);
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

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Idea not found.' });
    }
    res.json({ message: 'Idea deleted successfully.' });
  } catch (err) {
    console.error('Error deleting idea:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get ideas by status
exports.getIdeasByStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.*,
        c.name as contributor_name,
        sw.name as script_writer_name
      FROM ideas i
      LEFT JOIN employees c ON i.contributor_id = c.employee_id
      LEFT JOIN employees sw ON i.script_writer_id = sw.employee_id
      WHERE i.status = ?
      ORDER BY i.submission_date DESC, i.idea_id DESC
    `, [req.params.status]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ideas by status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get ideas by priority
exports.getIdeasByPriority = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.*,
        c.name as contributor_name,
        sw.name as script_writer_name
      FROM ideas i
      LEFT JOIN employees c ON i.contributor_id = c.employee_id
      LEFT JOIN employees sw ON i.script_writer_id = sw.employee_id
      WHERE i.priority = ?
      ORDER BY i.submission_date DESC, i.idea_id DESC
    `, [req.params.priority]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ideas by priority:', err);
    res.status(500).json({ error: err.message });
  }
}; 