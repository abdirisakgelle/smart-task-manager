const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function resetUserPassword() {
  try {
    const username = 'abdimudalib.mohamed.5';
    const newPassword = 'password123';
    
    console.log(`=== RESETTING PASSWORD FOR ${username} ===`);
    
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the user's password
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [hashedPassword, username]
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Password updated successfully');
      console.log(`📝 New password: ${newPassword}`);
      
      // Verify the password works
      const [users] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      if (users.length > 0) {
        const user = users[0];
        const isValid = await bcrypt.compare(newPassword, user.password_hash);
        console.log(`🔐 Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
        
        // Check permissions
        const [permissions] = await pool.query(
          'SELECT page_name FROM permissions WHERE user_id = ? AND can_access = TRUE',
          [user.user_id]
        );
        
        console.log(`📋 User has ${permissions.length} permissions:`);
        permissions.forEach(perm => {
          console.log(`   ✅ ${perm.page_name}`);
        });
      }
    } else {
      console.log('❌ User not found or password not updated');
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await pool.end();
  }
}

resetUserPassword(); 