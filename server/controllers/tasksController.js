const pool = require('../config/db');

// Get all tasks (with role-based filtering)
const getAllTasks = async (req, res) => {
  try {
    const { user_id, role, employee_id } = req.user;
    
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
    } else {
      // Managers, supervisors, and admins can see all tasks
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
    
    // Validate required fields
    if (!title || !assigned_to || !due_date) {
      return res.status(400).json({ 
        error: 'Title, assigned_to, and due_date are required' 
      });
    }
    
    // Validate role permissions
    if (role === 'user') {
      return res.status(403).json({ 
        error: 'Only managers and supervisors can assign tasks' 
      });
    }
    
    // Validate due date is not in the past
    const dueDate = new Date(due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      return res.status(400).json({ 
        error: 'Due date cannot be in the past' 
      });
    }
    
    // Insert the task
    const [result] = await pool.execute(
      `INSERT INTO tasks (title, description, assigned_to, created_by, priority, due_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, assigned_to, user_id, priority || 'Medium', due_date]
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
    const noticeMessage = `📌 You've been assigned a new task: '${title}' (Due: ${new Date(due_date).toLocaleDateString()})`;
    
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

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getSmsLogs,
  getTaskStats
}; 