const pool = require('../config/db');

async function updateUsersSchema() {
  try {
    console.log('🔄 Starting Users Schema Update...');
    
    // Check if users table exists
    const [tables] = await pool.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.log('❌ Users table does not exist. Please run the main schema first.');
      return;
    }
    
    // Get current table structure
    const [columns] = await pool.query('DESCRIBE users');
    console.log('📋 Current users table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Update role ENUM if needed
    console.log('🔄 Updating role ENUM...');
    try {
      await pool.query(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('admin', 'manager', 'agent', 'supervisor', 'media', 'follow_up') DEFAULT 'agent'
      `);
      console.log('✅ Role ENUM updated successfully');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Role ENUM already updated');
      } else {
        console.error('❌ Error updating role ENUM:', err.message);
      }
    }
    
    // Add status column if it doesn't exist
    const hasStatus = columns.some(col => col.Field === 'status');
    if (!hasStatus) {
      console.log('🔄 Adding status column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'
      `);
      console.log('✅ Status column added successfully');
    } else {
      console.log('ℹ️  Status column already exists');
    }
    
    // Add employee_id foreign key if it doesn't exist
    const hasEmployeeId = columns.some(col => col.Field === 'employee_id');
    if (hasEmployeeId) {
      // Check if foreign key exists
      const [foreignKeys] = await pool.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'employee_id' 
        AND REFERENCED_TABLE_NAME = 'employees'
      `);
      
      if (foreignKeys.length === 0) {
        console.log('🔄 Adding employee_id foreign key...');
        await pool.query(`
          ALTER TABLE users 
          ADD CONSTRAINT fk_users_employee_id 
          FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
        `);
        console.log('✅ Employee_id foreign key added successfully');
      } else {
        console.log('ℹ️  Employee_id foreign key already exists');
      }
    } else {
      console.log('🔄 Adding employee_id column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN employee_id INT NULL,
        ADD CONSTRAINT fk_users_employee_id 
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
      `);
      console.log('✅ Employee_id column and foreign key added successfully');
    }
    
    // Check for duplicate employee_id entries before adding unique constraint
    console.log('🔄 Checking for duplicate employee_id entries...');
    const [duplicates] = await pool.query(`
      SELECT employee_id, COUNT(*) as count, GROUP_CONCAT(username) as usernames
      FROM users 
      WHERE employee_id IS NOT NULL 
      GROUP BY employee_id 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate employee_id entries:');
      duplicates.forEach(dup => {
        console.log(`  - Employee ID ${dup.employee_id}: ${dup.count} users (${dup.usernames})`);
      });
      
      // Keep the first user for each employee_id and set others to NULL
      console.log('🔄 Resolving duplicate employee_id entries...');
      for (const dup of duplicates) {
        const [usersWithEmployee] = await pool.query(`
          SELECT user_id, username 
          FROM users 
          WHERE employee_id = ? 
          ORDER BY user_id
        `, [dup.employee_id]);
        
        // Keep the first user, set others to NULL
        const usersToUpdate = usersWithEmployee.slice(1);
        for (const user of usersToUpdate) {
          console.log(`  - Setting employee_id to NULL for user: ${user.username} (ID: ${user.user_id})`);
          await pool.query(`
            UPDATE users 
            SET employee_id = NULL 
            WHERE user_id = ?
          `, [user.user_id]);
        }
      }
      console.log('✅ Duplicate employee_id entries resolved');
    } else {
      console.log('ℹ️  No duplicate employee_id entries found');
    }
    
    // Add unique constraint for employee_id if it doesn't exist
    const [uniqueConstraints] = await pool.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'employee_id' 
      AND CONSTRAINT_NAME LIKE '%unique%'
    `);
    
    if (uniqueConstraints.length === 0) {
      console.log('🔄 Adding unique constraint for employee_id...');
      try {
        await pool.query(`
          ALTER TABLE users 
          ADD CONSTRAINT unique_employee_user UNIQUE (employee_id)
        `);
        console.log('✅ Unique constraint for employee_id added successfully');
      } catch (err) {
        console.error('❌ Error adding unique constraint:', err.message);
      }
    } else {
      console.log('ℹ️  Unique constraint for employee_id already exists');
    }
    
    // Update existing users with 'user' role to 'agent'
    console.log('🔄 Updating existing users with old role values...');
    const [oldRoleUsers] = await pool.query(`
      SELECT user_id, username, role 
      FROM users 
      WHERE role = 'user'
    `);
    
    if (oldRoleUsers.length > 0) {
      console.log(`📋 Found ${oldRoleUsers.length} users with old 'user' role:`);
      oldRoleUsers.forEach(user => {
        console.log(`  - ${user.username} (ID: ${user.user_id})`);
      });
      
      await pool.query(`
        UPDATE users 
        SET role = 'agent' 
        WHERE role = 'user'
      `);
      console.log('✅ Updated users with old role to "agent"');
    } else {
      console.log('ℹ️  No users with old role values found');
    }
    
    // Display final table structure
    console.log('\n📊 Final users table structure:');
    const [finalColumns] = await pool.query('DESCRIBE users');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Display current users
    console.log('\n👥 Current users in system:');
    const [users] = await pool.query(`
      SELECT u.user_id, u.username, u.role, u.status, u.employee_id, e.name as employee_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      ORDER BY u.username
    `);
    
    if (users.length === 0) {
      console.log('  No users found');
    } else {
      users.forEach(user => {
        console.log(`  - ${user.username} (${user.role}, ${user.status}) -> ${user.employee_name || 'No employee linked'}`);
      });
    }
    
    console.log('\n🎉 Users Schema Update completed successfully!');
    
  } catch (err) {
    console.error('❌ Error during schema update:', err);
  } finally {
    process.exit(0);
  }
}

updateUsersSchema(); 