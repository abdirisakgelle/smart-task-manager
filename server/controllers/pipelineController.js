const { roPool, rwPool } = require('../config/db');
const { inferStage, getStageInfo, getFullIdeaDetails, canMoveForward, getValidationErrors } = require('../utils/stageInference');

/**
 * Content Production Pipeline Controller
 * Handles stage-based listing, detail views, and move-forward operations
 */

// GET /api/ideas?stage=Idea - New Creative Ideas
const getIdeasByStage = async (req, res) => {
  try {
    const { stage, limit = 50, offset = 0 } = req.query;
    let query, params;

    switch (stage) {
      case 'Idea':
        // Ideas that don't have content records yet
        query = `
          SELECT 
            i.*,
            c.name as contributor_name,
            sw.name as script_writer_name,
            NULL as content_id,
            NULL as production_id,
            NULL as social_post_id
          FROM ideas i
          LEFT JOIN employees c ON i.contributor_id = c.employee_id
          LEFT JOIN employees sw ON i.script_writer_id = sw.employee_id
          LEFT JOIN content cont ON cont.idea_id = i.idea_id
          WHERE cont.content_id IS NULL
            AND LOWER(i.status) IN ('pending', 'in progress', 'approved', 'bank')
          ORDER BY i.submission_date DESC, i.idea_id DESC
          LIMIT ? OFFSET ?
        `;
        params = [parseInt(limit), parseInt(offset)];
        break;

      case 'Script':
        // Ideas that have content but no production
        query = `
          SELECT 
            i.*,
            c.name as contributor_name,
            sw.name as script_writer_name,
            cont.content_id,
            cont.title as content_title,
            cont.script_status,
            cont.content_status,
            cont.director_id,
            d.name as director_name,
            cont.filming_date,
            cont.cast_and_presenters,
            cont.notes as content_notes,
            NULL as production_id,
            NULL as social_post_id
          FROM ideas i
          LEFT JOIN employees c ON i.contributor_id = c.employee_id
          LEFT JOIN employees sw ON i.script_writer_id = sw.employee_id
          JOIN content cont ON cont.idea_id = i.idea_id
          LEFT JOIN employees d ON cont.director_id = d.employee_id
          LEFT JOIN production p ON p.content_id = cont.content_id
          WHERE p.production_id IS NULL
          ORDER BY cont.updated_at DESC, i.idea_id DESC
          LIMIT ? OFFSET ?
        `;
        params = [parseInt(limit), parseInt(offset)];
        break;

      case 'Production':
        // Ideas that have content and production but no social media
        query = `
          SELECT 
            i.*,
            c.name as contributor_name,
            sw.name as script_writer_name,
            cont.content_id,
            cont.title as content_title,
            cont.script_status,
            cont.content_status,
            p.production_id,
            p.editor_id,
            ed.name as editor_name,
            p.production_status,
            p.start_time,
            p.completion_date,
            p.sent_to_social_team,
            p.notes as production_notes,
            NULL as social_post_id
          FROM ideas i
          LEFT JOIN employees c ON i.contributor_id = c.employee_id
          LEFT JOIN employees sw ON i.script_writer_id = sw.employee_id
          JOIN content cont ON cont.idea_id = i.idea_id
          JOIN production p ON p.content_id = cont.content_id
          LEFT JOIN employees ed ON p.editor_id = ed.employee_id
          LEFT JOIN social_media sm ON sm.content_id = cont.content_id
          WHERE sm.post_id IS NULL
          ORDER BY p.start_time DESC, i.idea_id DESC
          LIMIT ? OFFSET ?
        `;
        params = [parseInt(limit), parseInt(offset)];
        break;

      case 'Social':
        // Ideas that have all stages including social media
        query = `
          SELECT 
            i.*,
            c.name as contributor_name,
            sw.name as script_writer_name,
            cont.content_id,
            cont.title as content_title,
            sm.post_id as social_post_id,
            sm.platforms,
            sm.post_type,
            sm.post_date,
            sm.caption,
            sm.status as social_status,
            sm.approved as social_approved,
            sm.notes as social_notes
          FROM ideas i
          LEFT JOIN employees c ON i.contributor_id = c.employee_id
          LEFT JOIN employees sw ON i.script_writer_id = sw.employee_id
          JOIN content cont ON cont.idea_id = i.idea_id
          JOIN social_media sm ON sm.content_id = cont.content_id
          ORDER BY sm.post_date DESC, i.idea_id DESC
          LIMIT ? OFFSET ?
        `;
        params = [parseInt(limit), parseInt(offset)];
        break;

      default:
        return res.status(400).json({ 
          error: 'Invalid stage', 
          message: 'Stage must be one of: Idea, Script, Production, Social' 
        });
    }

    const [rows] = await roPool.query(query, params);
    
    // Add stage and canMoveForward for each row
    const enrichedRows = await Promise.all(
      rows.map(async (row) => {
        const computedStage = inferStage(row);
        return {
          ...row,
          stage: computedStage,
          canMoveForward: await canMoveForward(row.idea_id, computedStage)
        };
      })
    );

    res.json(enrichedRows);
  } catch (err) {
    console.error('Error fetching ideas by stage:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/ideas/:id - Get detailed idea information with all stages
const getIdeaDetails = async (req, res) => {
  try {
    const ideaId = req.params.id;
    const details = await getFullIdeaDetails(ideaId);
    res.json(details);
  } catch (err) {
    console.error('Error fetching idea details:', err);
    if (err.message === 'Idea not found') {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// POST /api/ideas/:id/move-forward - Move idea to next stage
const moveIdeaForward = async (req, res) => {
  const connection = await rwPool.getConnection();
  
  try {
    const ideaId = req.params.id;
    const { note, actorId } = req.body;
    const userId = actorId || req.user?.id || req.user?.user_id || 0;

    // Start transaction
    await connection.beginTransaction();

    // Lock the parent idea row to avoid race conditions
    const [ideaLock] = await connection.query(
      'SELECT * FROM ideas WHERE idea_id = ? FOR UPDATE',
      [ideaId]
    );

    if (ideaLock.length === 0) {
      throw new Error('Idea not found');
    }

    // Get current stage information
    const stageInfo = await getStageInfo(ideaId);
    const currentStage = stageInfo.stage;

    // Check validation before moving
    const validationErrors = await getValidationErrors(ideaId, currentStage);
    if (validationErrors.length > 0) {
      throw new Error(`MISSING_PREREQUISITE: ${validationErrors.join(', ')}`);
    }

    // Detect current pointers inside the transaction
    const [pointers] = await connection.query(`
      SELECT
        (SELECT c.content_id FROM content c WHERE c.idea_id = ? LIMIT 1) AS content_id,
        (SELECT p.production_id FROM production p 
         JOIN content c ON p.content_id = c.content_id 
         WHERE c.idea_id = ? LIMIT 1) AS production_id,
        (SELECT sm.post_id FROM social_media sm 
         JOIN content c ON sm.content_id = c.content_id 
         WHERE c.idea_id = ? LIMIT 1) AS social_post_id
    `, [ideaId, ideaId, ideaId]);

    const { content_id, production_id, social_post_id } = pointers[0];

    let result = {};
    let nextStage = '';

    // Branch by stage - Idempotent operations
    if (!content_id) {
      // Idea -> Script
      const [existingContent] = await connection.query(
        'SELECT content_id FROM content WHERE idea_id = ?',
        [ideaId]
      );

      if (existingContent.length > 0) {
        throw new Error('ALREADY_EXISTS: Content already exists for this idea');
      }

      const [contentResult] = await connection.query(`
        INSERT INTO content (idea_id, title, script_status, notes, created_at, updated_at)
        SELECT i.idea_id, i.title, 'draft',
               CONCAT('[Auto] from Idea. ', COALESCE(?, '')),
               NOW(), NOW()
        FROM ideas i
        WHERE i.idea_id = ?
      `, [note || '', ideaId]);

      await connection.query(
        'UPDATE ideas SET status = ? WHERE idea_id = ?',
        ['in progress', ideaId]
      );

      result = { 
        message: 'Moved from Idea to Script stage',
        content_id: contentResult.insertId,
        stage_transition: 'Idea -> Script'
      };
      nextStage = 'Script';

    } else if (!production_id) {
      // Script -> Production
      const [existingProduction] = await connection.query(
        'SELECT production_id FROM production WHERE content_id = ?',
        [content_id]
      );

      if (existingProduction.length > 0) {
        throw new Error('ALREADY_EXISTS: Production already exists for this content');
      }

      const [productionResult] = await connection.query(`
        INSERT INTO production (content_id, editor_id, production_status, notes, start_time)
        VALUES (?, ?, 'in progress', CONCAT('[Auto] from Script. ', COALESCE(?, '')), NOW())
      `, [content_id, userId, note || '']);

      await connection.query(
        'UPDATE content SET content_status = ?, updated_at = NOW() WHERE content_id = ?',
        ['Completed', content_id]
      );

      result = { 
        message: 'Moved from Script to Production stage',
        production_id: productionResult.insertId,
        stage_transition: 'Script -> Production'
      };
      nextStage = 'Production';

    } else if (!social_post_id) {
      // Production -> Social
      const [existingSocial] = await connection.query(
        'SELECT post_id FROM social_media WHERE content_id = ?',
        [content_id]
      );

      if (existingSocial.length > 0) {
        throw new Error('ALREADY_EXISTS: Social media post already exists for this content');
      }

      const [socialResult] = await connection.query(`
        INSERT INTO social_media (content_id, platforms, post_type, status, notes, post_date)
        VALUES (?, 'Facebook', 'video', 'draft', CONCAT('[Auto] from Production. ', COALESCE(?, '')), CURDATE())
      `, [content_id, note || '']);

      await connection.query(`
        UPDATE production 
        SET production_status = 'completed',
            completion_date = CURDATE(),
            sent_to_social_team = TRUE
        WHERE content_id = ?
      `, [content_id]);

      result = { 
        message: 'Moved from Production to Social stage',
        social_post_id: socialResult.insertId,
        stage_transition: 'Production -> Social'
      };
      nextStage = 'Social';

    } else {
      // Social -> Finalize (publish)
      await connection.query(`
        UPDATE social_media sm
        SET sm.status = 'published',
            sm.approved = TRUE,
            sm.post_date = CURDATE(),
            sm.notes = CONCAT(COALESCE(sm.notes, ''), ' [Auto published]')
        WHERE sm.post_id = ?
      `, [social_post_id]);

      result = { 
        message: 'Published social media post',
        stage_transition: 'Social -> Published'
      };
      nextStage = 'Published';
    }

    // Commit transaction
    await connection.commit();

    // Return success response with updated details
    const updatedDetails = await getFullIdeaDetails(ideaId);
    
    res.json({
      success: true,
      ...result,
      idea: updatedDetails,
      previousStage: currentStage,
      currentStage: nextStage
    });

  } catch (err) {
    // Rollback transaction on error
    await connection.rollback();
    
    console.error('Error moving idea forward:', err);
    
    // Handle specific error types
    if (err.message.startsWith('ALREADY_EXISTS:')) {
      res.status(409).json({ 
        error: 'ALREADY_EXISTS', 
        message: err.message.replace('ALREADY_EXISTS: ', '')
      });
    } else if (err.message.startsWith('MISSING_PREREQUISITE:')) {
      res.status(400).json({ 
        error: 'MISSING_PREREQUISITE', 
        message: err.message.replace('MISSING_PREREQUISITE: ', '')
      });
    } else if (err.message.startsWith('MOVE_NOT_ALLOWED:')) {
      res.status(409).json({ 
        error: 'MOVE_NOT_ALLOWED', 
        message: err.message.replace('MOVE_NOT_ALLOWED: ', '')
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  } finally {
    connection.release();
  }
};

// GET /api/ideas/:id/validation - Check validation for current stage
const getIdeaValidation = async (req, res) => {
  try {
    const ideaId = req.params.id;
    const stageInfo = await getStageInfo(ideaId);
    const validationErrors = await getValidationErrors(ideaId, stageInfo.stage);
    
    res.json({
      idea_id: ideaId,
      stage: stageInfo.stage,
      canMoveForward: stageInfo.canMoveForward,
      validationErrors,
      isValid: validationErrors.length === 0
    });
  } catch (err) {
    console.error('Error checking idea validation:', err);
    if (err.message === 'Idea not found') {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = {
  getIdeasByStage,
  getIdeaDetails,
  moveIdeaForward,
  getIdeaValidation
};