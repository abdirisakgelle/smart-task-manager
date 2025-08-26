require('dotenv').config();
const pool = require('../config/db');

async function updateExistingTaskTimes() {
  try {
    console.log('Updating existing tasks with proper time values...');

    // Get all tasks that have due_date with time 00:00:00 (default time)
    const [tasks] = await pool.execute(`
      SELECT task_id, due_date, title 
      FROM tasks 
      WHERE due_date IS NOT NULL 
      AND TIME(due_date) = '00:00:00'
    `);

    console.log(`Found ${tasks.length} tasks with default time (12:00 AM)`);

    if (tasks.length === 0) {
      console.log('✅ No tasks need updating');
      return;
    }

    // Update each task to have a more reasonable time (e.g., 5:00 PM)
    for (const task of tasks) {
      const currentDate = new Date(task.due_date);
      
      // Set time to 5:00 PM (17:00) for better user experience
      currentDate.setHours(17, 0, 0, 0);
      
      const newDateTime = currentDate.toISOString().slice(0, 19).replace('T', ' ');
      
      await pool.execute(
        'UPDATE tasks SET due_date = ? WHERE task_id = ?',
        [newDateTime, task.task_id]
      );
      
      console.log(`✅ Updated task "${task.title}" due date to ${newDateTime}`);
    }

    console.log('✅ All existing tasks updated with proper time values');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating task times:', error);
    process.exit(1);
  }
}

updateExistingTaskTimes(); 