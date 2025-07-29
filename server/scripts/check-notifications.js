const pool = require('../config/db');

async function checkNotifications() {
  try {
    console.log('Checking notifications table...');
    
    // Check if notifications table exists
    const [tables] = await pool.query('SHOW TABLES LIKE "notifications"');
    if (tables.length === 0) {
      console.log('Notifications table does not exist.');
      return;
    }
    
    // Get all notifications
    const [notifications] = await pool.query(`
      SELECT n.*, u.username 
      FROM notifications n 
      JOIN users u ON n.user_id = u.user_id 
      ORDER BY n.created_at DESC
    `);
    
    console.log('\nCurrent notifications in database:');
    console.log('==================================');
    
    if (notifications.length === 0) {
      console.log('No notifications found in database.');
    } else {
      notifications.forEach(notif => {
        console.log(`ID: ${notif.notification_id}, User: ${notif.username}, Title: ${notif.title}, Type: ${notif.type}, Read: ${notif.is_read}, Created: ${notif.created_at}`);
      });
    }
    
    // Check notifications for specific users
    console.log('\nNotifications by user:');
    console.log('======================');
    
    const [userNotifications] = await pool.query(`
      SELECT u.username, COUNT(*) as total_notifications, 
             SUM(CASE WHEN n.is_read = 0 THEN 1 ELSE 0 END) as unread_notifications
      FROM users u 
      LEFT JOIN notifications n ON u.user_id = n.user_id 
      GROUP BY u.user_id, u.username
      ORDER BY u.username
    `);
    
    userNotifications.forEach(user => {
      console.log(`${user.username}: ${user.total_notifications} total, ${user.unread_notifications} unread`);
    });
    
    // Check Harun specifically
    console.log('\n🔍 Harun\'s notifications:');
    console.log('========================');
    
    const [harunNotifications] = await pool.query(`
      SELECT n.*, u.username 
      FROM notifications n 
      JOIN users u ON n.user_id = u.user_id 
      WHERE u.username = 'harun'
      ORDER BY n.created_at DESC
    `);
    
    if (harunNotifications.length === 0) {
      console.log('No notifications found for Harun.');
    } else {
      harunNotifications.forEach(notif => {
        console.log(`- ${notif.title}: ${notif.message} (${notif.is_read ? 'Read' : 'Unread'})`);
      });
    }
    
    // Check recent task assignments
    console.log('\n📋 Recent task assignments (last 7 days):');
    console.log('==========================================');
    
    const [recentTasks] = await pool.query(`
      SELECT * FROM employee_assignments 
      WHERE assignment_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY assignment_date DESC
    `);
    
    if (recentTasks.length === 0) {
      console.log('No recent task assignments found.');
    } else {
      recentTasks.forEach(task => {
        console.log(`- Employee ID: ${task.employee_id}, Project: ${task.project_name}, Date: ${task.assignment_date}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking notifications:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
if (require.main === module) {
  checkNotifications()
    .then(() => {
      console.log('\nNotifications check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Notifications check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkNotifications }; 