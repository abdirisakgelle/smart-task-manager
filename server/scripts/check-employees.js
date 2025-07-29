const pool = require('../config/db');

async function checkEmployees() {
  try {
    console.log('Checking employees table...');
    
    // Check if employees table exists
    const [tables] = await pool.query('SHOW TABLES LIKE "employees"');
    if (tables.length === 0) {
      console.log('Employees table does not exist.');
      return;
    }
    
    // Get all employees
    const [employees] = await pool.query('SELECT * FROM employees ORDER BY name');
    
    console.log('\nCurrent employees in database:');
    console.log('=============================');
    
    if (employees.length === 0) {
      console.log('No employees found in database.');
    } else {
      employees.forEach(emp => {
        console.log(`ID: ${emp.employee_id}, Name: ${emp.name}, Department: ${emp.department || 'N/A'}, Shift: ${emp.shift || 'N/A'}`);
      });
    }
    
    // Check user-employee mapping
    console.log('\nUser-Employee Mapping:');
    console.log('======================');
    
    const [userEmployeeMapping] = await pool.query(`
      SELECT u.user_id, u.username, u.employee_id, e.name as employee_name, e.department
      FROM users u 
      LEFT JOIN employees e ON u.employee_id = e.employee_id 
      ORDER BY u.username
    `);
    
    userEmployeeMapping.forEach(mapping => {
      console.log(`User: ${mapping.username} (ID: ${mapping.user_id}) -> Employee: ${mapping.employee_name || 'NOT LINKED'} (ID: ${mapping.employee_id || 'NULL'})`);
    });
    
    // Check for users without employee links
    const usersWithoutEmployee = userEmployeeMapping.filter(mapping => !mapping.employee_id);
    if (usersWithoutEmployee.length > 0) {
      console.log('\n⚠️  Users without employee links (will not receive notifications):');
      usersWithoutEmployee.forEach(user => {
        console.log(`- ${user.username} (ID: ${user.user_id})`);
      });
    }
    
    // Check for potential matches
    console.log('\n🔍 Potential employee matches for unlinked users:');
    const harunUser = userEmployeeMapping.find(u => u.username === 'harun');
    if (harunUser && !harunUser.employee_id) {
      console.log(`\nFor user 'harun':`);
      employees.forEach(emp => {
        if (emp.name.toLowerCase().includes('harun') || emp.name.toLowerCase().includes('harun')) {
          console.log(`- Potential match: ${emp.name} (ID: ${emp.employee_id})`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error checking employees:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
if (require.main === module) {
  checkEmployees()
    .then(() => {
      console.log('\nEmployee check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Employee check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkEmployees }; 