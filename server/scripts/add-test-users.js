const pool = require('../config/db');

async function addTestUsers() {
  try {
    console.log('Adding test users...');
    
    // Test users to add
    const testUsers = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'user', password: 'user123', role: 'user' },
      { username: 'manager', password: 'manager123', role: 'manager' }
    ];
    
    for (const user of testUsers) {
      try {
        // Check if user already exists
        const [existing] = await pool.query(
          'SELECT user_id FROM users WHERE username = ?',
          [user.username]
        );
        
        if (existing.length > 0) {
          // Update existing user
          await pool.query(
            'UPDATE users SET password_hash = ?, role = ? WHERE username = ?',
            [user.password, user.role, user.username]
          );
          console.log(`✅ Updated user: ${user.username} (${user.role})`);
        } else {
          // Create new user
          await pool.query(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            [user.username, user.password, user.role]
          );
          console.log(`✅ Created user: ${user.username} (${user.role})`);
        }
      } catch (err) {
        console.error(`❌ Error with user ${user.username}:`, err.message);
      }
    }
    
    // Display all users
    console.log('\n📋 Current users in database:');
    console.log('=============================');
    const [users] = await pool.query('SELECT user_id, username, password_hash, role FROM users');
    users.forEach(user => {
      console.log(`ID: ${user.user_id}, Username: ${user.username}, Role: ${user.role}, Password: ${user.password_hash}`);
    });
    
    console.log('\n🎯 Login Credentials:');
    console.log('====================');
    console.log('Admin: admin / admin123');
    console.log('User: user / user123');
    console.log('Manager: manager / manager123');
    
  } catch (error) {
    console.error('Error adding test users:', error);
  } finally {
    process.exit(0);
  }
}

addTestUsers(); 