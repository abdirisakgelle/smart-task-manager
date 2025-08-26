const pool = require('../config/db');

async function createTimelineTable() {
  try {
    console.log('Creating task_timeline table...');
    
    // Create the timeline table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS task_timeline (
        timeline_id INT PRIMARY KEY AUTO_INCREMENT,
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        event_type ENUM('created', 'status_changed', 'assigned', 'reassigned', 'commented', 'due_date_changed') NOT NULL,
        old_value VARCHAR(255),
        new_value VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        
        INDEX idx_task_id (task_id),
        INDEX idx_created_at (created_at),
        INDEX idx_event_type (event_type)
      )
    `);
    
    console.log('✅ Task timeline table created successfully');
    
    // Insert initial timeline events for existing tasks
    console.log('Inserting initial timeline events for existing tasks...');
    
    const [existingTasks] = await pool.execute(`
      SELECT 
        t.task_id,
        t.created_by,
        t.status,
        e.name as employee_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.employee_id
    `);
    
    for (const task of existingTasks) {
      // Insert creation event
      await pool.execute(`
        INSERT INTO task_timeline (task_id, user_id, event_type, old_value, new_value, description)
        VALUES (?, ?, 'created', NULL, ?, ?)
      `, [task.task_id, task.created_by, task.status, `Task created and assigned to ${task.employee_name}`]);
      
      // Insert status change event if status is not "Not Started"
      if (task.status !== 'Not Started') {
        await pool.execute(`
          INSERT INTO task_timeline (task_id, user_id, event_type, old_value, new_value, description)
          VALUES (?, ?, 'status_changed', 'Not Started', ?, ?)
        `, [task.task_id, task.created_by, task.status, `Status changed to ${task.status}`]);
      }
    }
    
    console.log(`✅ Inserted timeline events for ${existingTasks.length} existing tasks`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating timeline table:', error);
    process.exit(1);
  }
}

createTimelineTable(); 