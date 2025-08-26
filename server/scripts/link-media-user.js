const pool = require('../config/db');

async function linkMediaUser() {
  try {
    console.log('🔗 Linking media user to employee record...');
    
    // First, create an employee record for the media user
    const [employeeResult] = await pool.query(
      'INSERT INTO employees (name, shift, phone) VALUES (?, ?, ?)',
      ['Media Test User', 'Morning', '252611234567']
    );
    
    const employeeId = employeeResult.insertId;
    console.log(`✅ Created employee record with ID: ${employeeId}`);
    
    // Now link the media user to this employee
    const [updateResult] = await pool.query(
      'UPDATE users SET employee_id = ? WHERE username = ?',
      [employeeId, 'media']
    );
    
    if (updateResult.affectedRows > 0) {
      console.log('✅ Successfully linked media user to employee record');
    } else {
      console.log('❌ Media user not found or already linked');
    }
    
    // Verify the link
    const [user] = await pool.query(`
      SELECT u.username, u.role, u.employee_id, e.name as employee_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE u.username = 'media'
    `);
    
    if (user.length > 0) {
      console.log('📋 Media user details:');
      console.log(`  Username: ${user[0].username}`);
      console.log(`  Role: ${user[0].role}`);
      console.log(`  Employee ID: ${user[0].employee_id}`);
      console.log(`  Employee Name: ${user[0].employee_name}`);
    }
    
  } catch (error) {
    console.error('❌ Error linking media user:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  linkMediaUser()
    .then(() => {
      console.log('✅ Media user linked successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to link media user:', error);
      process.exit(1);
    });
}

module.exports = linkMediaUser; 