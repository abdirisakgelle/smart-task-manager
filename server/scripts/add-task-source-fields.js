require('dotenv').config();
const pool = require('../config/db');

async function addTaskSourceFields() {
  try {
    console.log('🔄 Adding source tracking fields to tasks table...');

    // Check if fields already exist
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'tasks' 
      AND COLUMN_NAME IN ('source_module', 'source_id')
    `);

    if (columns.length >= 2) {
      console.log('✅ Source tracking fields already exist in tasks table');
      return;
    }

    // Add source_module field
    try {
      await pool.execute(`
        ALTER TABLE tasks 
        ADD COLUMN source_module VARCHAR(50) NULL COMMENT 'Module that created this task (e.g., ideas, content)'
      `);
      console.log('✅ Added source_module field to tasks table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ source_module field already exists');
      } else {
        throw error;
      }
    }

    // Add source_id field
    try {
      await pool.execute(`
        ALTER TABLE tasks 
        ADD COLUMN source_id INT NULL COMMENT 'ID from the source module (e.g., idea_id)'
      `);
      console.log('✅ Added source_id field to tasks table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ source_id field already exists');
      } else {
        throw error;
      }
    }

    // Create indexes
    try {
      await pool.execute('CREATE INDEX idx_tasks_source_module ON tasks(source_module)');
      console.log('✅ Created index on source_module');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️ Index on source_module already exists');
      } else {
        throw error;
      }
    }

    try {
      await pool.execute('CREATE INDEX idx_tasks_source_id ON tasks(source_id)');
      console.log('✅ Created index on source_id');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️ Index on source_id already exists');
      } else {
        throw error;
      }
    }

    try {
      await pool.execute('CREATE INDEX idx_tasks_source_composite ON tasks(source_module, source_id)');
      console.log('✅ Created composite index on source_module, source_id');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️ Composite index already exists');
      } else {
        throw error;
      }
    }

    console.log('🎉 Successfully added source tracking fields to tasks table!');
    console.log('📋 New fields:');
    console.log('   - source_module: VARCHAR(50) - Module that created the task');
    console.log('   - source_id: INT - ID from the source module');
    console.log('   - Indexes created for optimal query performance');

  } catch (error) {
    console.error('❌ Error adding source tracking fields:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
addTaskSourceFields(); 