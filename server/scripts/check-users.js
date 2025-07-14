const pool = require('../config/db');

async function checkUsers() {
  try {
    console.log('Checking users table...');
    
    // Check if users table exists
    const [tables] = await pool.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.log('Users table does not exist. Creating it...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          employee_id INT NULL,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('admin', 'user', 'manager') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created successfully!');
    }
    
    // Get all users
    const [users] = await pool.query('SELECT user_id, username, password_hash, role, created_at FROM users');
    
    console.log('\nCurrent users in database:');
    console.log('========================');
    
    if (users.length === 0) {
      console.log('No users found in database.');
      console.log('\nCreating test users...');
      
      // Create test users with plain text passwords (as requested)
      await pool.query(`
        INSERT INTO users (username, password_hash, role) VALUES 
        ('admin', 'admin123', 'admin'),
        ('user', 'user123', 'user'),
        ('manager', 'manager123', 'manager')
      `);
      
      console.log('Test users created:');
      console.log('- admin/admin123 (admin role)');
      console.log('- user/user123 (user role)');
      console.log('- manager/manager123 (manager role)');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.user_id}, Username: ${user.username}, Role: ${user.role}, Password: ${user.password_hash}`);
      });
    }
    
    console.log('\nUsers table structure:');
    const [columns] = await pool.query('DESCRIBE users');
    columns.forEach(col => {
      console.log(`${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers(); 