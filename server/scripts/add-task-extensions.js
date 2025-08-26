require('dotenv').config();
const pool = require('../config/db');

async function addTaskExtensions() {
  try {
    console.log('Adding task extension and completion columns...');

    // Add extension_requested column
    try {
      await pool.execute('ALTER TABLE tasks ADD COLUMN extension_requested BOOLEAN DEFAULT FALSE');
      console.log('✅ extension_requested column added');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ extension_requested column already exists');
      } else {
        throw error;
      }
    }

    // Add extension_reason column
    try {
      await pool.execute('ALTER TABLE tasks ADD COLUMN extension_reason TEXT');
      console.log('✅ extension_reason column added');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ extension_reason column already exists');
      } else {
        throw error;
      }
    }

    // Add requested_due_date column
    try {
      await pool.execute('ALTER TABLE tasks ADD COLUMN requested_due_date DATE');
      console.log('✅ requested_due_date column added');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ requested_due_date column already exists');
      } else {
        throw error;
      }
    }

    // Add extension_status column
    try {
      await pool.execute('ALTER TABLE tasks ADD COLUMN extension_status ENUM("Pending", "Approved", "Rejected") DEFAULT NULL');
      console.log('✅ extension_status column added');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ extension_status column already exists');
      } else {
        throw error;
      }
    }

    // Add completion_comment column
    try {
      await pool.execute('ALTER TABLE tasks ADD COLUMN completion_comment TEXT');
      console.log('✅ completion_comment column added');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ completion_comment column already exists');
      } else {
        throw error;
      }
    }

    console.log('✅ All task extension columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding task extension columns:', error);
    process.exit(1);
  }
}

addTaskExtensions(); 