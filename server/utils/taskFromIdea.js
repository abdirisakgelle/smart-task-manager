const pool = require('../config/db');

/**
 * Creates a task automatically from an idea submission
 * @param {Object} ideaData - The idea data object
 * @param {number} ideaId - The ID of the created idea
 * @param {number} createdByUserId - The user ID who created the idea
 * @returns {Promise<Object>} The created task object
 */
async function createTaskFromIdea(ideaData, ideaId, createdByUserId) {
  try {
    const {
      title,
      script_writer_id,
      priority,
      script_deadline,
      notes
    } = ideaData;

    // Map idea priority to task priority
    const priorityMapping = {
      'low': 'Low',
      'medium': 'Medium', 
      'high': 'High'
    };
    
    const taskPriority = priorityMapping[priority] || 'Medium';

    // Create task title with prefix
    const taskTitle = `Script: ${title}`;

    // Convert script_deadline to datetime format if it exists
    let dueDate = null;
    if (script_deadline) {
      // If script_deadline is just a date, convert to datetime
      if (script_deadline.includes('T')) {
        dueDate = script_deadline.replace('T', ' ');
      } else {
        // Add time to date (default to end of day)
        dueDate = `${script_deadline} 23:59:59`;
      }
    } else {
      // Default to 7 days from now if no deadline specified
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      dueDate = defaultDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    // Insert the task
    const [result] = await pool.execute(
      `INSERT INTO tasks (
        title, 
        description, 
        assigned_to, 
        created_by, 
        priority, 
        due_date,
        source_module,
        source_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskTitle,
        notes || `Task created from idea: ${title}`,
        script_writer_id,
        createdByUserId,
        taskPriority,
        dueDate,
        'ideas',
        ideaId
      ]
    );

    const taskId = result.insertId;

    // Get employee details for notification
    const [employees] = await pool.execute(
      'SELECT name, phone FROM employees WHERE employee_id = ?',
      [script_writer_id]
    );

    if (employees.length > 0) {
      const employee = employees[0];

      // Create notification for the assigned employee
      const noticeMessage = `📝 New script task assigned from idea: "${title}" (Due: ${new Date(dueDate).toLocaleString()})`;
      
      // Get the user_id for the assigned employee
      const [userResult] = await pool.execute(
        'SELECT user_id FROM users WHERE employee_id = ?',
        [script_writer_id]
      );
      
      if (userResult.length > 0) {
        await pool.execute(
          `INSERT INTO notifications (user_id, title, message, type, related_id, related_type) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userResult[0].user_id, 'New Script Task', noticeMessage, 'task_assignment', taskId, 'task']
        );
      }

      // Add timeline event for task creation
      await pool.execute(
        `INSERT INTO task_timeline (task_id, user_id, event_type, old_value, new_value, description) 
         VALUES (?, ?, 'created', NULL, ?, ?)`,
        [taskId, createdByUserId, 'Not Started', `Task created from idea "${title}" and assigned to ${employee.name}`]
      );
    }

    // Get the created task with employee details
    const [createdTask] = await pool.execute(
      `SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      WHERE t.task_id = ?`,
      [taskId]
    );

    console.log(`✅ Task created from idea ${ideaId}: ${taskTitle}`);
    return createdTask[0];

  } catch (error) {
    console.error('❌ Error creating task from idea:', error);
    throw error;
  }
}

/**
 * Gets tasks that were created from ideas
 * @param {string} sourceModule - The source module (default: 'ideas')
 * @returns {Promise<Array>} Array of tasks with source information
 */
async function getTasksFromIdeas(sourceModule = 'ideas') {
  try {
    const [tasks] = await pool.execute(`
      SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name,
        i.title as idea_title,
        i.status as idea_status
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      LEFT JOIN ideas i ON t.source_id = i.idea_id
      WHERE t.source_module = ?
      ORDER BY t.created_at DESC
    `, [sourceModule]);

    return tasks;
  } catch (error) {
    console.error('❌ Error fetching tasks from ideas:', error);
    throw error;
  }
}

/**
 * Gets a specific task created from an idea
 * @param {number} ideaId - The idea ID
 * @returns {Promise<Object|null>} The task object or null if not found
 */
async function getTaskFromIdea(ideaId) {
  try {
    const [tasks] = await pool.execute(`
      SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name,
        i.title as idea_title,
        i.status as idea_status
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      LEFT JOIN ideas i ON t.source_id = i.idea_id
      WHERE t.source_module = 'ideas' AND t.source_id = ?
    `, [ideaId]);

    return tasks.length > 0 ? tasks[0] : null;
  } catch (error) {
    console.error('❌ Error fetching task from idea:', error);
    throw error;
  }
}

module.exports = {
  createTaskFromIdea,
  getTasksFromIdeas,
  getTaskFromIdea
}; 