const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function resetTestPassword() {
  try {
    console.log('🔄 Resetting test user password...');
    
    // Reset the 'user' account password to 'password123'
    const newPassword = 'password123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [passwordHash, 'user']
    );
    
    if (result.affectedRows === 0) {
      console.log('❌ User "user" not found');
      return;
    }
    
    console.log('✅ Password reset successfully');
    console.log('📋 Test credentials:');
    console.log('  Username: user');
    console.log('  Password: password123');
    console.log('  Role: agent');
    
    // Also reset the admin password
    const adminPassword = 'admin123';
    const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    const [adminResult] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [adminPasswordHash, 'admin']
    );
    
    if (adminResult.affectedRows > 0) {
      console.log('✅ Admin password reset successfully');
      console.log('📋 Admin credentials:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
      console.log('  Role: admin');
    }
    
    console.log('\n🎉 Test passwords reset completed!');
    console.log('You can now log in with these credentials to test the Users Management module.');
    
  } catch (err) {
    console.error('❌ Error resetting password:', err);
  } finally {
    process.exit(0);
  }
}

resetTestPassword(); 