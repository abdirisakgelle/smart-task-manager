const pool = require('../config/db');

// Get all boards with their tasks
exports.getAllBoards = async (req, res) => {
  try {
    console.log('🎯 Frontend boards request received');
    // Get all boards
    const [boards] = await pool.query('SELECT * FROM boards ORDER BY created_at DESC');
    
    // Get tasks for each board
    const boardsWithTasks = await Promise.all(
      boards.map(async (board) => {
        const [tasks] = await pool.query(
          'SELECT * FROM tasks WHERE board_id = ? ORDER BY created_at DESC',
          [board.id]
        );
        return { ...board, tasks };
      })
    );
    
    res.json(boardsWithTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new board
exports.createBoard = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO boards (title) VALUES (?)',
      [title]
    );
    
    const newBoard = {
      id: result.insertId,
      title,
      created_at: new Date()
    };
    
    res.status(201).json(newBoard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a board
exports.updateBoard = async (req, res) => {
  const { boardId } = req.params;
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    const [result] = await pool.query(
      'UPDATE boards SET title = ? WHERE id = ?',
      [title, boardId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json({ id: boardId, title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a board
exports.deleteBoard = async (req, res) => {
  const { boardId } = req.params;
  
  try {
    // Delete all tasks in the board first
    await pool.query('DELETE FROM tasks WHERE board_id = ?', [boardId]);
    
    // Delete the board
    const [result] = await pool.query('DELETE FROM boards WHERE id = ?', [boardId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  const { boardId } = req.params;
  const { title, priority, startDate, endDate, assign } = req.body;
  
  console.log('🎯 Frontend task creation request:');
  console.log('Board ID:', boardId);
  console.log('Task data:', { title, priority, startDate, endDate, assign });
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    // Check if board exists
    const [boards] = await pool.query('SELECT * FROM boards WHERE id = ?', [boardId]);
    if (boards.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    // Create the task
    const [result] = await pool.query(
      'INSERT INTO tasks (board_id, title, priority, start_date, end_date, assign_data) VALUES (?, ?, ?, ?, ?, ?)',
      [boardId, title, priority || 'medium', startDate, endDate, JSON.stringify(assign || [])]
    );
    
    const newTask = {
      id: result.insertId,
      board_id: boardId,
      title,
      priority: priority || 'medium',
      start_date: startDate,
      end_date: endDate,
      assign_data: JSON.stringify(assign || []),
      created_at: new Date()
    };
    
    // Create notifications for assigned users
    if (assign && assign.length > 0) {
      try {
        const { createTaskAssignmentNotification } = require('./notificationsController');
        await createTaskAssignmentNotification(newTask, assign);
        console.log('✅ Task assignment notifications created for task:', newTask.id);
      } catch (error) {
        console.error('❌ Error creating task assignment notifications:', error);
      }
    }
    
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  const { boardId, taskId } = req.params;
  const { title, priority, startDate, endDate, assign } = req.body;
  
  try {
    // Check if task exists
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND board_id = ?',
      [taskId, boardId]
    );
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Update the task
    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, priority = ?, start_date = ?, end_date = ?, assign_data = ? WHERE id = ?',
      [title, priority, startDate, endDate, JSON.stringify(assign || []), taskId]
    );
    
    const updatedTask = {
      id: taskId,
      board_id: boardId,
      title,
      priority,
      start_date: startDate,
      end_date: endDate,
      assign_data: JSON.stringify(assign || [])
    };
    
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  const { boardId, taskId } = req.params;
  
  try {
    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND board_id = ?',
      [taskId, boardId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 