const pool = require('../config/db');

async function debugHarunNotifications() {
  try {
    console.log('🔍 Debugging Harun\'s notifications...');
    
    // Get Harun's user details
    const [harunUser] = await pool.query('SELECT * FROM users WHERE username = ?', ['harun']);
    console.log('\nHarun\'s user record:');
    console.log(harunUser);
    
    if (harunUser.length === 0) {
      console.log('❌ Harun user not found!');
      return;
    }
    
    const harunUserId = harunUser[0].user_id;
    console.log(`\nHarun\'s user_id: ${harunUserId}`);
    
    // Get all notifications for Harun
    const [harunNotifications] = await pool.query(`
      SELECT * FROM notifications WHERE user_id = ?
    `, [harunUserId]);
    
    console.log('\nAll notifications for Harun:');
    console.log('============================');
    console.log(harunNotifications);
    
    // Check if there are any notifications at all
    const [allNotifications] = await pool.query('SELECT * FROM notifications');
    console.log('\nTotal notifications in database:', allNotifications.length);
    
    // Check user-employee mapping for Harun
    const [harunEmployee] = await pool.query(`
      SELECT u.user_id, u.username, u.employee_id, e.name as employee_name, e.employee_id as emp_id
      FROM users u 
      LEFT JOIN employees e ON u.employee_id = e.employee_id 
      WHERE u.username = 'harun'
    `);
    
    console.log('\nHarun\'s employee mapping:');
    console.log('==========================');
    console.log(harunEmployee);
    
    // Test the notification creation function
    console.log('\n🧪 Testing notification creation for Harun...');
    
    const testTaskData = {
      title: "Test Task for Harun",
      description: "This is a test task"
    };
    
    const testAssignedUsers = [
      { value: "3", label: "Harun Mohamud Ahmed" } // Harun's employee_id is 3
    ];
    
    try {
      const { createTaskAssignmentNotification } = require('../controllers/notificationsController');
      const notifications = await createTaskAssignmentNotification(testTaskData, testAssignedUsers);
      console.log('\n✅ Test notification creation result:');
      console.log(notifications);
    } catch (error) {
      console.log('\n❌ Error creating test notification:');
      console.log(error);
    }
    
  } catch (error) {
    console.error('Error debugging Harun\'s notifications:', error);
  } finally {
    await pool.end();
  }
}

// Run the debug
if (require.main === module) {
  debugHarunNotifications()
    .then(() => {
      console.log('\nDebug completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Debug failed:', error);
      process.exit(1);
    });
}

module.exports = { debugHarunNotifications }; 