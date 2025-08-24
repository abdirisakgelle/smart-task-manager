const { roPool, rwPool } = require('../config/db');

/**
 * Stage Inference Logic for Content Production Pipeline
 * Stages: Idea -> Script -> Production -> Social
 */

// Infer the current stage based on downstream records
function inferStage(row) {
  if (row.social_post_id) return 'Social';
  if (row.production_id) return 'Production';
  if (row.content_id) return 'Script';
  return 'Idea';
}

// Get stage information for a specific idea
async function getStageInfo(ideaId) {
  const [rows] = await roPool.query(`
    SELECT
      i.idea_id,
      i.title,
      i.status as idea_status,
      i.priority,
      i.notes as idea_notes,
      i.submission_date,
      i.script_deadline,
      (SELECT c.content_id FROM content c WHERE c.idea_id = i.idea_id LIMIT 1) AS content_id,
      (SELECT p.production_id FROM production p 
       JOIN content c ON p.content_id = c.content_id 
       WHERE c.idea_id = i.idea_id LIMIT 1) AS production_id,
      (SELECT sm.post_id FROM social_media sm 
       JOIN content c ON sm.content_id = c.content_id 
       WHERE c.idea_id = i.idea_id LIMIT 1) AS social_post_id
    FROM ideas i
    WHERE i.idea_id = ?
  `, [ideaId]);

  if (rows.length === 0) {
    throw new Error('Idea not found');
  }

  const row = rows[0];
  const stage = inferStage(row);
  
  return {
    ...row,
    stage,
    canMoveForward: await canMoveForward(ideaId, stage)
  };
}

// Get detailed information for all stages of an idea
async function getFullIdeaDetails(ideaId) {
  const [rows] = await roPool.query(`
    SELECT
      i.*,
      c.name as contributor_name,
      sw.name as script_writer_name,
      cont.content_id,
      cont.title as content_title,
      cont.script_status,
      cont.content_status,
      cont.director_id,
      cont.filming_date,
      cont.cast_and_presenters,
      cont.notes as content_notes,
      d.name as director_name,
      p.production_id,
      p.editor_id,
      p.production_status,
      p.completion_date,
      p.sent_to_social_team,
      p.notes as production_notes,
      p.start_time as production_start_time,
      ed.name as editor_name,
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
    LEFT JOIN content cont ON cont.idea_id = i.idea_id
    LEFT JOIN employees d ON cont.director_id = d.employee_id
    LEFT JOIN production p ON p.content_id = cont.content_id
    LEFT JOIN employees ed ON p.editor_id = ed.employee_id
    LEFT JOIN social_media sm ON sm.content_id = cont.content_id
    WHERE i.idea_id = ?
  `, [ideaId]);

  if (rows.length === 0) {
    throw new Error('Idea not found');
  }

  const row = rows[0];
  const stage = inferStage(row);
  
  return {
    idea: {
      idea_id: row.idea_id,
      title: row.title,
      contributor_id: row.contributor_id,
      contributor_name: row.contributor_name,
      script_writer_id: row.script_writer_id,
      script_writer_name: row.script_writer_name,
      status: row.status,
      priority: row.priority,
      script_deadline: row.script_deadline,
      notes: row.notes,
      submission_date: row.submission_date,
      created_at: row.created_at,
      updated_at: row.updated_at
    },
    content: row.content_id ? {
      content_id: row.content_id,
      title: row.content_title,
      script_status: row.script_status,
      content_status: row.content_status,
      director_id: row.director_id,
      director_name: row.director_name,
      filming_date: row.filming_date,
      cast_and_presenters: row.cast_and_presenters,
      notes: row.content_notes
    } : null,
    production: row.production_id ? {
      production_id: row.production_id,
      editor_id: row.editor_id,
      editor_name: row.editor_name,
      production_status: row.production_status,
      start_time: row.production_start_time,
      completion_date: row.completion_date,
      sent_to_social_team: row.sent_to_social_team,
      notes: row.production_notes
    } : null,
    social_media: row.social_post_id ? {
      post_id: row.social_post_id,
      platforms: row.platforms,
      post_type: row.post_type,
      post_date: row.post_date,
      caption: row.caption,
      status: row.social_status,
      approved: row.social_approved,
      notes: row.social_notes
    } : null,
    stage,
    canMoveForward: await canMoveForward(ideaId, stage)
  };
}

// Validation rules for moving forward
async function canMoveForward(ideaId, stage) {
  try {
    switch (stage) {
      case 'Idea': {
        // Idea -> Script: require ideas.title not empty
        const [ideas] = await roPool.query(
          'SELECT title FROM ideas WHERE idea_id = ? AND title IS NOT NULL AND TRIM(title) != ""',
          [ideaId]
        );
        return ideas.length > 0;
      }
      
      case 'Script': {
        // Script -> Production: require content.script_status in valid states and title present
        const [content] = await roPool.query(`
          SELECT script_status, title 
          FROM content 
          WHERE idea_id = ? 
            AND script_status IN ('draft', 'in progress', 'completed')
            AND title IS NOT NULL AND TRIM(title) != ""
        `, [ideaId]);
        return content.length > 0;
      }
      
      case 'Production': {
        // Production -> Social: require production.production_status != 'blocked'
        const [production] = await roPool.query(`
          SELECT p.production_status 
          FROM production p
          JOIN content c ON p.content_id = c.content_id
          WHERE c.idea_id = ? AND p.production_status != 'blocked'
        `, [ideaId]);
        return production.length > 0;
      }
      
      case 'Social': {
        // Social -> Publish: require status in valid states
        const [social] = await roPool.query(`
          SELECT sm.status 
          FROM social_media sm
          JOIN content c ON sm.content_id = c.content_id
          WHERE c.idea_id = ? AND sm.status IN ('draft', 'scheduled')
        `, [ideaId]);
        return social.length > 0;
      }
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking if can move forward:', error);
    return false;
  }
}

// Get validation errors for current stage
async function getValidationErrors(ideaId, stage) {
  const errors = [];
  
  try {
    switch (stage) {
      case 'Idea': {
        const [ideas] = await roPool.query(
          'SELECT title FROM ideas WHERE idea_id = ?',
          [ideaId]
        );
        if (ideas.length === 0) {
          errors.push('Idea not found');
        } else if (!ideas[0].title || ideas[0].title.trim() === '') {
          errors.push('Title is required');
        }
        break;
      }
      
      case 'Script': {
        const [content] = await roPool.query(
          'SELECT script_status, title FROM content WHERE idea_id = ?',
          [ideaId]
        );
        if (content.length === 0) {
          errors.push('Content record not found');
        } else {
          if (!content[0].title || content[0].title.trim() === '') {
            errors.push('Content title is required');
          }
          if (!['draft', 'in progress', 'completed'].includes(content[0].script_status)) {
            errors.push('Script status must be draft, in progress, or completed');
          }
        }
        break;
      }
      
      case 'Production': {
        const [production] = await roPool.query(`
          SELECT p.production_status 
          FROM production p
          JOIN content c ON p.content_id = c.content_id
          WHERE c.idea_id = ?
        `, [ideaId]);
        if (production.length === 0) {
          errors.push('Production record not found');
        } else if (production[0].production_status === 'blocked') {
          errors.push('Production is blocked and cannot move forward');
        }
        break;
      }
      
      case 'Social': {
        const [social] = await roPool.query(`
          SELECT sm.status 
          FROM social_media sm
          JOIN content c ON sm.content_id = c.content_id
          WHERE c.idea_id = ?
        `, [ideaId]);
        if (social.length === 0) {
          errors.push('Social media record not found');
        } else if (!['draft', 'scheduled'].includes(social[0].status)) {
          errors.push('Social media status must be draft or scheduled to publish');
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error getting validation errors:', error);
    errors.push('Validation check failed');
  }
  
  return errors;
}

module.exports = {
  inferStage,
  getStageInfo,
  getFullIdeaDetails,
  canMoveForward,
  getValidationErrors
};