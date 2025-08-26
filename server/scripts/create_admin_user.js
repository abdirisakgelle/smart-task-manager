const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
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
      console.log('❌ system_role column does not exist. Please run the migration first:');
      console.log('   node scripts/migrate_to_new_schema.js');
      return;
    }

    // Get admin user details from command line or use defaults
    const username = process.argv[2] || 'newadmin';
    const password = process.argv[3] || 'admin123';
    const email = process.argv[4] || `${username}@nasiye.com`;

    console.log(`\n📝 Creating admin user:`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Email: ${email}`);

    // Check if username already exists
    const [existingUser] = await connection.execute(
      'SELECT user_id, username FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      console.log(`❌ User '${username}' already exists!`);
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new admin user
    const [result] = await connection.execute(
      'INSERT INTO users (username, password_hash, system_role, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [username, passwordHash, 'admin', 'active']
    );

    console.log(`✅ Admin user created successfully!`);
    console.log(`   User ID: ${result.insertId}`);
    console.log(`   Username: ${username}`);
    console.log(`   System Role: admin`);
    console.log(`   Status: active`);

    // Verify the user was created
    const [newUser] = await connection.execute(`
      SELECT user_id, username, system_role, status, created_at
      FROM users WHERE user_id = ?
    `, [result.insertId]);

    console.log(`\n📋 User details:`);
    console.log(`   ID: ${newUser[0].user_id}`);
    console.log(`   Username: ${newUser[0].username}`);
    console.log(`   System Role: ${newUser[0].system_role}`);
    console.log(`   Status: ${newUser[0].status}`);
    console.log(`   Created: ${newUser[0].created_at}`);

    console.log(`\n🎉 You can now login with:`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('\n✅ Admin user creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Admin user creation failed:', error);
      process.exit(1);
    });
}

module.exports = createAdminUser;
