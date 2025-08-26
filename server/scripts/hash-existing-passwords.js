const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function hashExistingPasswords() {
  try {
    console.log('🔄 Starting password hashing migration...');
    
    // Get all users with plain text passwords
    const [users] = await pool.query(`
      SELECT user_id, username, password_hash 
      FROM users 
      ORDER BY user_id
    `);
    
    console.log(`📋 Found ${users.length} users to process:`);
    users.forEach(user => {
      console.log(`  - ${user.username} (ID: ${user.user_id})`);
    });
    
    let hashedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      try {
        // Check if password is already hashed (bcrypt hashes start with $2b$)
        if (user.password_hash.startsWith('$2b$')) {
          console.log(`  ℹ️  Password for ${user.username} is already hashed, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Hash the plain text password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(user.password_hash, saltRounds);
        
        // Update the user's password
        await pool.query(
          'UPDATE users SET password_hash = ? WHERE user_id = ?',
          [hashedPassword, user.user_id]
        );
        
        console.log(`  ✅ Hashed password for ${user.username}`);
        hashedCount++;
        
      } catch (err) {
        console.error(`  ❌ Error hashing password for ${user.username}:`, err.message);
      }
    }
    
    console.log('\n📊 Password hashing summary:');
    console.log(`  - Total users: ${users.length}`);
    console.log(`  - Passwords hashed: ${hashedCount}`);
    console.log(`  - Already hashed: ${skippedCount}`);
    console.log(`  - Errors: ${users.length - hashedCount - skippedCount}`);
    
    console.log('\n🎉 Password hashing migration completed!');
    
  } catch (err) {
    console.error('❌ Error during password hashing:', err);
  } finally {
    process.exit(0);
  }
}

hashExistingPasswords(); 