const pool = require('../config/db');

// Create new content
exports.createContent = async (req, res) => {
  const { idea_id, script_status, content_status, director_id, filming_date, cast_and_presenters, notes } = req.body;
  if (!idea_id || !script_status || !content_status || !director_id) {
    return res.status(400).json({ error: 'idea_id, script_status, content_status, and director_id are required.' });
  }
  try {
    // Get the idea title first
    const [ideaRows] = await pool.query(
      'SELECT title FROM ideas WHERE idea_id = ?',
      [idea_id]
    );
    
    if (ideaRows.length === 0) {
      return res.status(404).json({ error: 'Idea not found.' });
    }
    
    const ideaTitle = ideaRows[0].title;
    
    // Convert employee IDs to names for cast_and_presenters
    let castAndPresentersText = null;
    if (cast_and_presenters && cast_and_presenters.length > 0) {
      const employeeIds = Array.isArray(cast_and_presenters) ? cast_and_presenters : [cast_and_presenters];
      const [employeeRows] = await pool.query(
        'SELECT name FROM employees WHERE employee_id IN (?)',
        [employeeIds]
      );
      castAndPresentersText = employeeRows.map(row => row.name).join(', ');
    }

    const [result] = await pool.query(
      'INSERT INTO content (idea_id, title, script_status, content_status, director_id, filming_date, cast_and_presenters, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [idea_id, ideaTitle, script_status, content_status, director_id, filming_date || null, castAndPresentersText, notes || null]
    );

    // Fetch the created content with employee names
    const [newContent] = await pool.query(`
      SELECT 
        c.*,
        i.title as idea_title,
        d.name as director_name
      FROM content c
      LEFT JOIN ideas i ON c.idea_id = i.idea_id
      LEFT JOIN employees d ON c.director_id = d.employee_id
      WHERE c.content_id = ?
    `, [result.insertId]);

    // Create notifications for assigned employees
    try {
      const { createNotification } = require('./notificationsController');
      
      // Notify the director
      if (director_id) {
        const [directorUser] = await pool.query(
          'SELECT user_id FROM users WHERE employee_id = ?',
          [director_id]
        );
        
        if (directorUser.length > 0) {
          const { createNotificationInternal } = require('./notificationsController');
          await createNotificationInternal({
            user_id: directorUser[0].user_id,
            title: 'New Content Assignment',
            message: `You have been assigned as director for the content: "${ideaTitle}". Please review and start production.`,
            type: 'content_assignment',
            related_id: result.insertId,
            related_type: 'content'
          });
          console.log('✅ Director notification created for content:', result.insertId);
        }
      }
      
      // Notify cast and presenters
      if (cast_and_presenters && cast_and_presenters.length > 0) {
        const employeeIds = Array.isArray(cast_and_presenters) ? cast_and_presenters : [cast_and_presenters];
        
        for (const employeeId of employeeIds) {
          const [castUser] = await pool.query(
            'SELECT user_id FROM users WHERE employee_id = ?',
            [employeeId]
          );
          
          if (castUser.length > 0) {
            const { createNotificationInternal } = require('./notificationsController');
            await createNotificationInternal({
              user_id: castUser[0].user_id,
              title: 'New Cast Assignment',
              message: `You have been assigned to the cast for the content: "${ideaTitle}". Please review your role.`,
              type: 'cast_assignment',
              related_id: result.insertId,
              related_type: 'content'
            });
            console.log('✅ Cast notification created for content:', result.insertId, 'employee:', employeeId);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error creating content notifications:', error);
    }
    
    res.status(201).json(newContent[0]);
  } catch (err) {
    console.error('Error creating content:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all content with employee names
exports.getAllContent = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.*,
        i.title as idea_title,
        d.name as director_name
      FROM content c
      LEFT JOIN ideas i ON c.idea_id = i.idea_id
      LEFT JOIN employees d ON c.director_id = d.employee_id
      ORDER BY c.content_id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching content:', err);
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
  const { idea_id, title, script_status, content_status, director_id, filming_date, cast_and_presenters, notes } = req.body;
  if (!idea_id || !title || !script_status || !content_status || !director_id) {
    return res.status(400).json({ error: 'idea_id, title, script_status, content_status, and director_id are required.' });
  }
  try {
    // Convert employee IDs to names for cast_and_presenters
    let castAndPresentersText = null;
    if (cast_and_presenters && cast_and_presenters.length > 0) {
      const employeeIds = Array.isArray(cast_and_presenters) ? cast_and_presenters : [cast_and_presenters];
      const [employeeRows] = await pool.query(
        'SELECT name FROM employees WHERE employee_id IN (?)',
        [employeeIds]
      );
      castAndPresentersText = employeeRows.map(row => row.name).join(', ');
    }

    const [result] = await pool.query(
      'UPDATE content SET idea_id = ?, title = ?, script_status = ?, content_status = ?, director_id = ?, filming_date = ?, cast_and_presenters = ?, notes = ? WHERE content_id = ?',
      [idea_id, title, script_status, content_status, director_id, filming_date || null, castAndPresentersText, notes || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Content not found.' });
    res.json({
      content_id: req.params.id,
      idea_id,
      title,
      script_status,
      content_status,
      director_id,
      filming_date: filming_date || null,
      cast_and_presenters: cast_and_presenters || null,
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