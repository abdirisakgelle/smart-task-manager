const mysql = require('mysql2/promise');

async function updateUsersSystemRole() {
  let connection;
  
  try {
    // Connect to database with default configuration
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'nasiye@2025',
      database: process.env.DB_NAME || 'nasiye_tasks'
    });
    console.log('Connected to database');

    // Check if system_role column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'system_role'
    `);

    if (columns.length === 0) {
      console.log('Adding system_role column to users table...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN system_role ENUM('admin','ceo') NULL AFTER password_hash
      `);
      console.log('✅ system_role column added successfully');
    } else {
      console.log('✅ system_role column already exists');
    }

    // Get current users to analyze
    const [users] = await connection.execute(`
      SELECT user_id, username, role, employee_id, status 
      FROM users 
      ORDER BY user_id
    `);

    console.log(`\nFound ${users.length} users to process:`);

    // Define admin usernames (adjust this list based on your actual admin users)
    const adminUsernames = ['admin', 'gelle', 'superadmin'];
    
    // Define CEO usernames (adjust this list based on your actual CEO users)
    const ceoUsernames = ['ceo', 'director'];

    let updatedCount = 0;

    for (const user of users) {
      let systemRole = null;
      
      // Determine system role based on username or existing role
      if (adminUsernames.includes(user.username.toLowerCase())) {
        systemRole = 'admin';
      } else if (ceoUsernames.includes(user.username.toLowerCase())) {
        systemRole = 'ceo';
      } else if (user.role === 'admin') {
        // If they had admin role before, give them admin system_role
        systemRole = 'admin';
      }

      // Update user with system_role
      if (systemRole) {
        await connection.execute(
          'UPDATE users SET system_role = ? WHERE user_id = ?',
          [systemRole, user.user_id]
        );
        console.log(`✅ Updated user ${user.username} (ID: ${user.user_id}) with system_role: ${systemRole}`);
        updatedCount++;
      } else {
        console.log(`ℹ️  User ${user.username} (ID: ${user.user_id}) - no system_role assigned (regular user)`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Total users processed: ${users.length}`);
    console.log(`- Users with system_role assigned: ${updatedCount}`);
    console.log(`- Regular users (no system_role): ${users.length - updatedCount}`);

    // Show final state
    const [finalUsers] = await connection.execute(`
      SELECT user_id, username, system_role, status 
      FROM users 
      ORDER BY user_id
    `);

    console.log('\n📋 Final user list:');
    finalUsers.forEach(user => {
      const roleDisplay = user.system_role || 'regular';
      console.log(`- ${user.username} (ID: ${user.user_id}): ${roleDisplay} [${user.status}]`);
    });

    console.log('\n✅ Users table updated successfully!');

  } catch (error) {
    console.error('❌ Error updating users:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the migration
if (require.main === module) {
  updateUsersSystemRole()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = updateUsersSystemRole;
