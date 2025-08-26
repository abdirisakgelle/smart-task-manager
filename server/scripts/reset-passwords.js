const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function resetPasswords() {
  try {
    console.log('Resetting user passwords for testing...\n');
    
    // Users and their new passwords
    const users = [
      { username: 'gelle', password: 'gelle123' },
      { username: 'adna', password: 'adna123' },
      { username: 'harun', password: 'harun123' }
    ];
    
    for (const user of users) {
      console.log(`Resetting password for: ${user.username}`);
      
      // Hash the new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(user.password, saltRounds);
      
      // Update user password
      const [result] = await pool.query(
        'UPDATE users SET password_hash = ? WHERE username = ?',
        [passwordHash, user.username]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ Password reset for ${user.username}`);
      } else {
        console.log(`❌ User ${user.username} not found`);
      }
    }
    
    console.log('\nPassword reset completed!');
    console.log('\nTest credentials:');
    console.log('admin / admin123');
    console.log('gelle / gelle123');
    console.log('adna / adna123');
    console.log('harun / harun123');
    
  } catch (err) {
    console.error('Error resetting passwords:', err);
  } finally {
    process.exit(0);
  }
}

resetPasswords(); 