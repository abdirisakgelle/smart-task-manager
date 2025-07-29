const pool = require('../config/db');

async function testCleanupWithOldNotifications() {
  try {
    console.log('🧪 Testing cleanup system with old notifications...');
    
    // Create some old notifications (more than 7 days old)
    console.log('\n📝 Creating old notifications for testing...');
    
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10); // 10 days ago
    
    const testOldNotifications = [
      {
        user_id: 5, // Harun
        title: 'Old Task Assignment',
        message: 'This is an old notification that should be cleaned up',
        type: 'task_assignment',
        created_at: oldDate
      },
      {
        user_id: 1, // Admin
        title: 'Old System Notification',
        message: 'This is an old system notification',
        type: 'system',
        created_at: oldDate
      },
      {
        user_id: 7, // Abdifitah
        title: 'Old Idea Assignment',
        message: 'This is an old idea assignment notification',
        type: 'idea_assignment',
        created_at: oldDate
      }
    ];
    
    for (const notification of testOldNotifications) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, ?, ?, ?, ?)',
        [notification.user_id, notification.title, notification.message, notification.type, notification.created_at]
      );
    }
    
    console.log('✅ Created 3 old notifications for testing');
    
    // Show current notifications
    console.log('\n📊 Current notifications before cleanup:');
    const [currentNotifications] = await pool.query(`
      SELECT n.*, u.username 
      FROM notifications n 
      JOIN users u ON n.user_id = u.user_id 
      ORDER BY n.created_at DESC 
      LIMIT 10
    `);
    
    currentNotifications.forEach(notif => {
      console.log(`- ID: ${notif.notification_id}, User: ${notif.username}, Title: "${notif.title}", Created: ${notif.created_at}`);
    });
    
    // Run the cleanup
    console.log('\n🧹 Running cleanup...');
    const { cleanupNotifications } = require('./cleanup-notifications');
    await cleanupNotifications();
    
    // Show notifications after cleanup
    console.log('\n📊 Notifications after cleanup:');
    const [remainingNotifications] = await pool.query(`
      SELECT n.*, u.username 
      FROM notifications n 
      JOIN users u ON n.user_id = u.user_id 
      ORDER BY n.created_at DESC 
      LIMIT 10
    `);
    
    remainingNotifications.forEach(notif => {
      console.log(`- ID: ${notif.notification_id}, User: ${notif.username}, Title: "${notif.title}", Created: ${notif.created_at}`);
    });
    
    console.log('\n🎉 Cleanup test completed!');
    
  } catch (error) {
    console.error('❌ Error testing cleanup:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testCleanupWithOldNotifications()
    .then(() => {
      console.log('\nTest completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCleanupWithOldNotifications }; 