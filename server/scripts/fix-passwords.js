const pool = require('../config/db');

async function fixPasswords() {
  try {
    console.log('Fixing password inconsistencies...');
    
    // Update all users to have plain text passwords with correct roles
    const users = [
      { username: 'gelle', password: '123', role: 'admin' },
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'manager', password: 'manager123', role: 'manager' },
      { username: 'user', password: 'user123', role: 'agent' } // Changed from 'user' to 'agent'
    ];
    
    for (const user of users) {
      // Check if user exists
      const [existing] = await pool.query('SELECT user_id FROM users WHERE username = ?', [user.username]);
      
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
    }
    
    // Display all users after fix
    console.log('\nCurrent users after fix:');
    console.log('========================');
    const [allUsers] = await pool.query('SELECT user_id, username, password_hash, role FROM users ORDER BY user_id');
    
    allUsers.forEach(user => {
      console.log(`ID: ${user.user_id}, Username: ${user.username}, Role: ${user.role}, Password: ${user.password_hash}`);
    });
    
    console.log('\n🎉 Password fix completed! You can now login with:');
    console.log('- gelle / 123 (admin)');
    console.log('- admin / admin123 (admin)');
    console.log('- manager / manager123 (manager)');
    console.log('- user / user123 (agent)');
    
  } catch (error) {
    console.error('Error fixing passwords:', error);
  } finally {
    process.exit(0);
  }
}

fixPasswords(); 