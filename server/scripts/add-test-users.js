const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'nasiye@2025',
  database: process.env.DB_NAME || 'nasiye_tasks',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testUsers = [
  {
    username: 'ceo',
    password: 'ceo123',
    role: 'ceo',
    name: 'CEO Test User',
    email: 'ceo@test.com'
  },
  {
    username: 'manager',
    password: 'manager123',
    role: 'manager',
    name: 'Manager Test User',
    email: 'manager@test.com'
  },
  {
    username: 'agent',
    password: 'agent123',
    role: 'agent',
    name: 'Agent Test User',
    email: 'agent@test.com'
  },
  {
    username: 'supervisor',
    password: 'supervisor123',
    role: 'supervisor',
    name: 'Supervisor Test User',
    email: 'supervisor@test.com'
  },
  {
    username: 'media',
    password: 'media123',
    role: 'media',
    name: 'Media Test User',
    email: 'media@test.com'
  },
  {
    username: 'followup',
    password: 'followup123',
    role: 'follow_up',
    name: 'Follow-up Test User',
    email: 'followup@test.com'
  }
];

async function addTestUsers() {
  try {
    console.log('Adding test users for all roles...');
    
    // First, update the users table to include 'ceo' role
    try {
      await pool.query(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('admin', 'ceo', 'manager', 'agent', 'supervisor', 'media', 'follow_up') DEFAULT 'agent'
      `);
      console.log('✅ Updated users table to include CEO role');
    } catch (error) {
      console.log('CEO role already exists or table already updated');
    }
    
    for (const user of testUsers) {
      // Check if user already exists
      const [existingUsers] = await pool.query(
        'SELECT user_id FROM users WHERE username = ?',
        [user.username]
      );
      
      if (existingUsers.length > 0) {
        console.log(`User ${user.username} already exists, updating password...`);
        await pool.query(
          'UPDATE users SET password_hash = ? WHERE username = ?',
          [user.password, user.username]
        );
      } else {
        console.log(`Creating user ${user.username} with role ${user.role}...`);
        await pool.query(
          'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
          [user.username, user.password, user.role]
        );
      }
    }
    
    console.log('✅ All test users have been added/updated successfully!');
    console.log('\n📋 Test Users Summary:');
    testUsers.forEach(user => {
      console.log(`  • ${user.role.toUpperCase()}: ${user.username} / ${user.password}`);
    });
    console.log('\n🎯 You can now test all role-specific dashboards!');
    
  } catch (error) {
    console.error('❌ Error adding test users:', error);
  } finally {
    await pool.end();
  }
}

addTestUsers(); 