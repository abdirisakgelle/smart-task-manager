const pool = require('../config/db');
const { poolRO, poolRW, getConnectionRW } = require('../db');

// Get all ideas with employee names
exports.getAllIdeas = async (req, res) => {
  try {
    // If stage query param is provided, delegate to stage-based handler
    if (req.query && req.query.stage) {
      return exports.getIdeasByStage(req, res);
    }

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

// Stage inference helper
function inferStage(row){
  if(row.social_post_id) return 'Social';
  if(row.production_id)  return 'Production';
  if(row.content_id)     return 'Script';
  return 'Idea';
}

// Build pagination
function buildPagination(req){
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '25', 10)));
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const offset = (page - 1) * limit;
  return { limit, offset };
}

// GET /api/ideas?stage=Idea|Script|Production|Social
exports.getIdeasByStage = async (req, res) => {
  const stage = (req.query.stage || '').toLowerCase();
  const { limit, offset } = buildPagination(req);

  try {
    let sql, params = [];
    if(stage === 'idea'){
      sql = `
        SELECT i.*
        FROM ideas i
        LEFT JOIN content c ON c.idea_id = i.idea_id
        WHERE c.content_id IS NULL
          AND LOWER(i.status) IN ('pending','in progress','approved','bank')
        ORDER BY i.submission_date DESC, i.idea_id DESC
        LIMIT ? OFFSET ?`;
      params = [limit, offset];
    } else if(stage === 'script'){
      sql = `
        SELECT i.*, c.*
        FROM ideas i
        JOIN content c ON c.idea_id = i.idea_id
        LEFT JOIN production p ON p.content_id = c.content_id
        WHERE p.production_id IS NULL
        ORDER BY c.content_id DESC
        LIMIT ? OFFSET ?`;
      params = [limit, offset];
    } else if(stage === 'production'){
      sql = `
        SELECT i.*, c.*, p.*
        FROM ideas i
        JOIN content c    ON c.idea_id    = i.idea_id
        JOIN production p ON p.content_id = c.content_id
        LEFT JOIN social_media sm ON sm.content_id = c.content_id
        WHERE sm.post_id IS NULL
        ORDER BY p.production_id DESC
        LIMIT ? OFFSET ?`;
      params = [limit, offset];
    } else if(stage === 'social'){
      sql = `
        SELECT i.*, c.*, sm.*
        FROM ideas i
        JOIN content c      ON c.idea_id     = i.idea_id
        JOIN social_media sm ON sm.content_id = c.content_id
        ORDER BY sm.post_date DESC, sm.post_id DESC
        LIMIT ? OFFSET ?`;
      params = [limit, offset];
    } else {
      return res.status(400).json({ error: 'INVALID_STAGE' });
    }

    const [rows] = await poolRO.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get idea by ID with pipeline info
exports.getIdeaById = async (req, res) => {
  try {
    const ideaId = req.params.id;

    const [rows] = await poolRO.query(`
      SELECT
        i.idea_id,
        i.submission_date,
        i.title,
        i.contributor_id,
        i.script_writer_id,
        i.status,
        i.script_deadline,
        i.priority,
        i.notes,
        i.created_at,
        i.updated_at,
        (SELECT c.content_id FROM content c WHERE c.idea_id = i.idea_id LIMIT 1) AS content_id,
        (
          SELECT p.production_id 
          FROM production p 
          WHERE p.content_id = (SELECT c2.content_id FROM content c2 WHERE c2.idea_id = i.idea_id LIMIT 1)
          LIMIT 1
        ) AS production_id,
        (
          SELECT sm.post_id 
          FROM social_media sm 
          WHERE sm.content_id = (SELECT c3.content_id FROM content c3 WHERE c3.idea_id = i.idea_id LIMIT 1)
          LIMIT 1
        ) AS social_post_id
      FROM ideas i
      WHERE i.idea_id = ?
      LIMIT 1
    `, [ideaId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found.' });
    }

    const base = rows[0];
    const stage = inferStage(base);

    // Fetch optional child records
    let content = null, production = null, social_media = null;
    if (base.content_id) {
      const [cRows] = await poolRO.query('SELECT * FROM content WHERE content_id = ? LIMIT 1', [base.content_id]);
      content = cRows[0] || null;
    }
    if (base.production_id) {
      const [pRows] = await poolRO.query('SELECT * FROM production WHERE production_id = ? LIMIT 1', [base.production_id]);
      production = pRows[0] || null;
    }
    if (base.social_post_id) {
      const [sRows] = await poolRO.query('SELECT * FROM social_media WHERE post_id = ? LIMIT 1', [base.social_post_id]);
      social_media = sRows[0] || null;
    }

    res.json({ idea: base, content, production, social_media, stage });
  } catch (err) {
    console.error('Error fetching idea:', err);
    res.status(500).json({ error: err.message });
  }
};

// Transactional move-forward
exports.moveForward = async (req, res) => {
  const ideaId = parseInt(req.params.id, 10);
  const { note = '', actorId = null } = req.body || {};

  if (!Number.isInteger(ideaId)) {
    return res.status(400).json({ error: 'INVALID_ID' });
  }

  const conn = await getConnectionRW();
  try {
    await conn.beginTransaction();

    // Lock idea row
    const [ideas] = await conn.query('SELECT * FROM ideas WHERE idea_id = ? FOR UPDATE', [ideaId]);
    if (ideas.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Idea not found.' });
    }
    const idea = ideas[0];

    // Detect pointers inside TX
    const [[cidRow]] = await conn.query('SELECT content_id FROM content WHERE idea_id = ? LIMIT 1', [ideaId]);
    const content_id = cidRow ? cidRow.content_id : null;

    let production_id = null;
    if (content_id) {
      const [[pidRow]] = await conn.query('SELECT production_id FROM production WHERE content_id = ? LIMIT 1', [content_id]);
      production_id = pidRow ? pidRow.production_id : null;
    }

    let social_post_id = null;
    if (content_id) {
      const [[sidRow]] = await conn.query('SELECT post_id FROM social_media WHERE content_id = ? LIMIT 1', [content_id]);
      social_post_id = sidRow ? sidRow.post_id : null;
    }

    // Validate title before Script
    if (!content_id && (!idea.title || idea.title.trim() === '')) {
      await conn.rollback();
      return res.status(400).json({ error: 'MISSING_PREREQUISITE', message: 'Idea title is required.' });
    }

    // Branch by stage
    if (!content_id) {
      // Idea -> Script
      // Use script_writer_id as director_id fallback (schema requires NOT NULL)
      const directorId = idea.script_writer_id || 0;
      const scriptStatus = 'draft';

      // Idempotency: ensure not exists
      const [[exists]] = await conn.query('SELECT content_id FROM content WHERE idea_id = ? LIMIT 1', [ideaId]);
      if (!exists) {
        await conn.query(
          'INSERT INTO content (idea_id, title, script_status, content_status, director_id, filming_date, cast_and_presenters, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [ideaId, idea.title, scriptStatus, 'in_progress', directorId, null, null, `[Auto] from Idea. ${note}`.trim()]
        );
      }
      await conn.query('UPDATE ideas SET status = ? WHERE idea_id = ?', ['in progress', ideaId]);

    } else if (!production_id) {
      // Script -> Production
      // Validate content title and status
      const [[crow]] = await conn.query('SELECT title, script_status FROM content WHERE content_id = ? FOR UPDATE', [content_id]);
      if (!crow || !crow.title) {
        await conn.rollback();
        return res.status(400).json({ error: 'MISSING_PREREQUISITE', message: 'Content title required.' });
      }
      const validScriptStatuses = new Set(['draft','in progress','in_progress','completed']);
      if (!validScriptStatuses.has((crow.script_status || '').toLowerCase())) {
        await conn.rollback();
        return res.status(400).json({ error: 'MISSING_PREREQUISITE', message: 'Invalid script status for move.' });
      }

      const editorId = actorId || 0;
      const [[pexists]] = await conn.query('SELECT production_id FROM production WHERE content_id = ? LIMIT 1', [content_id]);
      if (!pexists) {
        await conn.query(
          'INSERT INTO production (content_id, editor_id, production_status, completion_date, sent_to_social_team, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [content_id, editorId, 'in progress', null, false, `[Auto] from Script. ${note}`.trim()]
        );
      }
      await conn.query('UPDATE content SET content_status = ? WHERE content_id = ?', ['completed', content_id]);

    } else if (!social_post_id) {
      // Production -> Social
      const [[prow]] = await conn.query('SELECT production_status FROM production WHERE production_id = ? FOR UPDATE', [production_id]);
      if (!prow) {
        await conn.rollback();
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Production not found' });
      }
      if ((prow.production_status || '').toLowerCase() === 'blocked') {
        await conn.rollback();
        return res.status(400).json({ error: 'MISSING_PREREQUISITE', message: 'Production is blocked.' });
      }

      const [[sexists]] = await conn.query('SELECT post_id FROM social_media WHERE content_id = ? LIMIT 1', [content_id]);
      if (!sexists) {
        await conn.query(
          'INSERT INTO social_media (content_id, platforms, post_type, post_date, caption, status, approved, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [content_id, 'Facebook', 'video', new Date(), null, 'draft', false, `[Auto] from Production. ${note}`.trim()]
        );
      } else {
        // Duplicate downstream detected
        await conn.rollback();
        return res.status(409).json({ error: 'ALREADY_EXISTS' });
      }

      await conn.query(
        'UPDATE production SET production_status = ?, completion_date = CURDATE(), sent_to_social_team = ? WHERE production_id = ?',
        ['completed', true, production_id]
      );

    } else {
      // Social -> Finalize
      await conn.query(
        `UPDATE social_media SET status = 'published', approved = TRUE, post_date = NOW(), notes = CONCAT(COALESCE(notes,''), ?) WHERE post_id = ?`,
        [' [Auto published]', social_post_id]
      );
    }

    await conn.commit();

    // Return updated detail with inferred stage
    req.params.id = String(ideaId);
    return exports.getIdeaById(req, res);
  } catch (err) {
    try { await conn.rollback(); } catch(e) {}
    console.error('Error in moveForward:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
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