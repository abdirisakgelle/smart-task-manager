require('dotenv').config();
const pool = require('../config/db');

async function updateDueDateToDateTime() {
  try {
    console.log('Updating due_date column from DATE to DATETIME...');

    // First, let's check the current column type
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'tasks' 
      AND COLUMN_NAME = 'due_date'
    `);

    if (columns.length === 0) {
      console.log('❌ due_date column not found');
      return;
    }

    console.log('Current due_date column type:', columns[0].DATA_TYPE);

    if (columns[0].DATA_TYPE === 'datetime') {
      console.log('✅ due_date column is already DATETIME type');
      return;
    }

    // Update the column type from DATE to DATETIME
    await pool.execute('ALTER TABLE tasks MODIFY COLUMN due_date DATETIME');
    console.log('✅ due_date column updated to DATETIME');

    // Also update requested_due_date if it exists
    try {
      await pool.execute('ALTER TABLE tasks MODIFY COLUMN requested_due_date DATETIME');
      console.log('✅ requested_due_date column updated to DATETIME');
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('ℹ️ requested_due_date column does not exist yet');
      } else {
        throw error;
      }
    }

    console.log('✅ All due date columns updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating due_date columns:', error);
    process.exit(1);
  }
}

updateDueDateToDateTime(); 