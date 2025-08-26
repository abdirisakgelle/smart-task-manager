const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function addCeoRole() {
  try {
    console.log('🔄 Adding CEO role to database...');
    
    // Check if users table exists
    const [tables] = await pool.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.log('❌ Users table does not exist. Please run the main schema first.');
      return;
    }
    
    // Get current table structure
    const [columns] = await pool.query('DESCRIBE users');
    console.log('📋 Current users table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Update role ENUM to include 'ceo'
    console.log('🔄 Updating role ENUM to include CEO role...');
    try {
      await pool.query(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('admin', 'ceo', 'manager', 'agent', 'supervisor', 'media', 'follow_up') DEFAULT 'agent'
      `);
      console.log('✅ Role ENUM updated successfully to include CEO role');
    } catch (err) {
      console.error('❌ Error updating role ENUM:', err.message);
      return;
    }
    
    // Create a test CEO user
    console.log('🔄 Creating test CEO user...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('ceo123', saltRounds);
    
    try {
      await pool.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = ?',
        ['ceo', hashedPassword, 'ceo', 'ceo']
      );
      console.log('✅ Test CEO user created successfully');
      console.log('Username: ceo');
      console.log('Password: ceo123');
      console.log('Role: ceo');
    } catch (err) {
      console.error('❌ Error creating CEO user:', err.message);
    }
    
    // Display current users
    console.log('\n👥 Current users in system:');
    const [users] = await pool.query(`
      SELECT u.user_id, u.username, u.role, u.status, u.employee_id, e.name as employee_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      ORDER BY u.username
    `);
    
    if (users.length === 0) {
      console.log('  No users found');
    } else {
      users.forEach(user => {
        console.log(`  - ${user.username} (${user.role}) - ${user.employee_name || 'No employee linked'}`);
      });
    }
    
    console.log('\n🎯 Available Login Credentials:');
    console.log('================================');
    console.log('Admin: admin / admin123');
    console.log('CEO: ceo / ceo123');
    console.log('Manager: manager / manager123');
    console.log('User: user / user123');
    
    console.log('\n✅ CEO role migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during CEO role migration:', error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
addCeoRole();
