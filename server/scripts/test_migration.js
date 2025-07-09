const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_task_manager',
  port: process.env.DB_PORT || 3306
};

async function testMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking if issue_solved column exists...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'follow_ups' AND COLUMN_NAME = 'issue_solved'
    `, [dbConfig.database]);
    
    if (columns.length > 0) {
      console.log('✅ Migration successful! The issue_solved column exists:');
      console.log(`   Column: ${columns[0].COLUMN_NAME}`);
      console.log(`   Type: ${columns[0].DATA_TYPE}`);
      console.log(`   Nullable: ${columns[0].IS_NULLABLE}`);
    } else {
      console.log('❌ Migration failed! The issue_solved column does not exist.');
      process.exit(1);
    }
    
    // Test inserting a record with the new field
    console.log('\nTesting insert with new field...');
    const testData = {
      ticket_id: 999, // Use a test ticket ID
      follow_up_agent_id: 1,
      follow_up_date: new Date().toISOString().slice(0, 10),
      issue_solved: true,
      customer_location: 'Test Location',
      satisfied: true,
      repeated_issue: false,
      follow_up_notes: 'Test migration'
    };
    
    const [result] = await connection.execute(`
      INSERT INTO follow_ups (ticket_id, follow_up_agent_id, follow_up_date, issue_solved, customer_location, satisfied, repeated_issue, follow_up_notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [testData.ticket_id, testData.follow_up_agent_id, testData.follow_up_date, testData.issue_solved, testData.customer_location, testData.satisfied, testData.repeated_issue, testData.follow_up_notes]);
    
    console.log('✅ Test insert successful! Inserted follow-up ID:', result.insertId);
    
    // Clean up test data
    await connection.execute('DELETE FROM follow_ups WHERE follow_up_id = ?', [result.insertId]);
    console.log('✅ Test data cleaned up.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testMigration(); 