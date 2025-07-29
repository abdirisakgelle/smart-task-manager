require('dotenv').config();
const pool = require('../config/db');

async function initTasks() {
  try {
    console.log('Initializing Tasks system...');

    // Create tasks table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        task_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to INT NOT NULL,         -- FK to employees.employee_id
        created_by INT NOT NULL,          -- FK to users.user_id
        status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        due_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES employees(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('✅ tasks table created');

    // Create sms_logs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sms_logs (
        sms_id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_id INT NOT NULL,              -- FK to employees.employee_id
        phone VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('Sent', 'Failed') DEFAULT 'Sent',
        related_task_id INT,                    -- FK to tasks.task_id
        sent_by INT,                            -- FK to users.user_id
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (related_task_id) REFERENCES tasks(task_id) ON DELETE SET NULL,
        FOREIGN KEY (sent_by) REFERENCES users(user_id) ON DELETE SET NULL
      )
    `);
    console.log('✅ sms_logs table created');

    // Create indexes for performance (MySQL doesn't support IF NOT EXISTS for indexes)
    try {
      await pool.execute('CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to)');
    } catch (e) {
      console.log('Index idx_tasks_assigned_to already exists');
    }
    try {
      await pool.execute('CREATE INDEX idx_tasks_created_by ON tasks(created_by)');
    } catch (e) {
      console.log('Index idx_tasks_created_by already exists');
    }
    try {
      await pool.execute('CREATE INDEX idx_tasks_status ON tasks(status)');
    } catch (e) {
      console.log('Index idx_tasks_status already exists');
    }
    try {
      await pool.execute('CREATE INDEX idx_tasks_priority ON tasks(priority)');
    } catch (e) {
      console.log('Index idx_tasks_priority already exists');
    }
    try {
      await pool.execute('CREATE INDEX idx_tasks_due_date ON tasks(due_date)');
    } catch (e) {
      console.log('Index idx_tasks_due_date already exists');
    }
    try {
      await pool.execute('CREATE INDEX idx_tasks_created_at ON tasks(created_at)');
    } catch (e) {
      console.log('Index idx_tasks_created_at already exists');
    }
    try {
      await pool.execute('CREATE INDEX idx_sms_logs_recipient_id ON sms_logs(recipient_id)');
    } catch (e) {
      console.log('Index idx_sms_logs_recipient_id already exists');
    }
    try {
      await pool.execute('CREATE INDEX idx_sms_logs_related_task_id ON sms_logs(related_task_id)');
    } catch (e) {
      console.log('Index idx_sms_logs_related_task_id already exists');
    }
    try {
      await pool.execute('CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at)');
    } catch (e) {
      console.log('Index idx_sms_logs_sent_at already exists');
    }
    console.log('✅ Indexes created');

    console.log('🎉 Tasks system initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing Tasks system:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the initialization
initTasks().catch(console.error); 