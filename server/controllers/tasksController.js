import pool from '../config/db.js';

// Get all tasks (with role-based filtering)
const getAllTasks = async (req, res) => {
  try {
    const { user_id, role, employee_id } = req.user;
    const { sectionId } = req.dataScope || {};
    
    let query = `
      SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
    `;
    
    // Role-based filtering
    if (role === 'user') {
      // Regular employees can only see tasks assigned to them
      query += ` WHERE t.assigned_to = ?`;
      const [tasks] = await pool.execute(query, [employee_id]);
      res.json(tasks);
    } else if ((role === 'manager' || role === 'media') && sectionId) {
      // Section managers and media users can see tasks assigned to their team members
      query += ` WHERE e.section_id = ?`;
      const [tasks] = await pool.execute(query, [sectionId]);
      res.json(tasks);
    } else {
      // Admins and other roles can see all tasks
      const [tasks] = await pool.execute(query);
      res.json(tasks);
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role, employee_id } = req.user;
    
    let query = `
      SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      WHERE t.task_id = ?
    `;
    
    const [tasks] = await pool.execute(query, [id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = tasks[0];
    
    // Check if user has permission to view this task
    if (role === 'user' && task.assigned_to !== employee_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, priority, due_date, send_sms = false } = req.body;
    const { user_id, role } = req.user;
    const { sectionId } = req.dataScope || {};
    
    // Validate required fields
    if (!title || !assigned_to || !due_date) {
      return res.status(400).json({ 
        error: 'Title, assigned_to, and due_date are required' 
      });
    }
    
    // Validate role permissions
    if (role === 'user') {
      return res.status(403).json({ 
        error: 'Only managers, supervisors, and media users can assign tasks' 
      });
    }
    
    // For Section Managers and Media users, validate that they can only assign tasks to their team members
    if ((role === 'manager' || role === 'media') && sectionId) {
      const [teamMembers] = await pool.execute(
        'SELECT employee_id FROM employees WHERE section_id = ?',
        [sectionId]
      );
      
      const teamMemberIds = teamMembers.map(member => member.employee_id);
      if (!teamMemberIds.includes(parseInt(assigned_to))) {
        return res.status(403).json({ 
          error: 'You can only assign tasks to members of your section' 
        });
      }
    }
    
    // Validate due date is not in the past
    const dueDate = new Date(due_date);
    const now = new Date();
    
    if (dueDate < now) {
      return res.status(400).json({ 
        error: 'Due date and time cannot be in the past' 
      });
    }
    
    // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    // The due_date is already in the format YYYY-MM-DDTHH:MM:SS, just replace T with space
    const mysqlDateTime = due_date.replace('T', ' ');
    
    console.log('🔍 Backend Debug:', {
      dueDate: dueDate,
      due_date: due_date,
      mysqlDateTime: mysqlDateTime
    });
    
    // Insert the task
    const [result] = await pool.execute(
      `INSERT INTO tasks (title, description, assigned_to, created_by, priority, due_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, assigned_to, user_id, priority || 'Medium', mysqlDateTime]
    );
    
    const task_id = result.insertId;
    
    // Get employee details for notice and SMS
    const [employees] = await pool.execute(
      'SELECT name, phone FROM employees WHERE employee_id = ?',
      [assigned_to]
    );
    
    if (employees.length === 0) {
      return res.status(400).json({ error: 'Assigned employee not found' });
    }
    
    const employee = employees[0];
    
    // Create notice for the assigned employee
    const noticeMessage = `📌 You've been assigned a new task: '${title}' (Due: ${new Date(due_date).toLocaleString()})`;
    
    // Get the user_id for the assigned employee
    const [userResult] = await pool.execute(
      'SELECT user_id FROM users WHERE employee_id = ?',
      [assigned_to]
    );
    
    if (userResult.length > 0) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type, related_id, related_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userResult[0].user_id, 'New Task Assignment', noticeMessage, 'task_assignment', task_id, 'task']
      );
    }
    
    // Send SMS if requested and phone number exists
    if (send_sms && employee.phone) {
      try {
        const smsMessage = `Hi ${employee.name}, you've been assigned a new task: ${title}. Check your tasks page.`;
        
        // Log SMS attempt
        await pool.execute(
          'INSERT INTO sms_logs (recipient_id, phone, message, status, related_task_id, sent_by) VALUES (?, ?, ?, ?, ?, ?)',
          [assigned_to, employee.phone, smsMessage, 'Sent', task_id, user_id]
        );
        
        // In a real implementation, you would integrate with an SMS service here
        console.log(`SMS sent to ${employee.phone}: ${smsMessage}`);
        
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        // Log SMS failure
        await pool.execute(
          'INSERT INTO sms_logs (recipient_id, phone, message, status, related_task_id, sent_by) VALUES (?, ?, ?, ?, ?, ?)',
          [assigned_to, employee.phone, `Hi ${employee.name}, you've been assigned a new task: ${title}. Check your tasks page.`, 'Failed', task_id, user_id]
        );
      }
    }
    
    // Add timeline event for task creation
    await pool.execute(
      `INSERT INTO task_timeline (task_id, user_id, event_type, old_value, new_value, description) 
       VALUES (?, ?, 'created', NULL, ?, ?)`,
      [task_id, user_id, 'Not Started', `Task created and assigned to ${employee.name}`]
    );
    
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
      [task_id]
    );
    
    res.status(201).json(createdTask[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, priority, status, due_date } = req.body;
    const { user_id, role, employee_id } = req.user;
    const { sectionId } = req.dataScope || {};
    
    // Check if task exists and user has permission
    const [existingTasks] = await pool.execute(
      'SELECT * FROM tasks WHERE task_id = ?',
      [id]
    );
    
    if (existingTasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const existingTask = existingTasks[0];
    
    // Check permissions
    if (role === 'user' && existingTask.assigned_to !== employee_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // For Section Managers and Media users, validate that they can only manage tasks within their section
    if ((role === 'manager' || role === 'media') && sectionId) {
      // Check if the existing task is assigned to someone in their section
      const [existingTaskEmployee] = await pool.execute(
        'SELECT section_id FROM employees WHERE employee_id = ?',
        [existingTask.assigned_to]
      );
      
      if (existingTaskEmployee.length === 0 || existingTaskEmployee[0].section_id !== sectionId) {
        return res.status(403).json({ 
          error: 'You can only manage tasks assigned to members of your section' 
        });
      }
      
      // If reassigning, validate the new assignee is also in their section
      if (assigned_to && assigned_to !== existingTask.assigned_to) {
        const [newAssignee] = await pool.execute(
          'SELECT section_id FROM employees WHERE employee_id = ?',
          [assigned_to]
        );
        
        if (newAssignee.length === 0 || newAssignee[0].section_id !== sectionId) {
          return res.status(403).json({ 
            error: 'You can only reassign tasks to members of your section' 
          });
        }
      }
    }
    
    // Only managers/supervisors can change assignee
    if (role === 'user' && assigned_to && assigned_to !== existingTask.assigned_to) {
      return res.status(403).json({ 
        error: 'Only managers can reassign tasks' 
      });
    }
    
    // Update the task
    const [result] = await pool.execute(
      `UPDATE tasks 
       SET title = ?, description = ?, assigned_to = ?, priority = ?, status = ?, due_date = ?
       WHERE task_id = ?`,
      [title, description, assigned_to, priority, status, due_date, id]
    );
    
    // Get updated task
    const [updatedTasks] = await pool.execute(
      `SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      WHERE t.task_id = ?`,
      [id]
    );
    
    res.json(updatedTasks[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role, employee_id } = req.user;
    
    // Check if task exists and user has permission
    const [existingTasks] = await pool.execute(
      'SELECT * FROM tasks WHERE task_id = ?',
      [id]
    );
    
    if (existingTasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const existingTask = existingTasks[0];
    
    // Only managers and admins can delete tasks
    if (role === 'user') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await pool.execute('DELETE FROM tasks WHERE task_id = ?', [id]);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Get SMS logs (admin/manager only)
const getSmsLogs = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    
    // Only managers and admins can view SMS logs
    if (role === 'user') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const [logs] = await pool.execute(`
      SELECT 
        sl.*,
        e.name as recipient_name,
        u.username as sent_by_name,
        t.title as task_title
      FROM sms_logs sl
      JOIN employees e ON sl.recipient_id = e.employee_id
      LEFT JOIN users u ON sl.sent_by = u.user_id
      LEFT JOIN tasks t ON sl.related_task_id = t.task_id
      ORDER BY sl.sent_at DESC 
      LIMIT 100
    `);
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    res.status(500).json({ error: 'Failed to fetch SMS logs' });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const { user_id, role, employee_id } = req.user;
    
    let whereClause = '';
    let params = [];
    
    if (role === 'user') {
      whereClause = 'WHERE assigned_to = ?';
      params = [employee_id];
    }
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'Not Started' THEN 1 ELSE 0 END) as not_started,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as high_priority_count,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'Completed' THEN 1 ELSE 0 END) as overdue
      FROM tasks
      ${whereClause}
    `, params);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
};

// Get my tasks (for regular users)
const getMyTasks = async (req, res) => {
  try {
    const { user_id, role, employee_id } = req.user;
    
    // Only regular users (non-admin, non-manager) can access this endpoint
    if (role === 'admin' || role === 'manager') {
      return res.status(403).json({ error: 'Use the main tasks endpoint for admin/manager access' });
    }
    
    const [tasks] = await pool.execute(`
      SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      WHERE t.assigned_to = ?
      ORDER BY t.due_date ASC, t.priority DESC
    `, [employee_id]);
    
    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Update task status (for regular users)
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { user_id, role, employee_id } = req.user;
    
    // Validate status and map to database values
    const statusMapping = {
      'pending': 'Not Started',
      'in_progress': 'In Progress', 
      'completed': 'Completed'
    };
    
    if (!statusMapping[status]) {
      return res.status(400).json({ error: 'Invalid status. Allowed values: pending, in_progress, completed' });
    }
    
    const dbStatus = statusMapping[status];
    
    // Check if task exists and is assigned to the user
    const [existingTasks] = await pool.execute(
      'SELECT * FROM tasks WHERE task_id = ? AND assigned_to = ?',
      [id, employee_id]
    );
    
    if (existingTasks.length === 0) {
      return res.status(404).json({ error: 'Task not found or not assigned to you' });
    }
    
    // Get the old status for timeline tracking
    const [oldTask] = await pool.execute(
      'SELECT status FROM tasks WHERE task_id = ?',
      [id]
    );
    
    const oldStatus = oldTask[0]?.status || 'Not Started';
    
    // Update the task status
    await pool.execute(
      'UPDATE tasks SET status = ?, updated_at = NOW() WHERE task_id = ?',
      [dbStatus, id]
    );
    
    // Add timeline event for status change
    await pool.execute(
      `INSERT INTO task_timeline (task_id, user_id, event_type, old_value, new_value, description) 
       VALUES (?, ?, 'status_changed', ?, ?, ?)`,
      [id, user_id, oldStatus, dbStatus, `Status changed from ${oldStatus} to ${dbStatus}`]
    );
    
    res.json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

// Get task timeline (for admins and managers)
const getTaskTimeline = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { user_id, role } = req.user;
    
    // Check if user has permission to view this task
    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({ error: 'Access denied. Only admins and managers can view task timeline.' });
    }
    
    // Get timeline events for the task
    const [timeline] = await pool.execute(`
      SELECT 
        tt.*,
        u.username as user_name,
        u.role as user_role
      FROM task_timeline tt
      JOIN users u ON tt.user_id = u.user_id
      WHERE tt.task_id = ?
      ORDER BY tt.created_at DESC
    `, [taskId]);
    
    res.json({ timeline });
  } catch (error) {
    console.error('Error fetching task timeline:', error);
    res.status(500).json({ error: 'Failed to fetch task timeline' });
  }
};

// Request task extension
const requestExtension = async (req, res) => {
  try {
    const { id } = req.params;
    const { extension_reason, requested_due_date } = req.body;
    const { user_id, role, employee_id } = req.user;
    
    // Validate required fields
    if (!extension_reason || !requested_due_date) {
      return res.status(400).json({ 
        error: 'Extension reason and requested due date are required' 
      });
    }
    
    // Check if task exists and is assigned to the user
    const [existingTasks] = await pool.execute(
      'SELECT * FROM tasks WHERE task_id = ? AND assigned_to = ?',
      [id, employee_id]
    );
    
    if (existingTasks.length === 0) {
      return res.status(404).json({ error: 'Task not found or not assigned to you' });
    }
    
    const existingTask = existingTasks[0];
    
    // Check if task is already completed
    if (existingTask.status === 'Completed') {
      return res.status(400).json({ error: 'Cannot request extension for completed tasks' });
    }
    
    // Check if extension is already requested
    if (existingTask.extension_requested) {
      return res.status(400).json({ error: 'Extension already requested for this task' });
    }
    
    // Validate requested due date is in the future
    const requestedDate = new Date(requested_due_date);
    const now = new Date();
    
    if (requestedDate <= now) {
      return res.status(400).json({ 
        error: 'Requested due date must be in the future' 
      });
    }
    
    // Update the task with extension request
    await pool.execute(
      `UPDATE tasks 
       SET extension_requested = TRUE, 
           extension_reason = ?, 
           requested_due_date = ?, 
           extension_status = 'Pending',
           updated_at = NOW()
       WHERE task_id = ?`,
      [extension_reason, requested_due_date, id]
    );
    
    // Add timeline event for extension request
    await pool.execute(
      `INSERT INTO task_timeline (task_id, user_id, event_type, old_value, new_value, description) 
       VALUES (?, ?, 'extension_requested', ?, ?, ?)`,
      [id, user_id, existingTask.due_date, requested_due_date, `Extension requested: ${extension_reason}`]
    );
    
    // Get updated task
    const [updatedTasks] = await pool.execute(
      `SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      WHERE t.task_id = ?`,
      [id]
    );
    
    res.json(updatedTasks[0]);
  } catch (error) {
    console.error('Error requesting extension:', error);
    res.status(500).json({ error: 'Failed to request extension' });
  }
};

// Mark task as completed with optional comment
const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { completion_comment } = req.body;
    const { user_id, role, employee_id } = req.user;
    
    // Check if task exists and is assigned to the user
    const [existingTasks] = await pool.execute(
      'SELECT * FROM tasks WHERE task_id = ? AND assigned_to = ?',
      [id, employee_id]
    );
    
    if (existingTasks.length === 0) {
      return res.status(404).json({ error: 'Task not found or not assigned to you' });
    }
    
    const existingTask = existingTasks[0];
    
    // Check if task is already completed
    if (existingTask.status === 'Completed') {
      return res.status(400).json({ error: 'Task is already completed' });
    }
    
    // Update the task status to completed
    await pool.execute(
      `UPDATE tasks 
       SET status = 'Completed', 
           completion_comment = ?,
           updated_at = NOW()
       WHERE task_id = ?`,
      [completion_comment || null, id]
    );
    
    // Add timeline event for task completion
    await pool.execute(
      `INSERT INTO task_timeline (task_id, user_id, event_type, old_value, new_value, description) 
       VALUES (?, ?, 'completed', ?, ?, ?)`,
      [id, user_id, existingTask.status, 'Completed', `Task completed${completion_comment ? `: ${completion_comment}` : ''}`]
    );
    
    // Get updated task
    const [updatedTasks] = await pool.execute(
      `SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      WHERE t.task_id = ?`,
      [id]
    );
    
    res.json(updatedTasks[0]);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
};

// Approve or reject extension request (managers/admins only)
const approveExtension = async (req, res) => {
  try {
    const { id } = req.params;
    const { extension_status } = req.body;
    const { user_id, role } = req.user;
    
    // Only managers and admins can approve/reject extensions
    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({ error: 'Access denied. Only managers and admins can approve extensions.' });
    }
    
    // Validate extension status
    if (!['Approved', 'Rejected'].includes(extension_status)) {
      return res.status(400).json({ error: 'Invalid extension status. Must be "Approved" or "Rejected"' });
    }
    
    // Check if task exists and has a pending extension request
    const [existingTasks] = await pool.execute(
      'SELECT * FROM tasks WHERE task_id = ? AND extension_requested = TRUE AND extension_status = "Pending"',
      [id]
    );
    
    if (existingTasks.length === 0) {
      return res.status(404).json({ error: 'Task not found or no pending extension request' });
    }
    
    const existingTask = existingTasks[0];
    
    // Update the task extension status
    let updateQuery = `UPDATE tasks SET extension_status = ?, updated_at = NOW()`;
    let updateParams = [extension_status];
    
    // If approved, update the due date to the requested date
    if (extension_status === 'Approved') {
      updateQuery += `, due_date = ?`;
      updateParams.push(existingTask.requested_due_date);
    }
    
    updateQuery += ` WHERE task_id = ?`;
    updateParams.push(id);
    
    await pool.execute(updateQuery, updateParams);
    
    // Add timeline event for extension approval/rejection
    await pool.execute(
      `INSERT INTO task_timeline (task_id, user_id, event_type, old_value, new_value, description) 
       VALUES (?, ?, 'extension_${extension_status.toLowerCase()}', ?, ?, ?)`,
      [id, user_id, 'Pending', extension_status, `Extension ${extension_status.toLowerCase()}`]
    );
    
    // Get updated task
    const [updatedTasks] = await pool.execute(
      `SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      WHERE t.task_id = ?`,
      [id]
    );
    
    res.json(updatedTasks[0]);
  } catch (error) {
    console.error('Error approving extension:', error);
    res.status(500).json({ error: 'Failed to approve extension' });
  }
};

// Get tasks created from ideas
const getTasksFromIdeas = async (req, res) => {
  try {
    const { user_id, role, employee_id } = req.user;
    
    let query = `
      SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name,
        i.title as idea_title,
        i.status as idea_status,
        i.submission_date as idea_submission_date
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      LEFT JOIN ideas i ON t.source_id = i.idea_id
      WHERE t.source_module = 'ideas'
    `;
    
    let params = [];
    
    // Role-based filtering
    if (role === 'user') {
      // Regular employees can only see tasks assigned to them
      query += ` AND t.assigned_to = ?`;
      params.push(employee_id);
    }
    
    query += ` ORDER BY t.created_at DESC`;
    
    const [tasks] = await pool.execute(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks from ideas:', error);
    res.status(500).json({ error: 'Failed to fetch tasks from ideas' });
  }
};

// Get task by source (for any module)
const getTasksBySource = async (req, res) => {
  try {
    const { source_module, source_id } = req.params;
    const { user_id, role, employee_id } = req.user;
    
    let query = `
      SELECT 
        t.*,
        e.name as assigned_to_name,
        u.username as created_by_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
      JOIN users u ON t.created_by = u.user_id
      WHERE t.source_module = ? AND t.source_id = ?
    `;
    
    let params = [source_module, source_id];
    
    // Role-based filtering
    if (role === 'user') {
      // Regular employees can only see tasks assigned to them
      query += ` AND t.assigned_to = ?`;
      params.push(employee_id);
    }
    
    const [tasks] = await pool.execute(query, params);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'No tasks found for this source' });
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by source:', error);
    res.status(500).json({ error: 'Failed to fetch tasks by source' });
  }
};

// Get task statistics including source breakdown
const getTaskStatsWithSource = async (req, res) => {
  try {
    const { user_id, role, employee_id } = req.user;
    
    let whereClause = '';
    let params = [];
    
    if (role === 'user') {
      whereClause = 'WHERE assigned_to = ?';
      params = [employee_id];
    }
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'Not Started' THEN 1 ELSE 0 END) as not_started,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as high_priority_count,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'Completed' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN source_module = 'ideas' THEN 1 ELSE 0 END) as from_ideas,
        SUM(CASE WHEN source_module IS NULL THEN 1 ELSE 0 END) as manual_tasks
      FROM tasks
      ${whereClause}
    `, params);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching task stats with source:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
};

// Get team members for Section Managers and Media users
const getTeamMembers = async (req, res) => {
  try {
    const { role } = req.user;
    const { sectionId } = req.dataScope || {};
    
    // Only Section Managers and Media users can access this endpoint
    if (role !== 'manager' && role !== 'media') {
      return res.status(403).json({ error: 'Access denied. Only Section Managers and Media users can view team members.' });
    }
    
    if (!sectionId) {
      return res.status(403).json({ error: 'Section ID required for manager access' });
    }
    
    // Get all employees in the manager's section
    const [teamMembers] = await pool.execute(`
      SELECT 
        e.employee_id,
        e.name,
        e.email,
        e.phone,
        e.job_title,
        e.department,
        e.section_id,
        u.user_id,
        u.username,
        u.role as user_role
      FROM employees e
      LEFT JOIN users u ON e.employee_id = u.employee_id
      WHERE e.section_id = ?
      ORDER BY e.name ASC
    `, [sectionId]);
    
    res.json({ teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

export {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getSmsLogs,
  getTaskStats,
  getMyTasks,
  updateTaskStatus,
  getTaskTimeline,
  requestExtension,
  completeTask,
  approveExtension,
  getTasksFromIdeas,
  getTasksBySource,
  getTaskStatsWithSource,
  getTeamMembers
}; 