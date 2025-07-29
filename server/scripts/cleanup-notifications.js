const pool = require('../config/db');

async function cleanupNotifications() {
  try {
    console.log('🧹 Starting weekly notification cleanup...');
    
    // Calculate the date from last Saturday (7 days ago)
    const now = new Date();
    const lastSaturday = new Date(now);
    lastSaturday.setDate(now.getDate() - 7);
    
    // Format the date for SQL query
    const cutoffDate = lastSaturday.toISOString().slice(0, 19).replace('T', ' ');
    
    console.log(`📅 Cleaning notifications older than: ${cutoffDate}`);
    
    // Get count of notifications to be deleted
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE created_at < ?',
      [cutoffDate]
    );
    
    const notificationsToDelete = countResult[0].count;
    console.log(`📊 Found ${notificationsToDelete} notifications to delete`);
    
    if (notificationsToDelete === 0) {
      console.log('✅ No old notifications to clean up');
      return;
    }
    
    // Delete notifications older than a week
    const [deleteResult] = await pool.query(
      'DELETE FROM notifications WHERE created_at < ?',
      [cutoffDate]
    );
    
    console.log(`✅ Successfully deleted ${deleteResult.affectedRows} notifications`);
    
    // Show remaining notifications
    const [remainingNotifications] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications'
    );
    
    console.log(`📊 Remaining notifications: ${remainingNotifications[0].count}`);
    
    // Show notification age distribution
    console.log('\n📈 Notification age distribution:');
    const [ageDistribution] = await pool.query(`
      SELECT 
        CASE 
          WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'Today'
          WHEN created_at >= DATE_SUB(NOW(), INTERVAL 2 DAY) THEN 'Yesterday'
          WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'This Week'
          ELSE 'Older'
        END as age_group,
        COUNT(*) as count
      FROM notifications 
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN 'Today' THEN 1
          WHEN 'Yesterday' THEN 2
          WHEN 'This Week' THEN 3
          ELSE 4
        END
    `);
    
    ageDistribution.forEach(group => {
      console.log(`- ${group.age_group}: ${group.count} notifications`);
    });
    
  } catch (error) {
    console.error('❌ Error during notification cleanup:', error);
  } finally {
    await pool.end();
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupNotifications()
    .then(() => {
      console.log('\nCleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupNotifications }; 