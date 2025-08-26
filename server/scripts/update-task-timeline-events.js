require('dotenv').config();
const pool = require('../config/db');

async function updateTaskTimelineEvents() {
  try {
    console.log('Updating task_timeline table to include missing event types...');

    // First, let's check the current enum values
    const [currentEnum] = await pool.execute(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'nasiye_tasks' 
      AND TABLE_NAME = 'task_timeline' 
      AND COLUMN_NAME = 'event_type'
    `);

    console.log('Current event_type enum:', currentEnum[0]?.COLUMN_TYPE);

    // Update the event_type column to include new event types
    await pool.execute(`
      ALTER TABLE task_timeline 
      MODIFY COLUMN event_type ENUM(
        'created',
        'status_changed', 
        'assigned',
        'reassigned',
        'commented',
        'due_date_changed',
        'completed',
        'extension_requested',
        'extension_approved',
        'extension_rejected'
      ) NOT NULL
    `);

    console.log('✅ task_timeline event_type enum updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating task_timeline events:', error);
    process.exit(1);
  }
}

updateTaskTimelineEvents(); 