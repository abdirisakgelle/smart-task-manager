const pool = require('../config/db');

/**
 * Migration script to update the script_deadline field in the ideas table
 * from DATE to DATETIME type to properly store time information
 */
async function updateIdeasScriptDeadlineToDatetime() {
  let connection;
  
  try {
    console.log('🔄 Starting migration: Update ideas.script_deadline to DATETIME...');
    
    connection = await pool.getConnection();
    
    // Check current table structure
    console.log('📋 Checking current table structure...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'ideas' 
      AND COLUMN_NAME = 'script_deadline'
    `);
    
    if (columns.length === 0) {
      console.log('❌ script_deadline column not found in ideas table');
      return;
    }
    
    const currentColumn = columns[0];
    console.log('📊 Current script_deadline column:', {
      name: currentColumn.COLUMN_NAME,
      type: currentColumn.DATA_TYPE,
      nullable: currentColumn.IS_NULLABLE,
      default: currentColumn.COLUMN_DEFAULT
    });
    
    // If already DATETIME, no need to migrate
    if (currentColumn.DATA_TYPE === 'datetime') {
      console.log('✅ script_deadline is already DATETIME type. No migration needed.');
      return;
    }
    
    // Check if there are existing records with script_deadline values
    const [existingRecords] = await connection.execute(`
      SELECT COUNT(*) as count, 
             COUNT(CASE WHEN script_deadline IS NOT NULL THEN 1 END) as with_deadline
      FROM ideas
    `);
    
    console.log('📈 Existing records:', {
      total: existingRecords[0].count,
      withDeadline: existingRecords[0].with_deadline
    });
    
    // Begin transaction
    await connection.beginTransaction();
    
    // Step 1: Add a temporary DATETIME column
    console.log('🔧 Step 1: Adding temporary script_deadline_datetime column...');
    await connection.execute(`
      ALTER TABLE ideas 
      ADD COLUMN script_deadline_datetime DATETIME NULL 
      AFTER script_deadline
    `);
    
    // Step 2: Convert existing DATE values to DATETIME (add default time)
    if (existingRecords[0].with_deadline > 0) {
      console.log('🔄 Step 2: Converting existing DATE values to DATETIME...');
      await connection.execute(`
        UPDATE ideas 
        SET script_deadline_datetime = CONCAT(script_deadline, ' 23:59:59')
        WHERE script_deadline IS NOT NULL
      `);
      console.log(`✅ Converted ${existingRecords[0].with_deadline} existing records`);
    }
    
    // Step 3: Drop the old DATE column
    console.log('🗑️ Step 3: Dropping old script_deadline DATE column...');
    await connection.execute(`
      ALTER TABLE ideas 
      DROP COLUMN script_deadline
    `);
    
    // Step 4: Rename the new DATETIME column to script_deadline
    console.log('🔄 Step 4: Renaming script_deadline_datetime to script_deadline...');
    await connection.execute(`
      ALTER TABLE ideas 
      CHANGE COLUMN script_deadline_datetime script_deadline DATETIME NULL
    `);
    
    // Step 5: Add index for performance
    console.log('📊 Step 5: Adding index for script_deadline...');
    await connection.execute(`
      CREATE INDEX idx_ideas_script_deadline ON ideas(script_deadline)
    `);
    
    // Commit transaction
    await connection.commit();
    
    // Verify the change
    const [newColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'ideas' 
      AND COLUMN_NAME = 'script_deadline'
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 New script_deadline column:', {
      name: newColumns[0].COLUMN_NAME,
      type: newColumns[0].DATA_TYPE,
      nullable: newColumns[0].IS_NULLABLE,
      default: newColumns[0].COLUMN_DEFAULT
    });
    
    // Test with a sample query
    const [testResult] = await connection.execute(`
      SELECT script_deadline FROM ideas LIMIT 1
    `);
    console.log('🧪 Test query result:', testResult);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    if (connection) {
      try {
        await connection.rollback();
        console.log('🔄 Transaction rolled back');
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError);
      }
    }
    
    throw error;
    
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  updateIdeasScriptDeadlineToDatetime()
    .then(() => {
      console.log('🎉 Migration script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateIdeasScriptDeadlineToDatetime };
