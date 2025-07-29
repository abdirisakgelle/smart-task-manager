const pool = require('../config/db');

async function initNotifications() {
  try {
    console.log('Initializing notifications table...');
    
    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('task_assignment', 'task_update', 'task_completion', 'system') DEFAULT 'task_assignment',
        related_id INT NULL,
        related_type VARCHAR(50) NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes for performance (ignore if they already exist)
    try {
      await pool.query('CREATE INDEX idx_notifications_user_id ON notifications(user_id)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') throw error;
    }
    
    try {
      await pool.query('CREATE INDEX idx_notifications_is_read ON notifications(is_read)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') throw error;
    }
    
    try {
      await pool.query('CREATE INDEX idx_notifications_created_at ON notifications(created_at)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') throw error;
    }
    
    console.log('✅ Notifications table created successfully!');
    
    // Check if there are any users to create test notifications for
    const [users] = await pool.query('SELECT user_id, username FROM users LIMIT 3');
    
    if (users.length > 0) {
      console.log('Creating sample notifications...');
      
      // Create sample notifications for the first user
      const sampleNotifications = [
        {
          user_id: users[0].user_id,
          title: 'Welcome to Smart Task Manager!',
          message: 'You have successfully logged in to the system. You will receive notifications here when tasks are assigned to you.',
          type: 'system'
        },
        {
          user_id: users[0].user_id,
          title: 'Sample Task Assignment',
          message: 'This is a sample notification for a task assignment. You can delete this notification.',
          type: 'task_assignment'
        }
      ];
      
      for (const notification of sampleNotifications) {
        await pool.query(
          'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [notification.user_id, notification.title, notification.message, notification.type]
        );
      }
      
      console.log(`✅ Created ${sampleNotifications.length} sample notifications for user: ${users[0].username}`);
    }
    
    console.log('🎉 Notifications system initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing notifications:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the initialization
if (require.main === module) {
  initNotifications()
    .then(() => {
      console.log('Notifications initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Notifications initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initNotifications }; 