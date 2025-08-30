import pool from '../config/db.js';

// Internal helper function to create notifications
export const createNotificationInternal = async (notificationData) => {
  const { user_id, title, message, type, related_id, related_type } = notificationData;
  if (!user_id || !title || !message) {
    throw new Error('user_id, title, and message are required');
  }
  
  const [result] = await pool.query(
    'INSERT INTO notifications (user_id, title, message, type, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, title, message, type || 'task_assignment', related_id || null, related_type || null]
  );
  
  return {
    notification_id: result.insertId,
    user_id,
    title,
    message,
    type: type || 'task_assignment',
    related_id: related_id || null,
    related_type: related_type || null,
    is_read: false,
    created_at: new Date()
  };
};

// Create a new notification (API endpoint)
export const createNotification = async (req, res) => {
  try {
    const notification = await createNotificationInternal(req.body);
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  const { user_id } = req.params;
  const { limit = 50, offset = 0, unread_only = false } = req.query;
  
  try {
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    let params = [user_id];
    
    if (unread_only === 'true') {
      query += ' AND is_read = FALSE';
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get unread notification count for a user
export const getUnreadCount = async (req, res) => {
  const { user_id } = req.params;
  
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [user_id]
    );
    res.json({ unread_count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  const { notification_id } = req.params;
  
  try {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = ?',
      [notification_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
  const { user_id } = req.params;
  
  try {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [user_id]
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      updated_count: result.affectedRows 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  const { notification_id } = req.params;
  
  try {
    const [result] = await pool.query(
      'DELETE FROM notifications WHERE notification_id = ?',
      [notification_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manual cleanup endpoint
export const manualCleanup = async (req, res) => {
  try {
    const { cleanupNotifications } = require('../scripts/cleanup-notifications');
    await cleanupNotifications();
    
    res.json({ 
      message: 'Manual notification cleanup completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create task assignment notification
export const createTaskAssignmentNotification = async (taskData, assignedUsers) => {
  try {
    const notifications = [];
    
    for (const user of assignedUsers) {
      // Find the user_id for this employee
      const [userRows] = await pool.query(
        'SELECT user_id FROM users WHERE employee_id = ?',
        [user.value]
      );
      
      if (userRows.length > 0) {
        const user_id = userRows[0].user_id;
        const title = 'New Task Assignment';
        const message = `You have been assigned to the task: "${taskData.title}". Please review and start working on it.`;
        
        const [result] = await pool.query(
          'INSERT INTO notifications (user_id, title, message, type, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
          [user_id, title, message, 'task_assignment', null, 'task']
        );
        
        notifications.push({
          notification_id: result.insertId,
          user_id,
          title,
          message,
          type: 'task_assignment',
          is_read: false,
          created_at: new Date()
        });
      }
    }
    
    return notifications;
  } catch (err) {
    console.error('Error creating task assignment notifications:', err);
    throw err;
  }
};

// Get notifications for current user (from JWT token)
export const getCurrentUserNotifications = async (req, res) => {
  const user_id = req.user.user_id;
  const { limit = 50, offset = 0, unread_only = false } = req.query;
  
  try {
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    let params = [user_id];
    
    if (unread_only === 'true') {
      query += ' AND is_read = FALSE';
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get unread count for current user
export const getCurrentUserUnreadCount = async (req, res) => {
  const user_id = req.user.user_id;
  
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [user_id]
    );
    res.json({ unread_count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create task assignment notifications (API endpoint)
export const createTaskAssignmentNotifications = async (req, res) => {
  const { taskData, assignedUsers } = req.body;
  
  if (!taskData || !assignedUsers || !Array.isArray(assignedUsers)) {
    return res.status(400).json({ error: 'taskData and assignedUsers array are required' });
  }
  
  try {
    const notifications = await exports.createTaskAssignmentNotification(taskData, assignedUsers);
    res.status(201).json({
      message: 'Task assignment notifications created successfully',
      notifications_created: notifications.length,
      notifications
    });
  } catch (err) {
    console.error('Error creating task assignment notifications:', err);
    res.status(500).json({ error: err.message });
  }
}; 