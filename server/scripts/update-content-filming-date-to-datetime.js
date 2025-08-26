const pool = require('../config/db');

async function updateContentFilmingDateToDatetime() {
  let connection;
  try {
    console.log('🔄 Starting migration: Update content.filming_date to DATETIME...');
    connection = await pool.getConnection();
    
    // Check current column type
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'content' 
      AND COLUMN_NAME = 'filming_date'
    `);
    
    if (columns.length === 0) {
      console.log('❌ filming_date column not found in content table');
      return;
    }
    
    const currentColumn = columns[0];
    if (currentColumn.DATA_TYPE === 'datetime') {
      console.log('✅ filming_date is already DATETIME type. No migration needed.');
      return;
    }
    
    console.log(`📊 Current filming_date type: ${currentColumn.DATA_TYPE}`);
    
    // Check existing records
    const [existingRecords] = await connection.execute(`
      SELECT COUNT(*) as count, 
             COUNT(CASE WHEN filming_date IS NOT NULL THEN 1 END) as with_date
      FROM content
    `);
    
    console.log(`📈 Total content records: ${existingRecords[0].count}`);
    console.log(`📅 Records with filming_date: ${existingRecords[0].with_date}`);
    
    // Start transaction
    await connection.beginTransaction();
    console.log('🔄 Starting database transaction...');
    
    // Step 1: Add temporary DATETIME column
    console.log('📝 Step 1: Adding temporary filming_date_datetime column...');
    await connection.execute(`
      ALTER TABLE content 
      ADD COLUMN filming_date_datetime DATETIME NULL 
      AFTER filming_date
    `);
    
    // Step 2: Convert existing DATE values to DATETIME (add default time 23:59:59)
    if (existingRecords[0].with_date > 0) {
      console.log('🔄 Step 2: Converting existing DATE values to DATETIME...');
      await connection.execute(`
        UPDATE content 
        SET filming_date_datetime = CONCAT(filming_date, ' 23:59:59')
        WHERE filming_date IS NOT NULL
      `);
      console.log(`✅ Converted ${existingRecords[0].with_date} existing records`);
    }
    
    // Step 3: Drop the old DATE column
    console.log('🗑️ Step 3: Dropping old filming_date column...');
    await connection.execute(`
      ALTER TABLE content 
      DROP COLUMN filming_date
    `);
    
    // Step 4: Rename the new DATETIME column to filming_date
    console.log('🔄 Step 4: Renaming filming_date_datetime to filming_date...');
    await connection.execute(`
      ALTER TABLE content 
      CHANGE COLUMN filming_date_datetime filming_date DATETIME NULL
    `);
    
    // Step 5: Add index for performance
    console.log('📊 Step 5: Adding performance index...');
    await connection.execute(`
      CREATE INDEX idx_content_filming_date ON content(filming_date)
    `);
    
    // Commit transaction
    await connection.commit();
    console.log('✅ Transaction committed successfully!');
    
    // Verify the change
    const [verifyColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'content' 
      AND COLUMN_NAME = 'filming_date'
    `);
    
    if (verifyColumns.length > 0) {
      console.log(`✅ Verification: filming_date is now ${verifyColumns[0].DATA_TYPE} type`);
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('📋 Summary:');
    console.log(`   - Column type: DATE → DATETIME`);
    console.log(`   - Records converted: ${existingRecords[0].with_date}`);
    console.log(`   - Performance index added`);
    console.log(`   - All existing data preserved`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (connection) {
      try {
        await connection.rollback();
        console.log('🔄 Transaction rolled back successfully');
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

// Run migration if called directly
if (require.main === module) {
  updateContentFilmingDateToDatetime()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateContentFilmingDateToDatetime };
