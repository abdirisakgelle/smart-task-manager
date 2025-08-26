const pool = require('../config/db');

async function updateNotificationTypes() {
  try {
    console.log('🔄 Updating notification types in database...');
    
    // Update the notifications table to include new types
    await pool.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM(
        'task_assignment', 
        'task_update', 
        'task_completion', 
        'script_assignment', 
        'idea_assignment', 
        'content_assignment', 
        'cast_assignment', 
        'system'
      ) DEFAULT 'task_assignment'
    `);
    
    console.log('✅ Notification types updated successfully!');
    
    // Verify the update
    const [columns] = await pool.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'nasiye_tasks' 
      AND TABLE_NAME = 'notifications' 
      AND COLUMN_NAME = 'type'
    `);
    
    console.log('\n📊 Current notification types:');
    console.log(columns[0].COLUMN_TYPE);
    
  } catch (error) {
    console.error('❌ Error updating notification types:', error);
  } finally {
    await pool.end();
  }
}

// Run the update
if (require.main === module) {
  updateNotificationTypes()
    .then(() => {
      console.log('\nUpdate completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateNotificationTypes }; 