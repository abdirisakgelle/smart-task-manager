const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function testLogin() {
  try {
    console.log('=== TESTING LOGIN FOR abdimudalib.mohamed.5 ===');
    
    // Test different passwords
    const testPasswords = [
      'password',
      '123456',
      'admin123',
      'user123',
      'agent123',
      'abdimudalib123',
      'mohamed123',
      'test123'
    ];
    
    // Get user from database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND status = "active"',
      ['abdimudalib.mohamed.5']
    );
    
    if (users.length === 0) {
      console.log('❌ User not found or inactive');
      return;
    }
    
    const user = users[0];
    console.log('✅ User found:', {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      status: user.status
    });
    
    // Test password verification
    console.log('\n=== TESTING PASSWORDS ===');
    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, user.password_hash);
      console.log(`${password}: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      if (isValid) {
        console.log('🎉 FOUND VALID PASSWORD:', password);
      }
    }
    
    // Check user permissions
    console.log('\n=== CHECKING PERMISSIONS ===');
    const [permissions] = await pool.query(
      'SELECT page_name, can_access FROM permissions WHERE user_id = ? AND can_access = TRUE',
      [user.user_id]
    );
    
    console.log('User permissions:');
    if (permissions.length === 0) {
      console.log('❌ No permissions found');
    } else {
      permissions.forEach(perm => {
        console.log(`✅ ${perm.page_name}`);
      });
    }
    
    // Check if user has any permissions at all
    const [allPermissions] = await pool.query(
      'SELECT page_name, can_access FROM permissions WHERE user_id = ?',
      [user.user_id]
    );
    
    console.log('\nAll permission records for user:');
    allPermissions.forEach(perm => {
      console.log(`${perm.page_name}: ${perm.can_access ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    await pool.end();
  }
}

testLogin(); 