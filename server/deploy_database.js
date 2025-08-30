const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function deployDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'nasiye@2025',
      database: process.env.DB_NAME || 'nasiye_tasks',
      multipleStatements: true, // Allow multiple SQL statements
      timezone: '+03:00'
    });

    console.log('✅ Connected to database successfully');

    // Read schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📄 Schema file loaded');

    // Execute schema
    console.log('🚀 Deploying database schema...');
    await connection.execute(schema);
    
    console.log('✅ Database schema deployed successfully');

    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Created tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Insert sample data if needed
    console.log('📊 Inserting sample data...');
    await insertSampleData(connection);
    
    console.log('✅ Database deployment completed successfully!');

  } catch (error) {
    console.error('❌ Database deployment failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Check your database credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Check your database host and port');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Database does not exist. Create it first or check DB_NAME');
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

async function insertSampleData(connection) {
  try {
    // Insert sample employees
    await connection.execute(`
      INSERT IGNORE INTO employees (employee_id, name, shift, department, phone) VALUES
      (1, 'John Doe', 'Day', 'IT Support', '+252123456789'),
      (2, 'Jane Smith', 'Night', 'Customer Service', '+252123456790'),
      (3, 'Mike Johnson', 'Day', 'Content', '+252123456791')
    `);

    // Insert sample users
    await connection.execute(`
      INSERT IGNORE INTO users (user_id, employee_id, username, password_hash, role) VALUES
      (1, 1, 'admin', '$2b$10$example_hash', 'admin'),
      (2, 2, 'agent1', '$2b$10$example_hash', 'agent'),
      (3, 3, 'manager1', '$2b$10$example_hash', 'manager')
    `);

    // Insert sample tickets
    await connection.execute(`
      INSERT IGNORE INTO tickets (ticket_id, customer_phone, communication_channel, device_type, issue_type, issue_description, agent_id, first_call_resolution, resolution_status) VALUES
      (1, '+252123456789', 'Phone', 'Mobile', 'App', 'App login issue', 1, true, 'resolved'),
      (2, '+252123456790', 'Phone', 'TV', 'IPTV', 'IPTV streaming problem', 2, false, 'resolved'),
      (3, '+252123456791', 'Phone', 'Mobile', 'App', 'App payment issue', 1, true, 'resolved')
    `);

    console.log('✅ Sample data inserted successfully');
  } catch (error) {
    console.log('⚠️ Sample data insertion failed (may already exist):', error.message);
  }
}

// Run deployment if this file is executed directly
if (require.main === module) {
  deployDatabase()
    .then(() => {
      console.log('🎉 Database deployment completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deployDatabase };

