#!/usr/bin/env node

/**
 * Content Production Pipeline Setup and Verification Script
 * This script helps verify that the pipeline implementation is working correctly
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

async function setupPipeline() {
  console.log('🚀 Setting up Content Production Pipeline...\n');

  let connection;
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Database connection successful\n');

    // Verify required tables exist
    console.log('2. Verifying database schema...');
    const requiredTables = ['ideas', 'content', 'production', 'social_media', 'users', 'employees'];
    
    for (const table of requiredTables) {
      const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
      if (rows.length === 0) {
        throw new Error(`Required table '${table}' not found`);
      }
    }
    console.log('✅ All required tables exist\n');

    // Check for test data
    console.log('3. Checking for sample data...');
    const [ideas] = await connection.execute('SELECT COUNT(*) as count FROM ideas');
    const [employees] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    console.log(`   Ideas: ${ideas[0].count}`);
    console.log(`   Employees: ${employees[0].count}`);
    console.log(`   Users: ${users[0].count}\n`);

    if (employees[0].count === 0 || users[0].count === 0) {
      console.log('⚠️  Warning: No sample data found. You may need to create employees and users first.\n');
    }

    // Test stage inference queries
    console.log('4. Testing stage inference queries...');
    
    const stageQueries = {
      'Idea': `
        SELECT COUNT(*) as count
        FROM ideas i
        LEFT JOIN content c ON c.idea_id = i.idea_id
        WHERE c.content_id IS NULL
          AND LOWER(i.status) IN ('pending', 'in progress', 'approved', 'bank')
      `,
      'Script': `
        SELECT COUNT(*) as count
        FROM ideas i
        JOIN content c ON c.idea_id = i.idea_id
        LEFT JOIN production p ON p.content_id = c.content_id
        WHERE p.production_id IS NULL
      `,
      'Production': `
        SELECT COUNT(*) as count
        FROM ideas i
        JOIN content c ON c.idea_id = i.idea_id
        JOIN production p ON p.content_id = c.content_id
        LEFT JOIN social_media sm ON sm.content_id = c.content_id
        WHERE sm.post_id IS NULL
      `,
      'Social': `
        SELECT COUNT(*) as count
        FROM ideas i
        JOIN content c ON c.idea_id = i.idea_id
        JOIN social_media sm ON sm.content_id = c.content_id
      `
    };

    for (const [stage, query] of Object.entries(stageQueries)) {
      const [result] = await connection.execute(query);
      console.log(`   ${stage} stage: ${result[0].count} items`);
    }
    console.log('✅ Stage inference queries working\n');

    // Check database indexes for performance
    console.log('5. Checking database indexes...');
    const criticalIndexes = [
      { table: 'content', column: 'idea_id' },
      { table: 'production', column: 'content_id' },
      { table: 'social_media', column: 'content_id' }
    ];

    for (const { table, column } of criticalIndexes) {
      const [indexes] = await connection.execute(`SHOW INDEX FROM ${table} WHERE Column_name = '${column}'`);
      if (indexes.length === 0) {
        console.log(`   ⚠️  Warning: No index found on ${table}.${column} - consider adding for better performance`);
      } else {
        console.log(`   ✅ Index exists on ${table}.${column}`);
      }
    }
    console.log('');

    // Test environment variables
    console.log('6. Checking environment configuration...');
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
    let envIssues = 0;

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.log(`   ❌ Missing environment variable: ${envVar}`);
        envIssues++;
      }
    }

    if (envIssues === 0) {
      console.log('✅ All required environment variables are set\n');
    } else {
      console.log(`⚠️  ${envIssues} environment variable(s) missing\n`);
    }

    // Create a test idea to verify the system works
    console.log('7. Creating test idea to verify pipeline...');
    
    // First, ensure we have at least one employee
    const [employeeCheck] = await connection.execute('SELECT employee_id FROM employees LIMIT 1');
    if (employeeCheck.length === 0) {
      console.log('   Creating sample employee...');
      await connection.execute(`
        INSERT INTO employees (name, shift, department, phone) 
        VALUES ('Pipeline Test User', 'Day', 'Content', '+252-123-456-789')
      `);
    }

    const [employee] = await connection.execute('SELECT employee_id FROM employees LIMIT 1');
    const employeeId = employee[0].employee_id;

    // Create test idea
    const testTitle = `Pipeline Test ${Date.now()}`;
    const [ideaResult] = await connection.execute(`
      INSERT INTO ideas (submission_date, title, contributor_id, script_writer_id, status, priority) 
      VALUES (CURDATE(), ?, ?, ?, 'pending', 'medium')
    `, [testTitle, employeeId, employeeId]);

    const testIdeaId = ideaResult.insertId;
    console.log(`   ✅ Created test idea with ID: ${testIdeaId}\n`);

    // Test stage inference
    const [testIdea] = await connection.execute(`
      SELECT
        i.idea_id,
        i.title,
        (SELECT c.content_id FROM content c WHERE c.idea_id = i.idea_id LIMIT 1) AS content_id,
        (SELECT p.production_id FROM production p 
         JOIN content c ON p.content_id = c.content_id 
         WHERE c.idea_id = i.idea_id LIMIT 1) AS production_id,
        (SELECT sm.post_id FROM social_media sm 
         JOIN content c ON sm.content_id = c.content_id 
         WHERE c.idea_id = i.idea_id LIMIT 1) AS social_post_id
      FROM ideas i
      WHERE i.idea_id = ?
    `, [testIdeaId]);

    const idea = testIdea[0];
    let inferredStage = 'Idea';
    if (idea.social_post_id) inferredStage = 'Social';
    else if (idea.production_id) inferredStage = 'Production';
    else if (idea.content_id) inferredStage = 'Script';

    console.log(`   Test idea stage: ${inferredStage} ✅`);

    // Clean up test data
    await connection.execute('DELETE FROM ideas WHERE idea_id = ?', [testIdeaId]);
    console.log('   Cleaned up test data ✅\n');

    console.log('🎉 Pipeline setup verification completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Start the backend server: cd server && npm start');
    console.log('2. Start the frontend: cd client && npm start');
    console.log('3. Navigate to the Content Pipeline section in the app');
    console.log('4. Test moving items between stages\n');

  } catch (error) {
    console.error('❌ Setup verification failed:', error.message);
    console.error('\nPlease check:');
    console.error('- Database connection settings in .env file');
    console.error('- Database schema is properly initialized');
    console.error('- Required tables exist with proper structure');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupPipeline().catch(console.error);
}

module.exports = { setupPipeline };