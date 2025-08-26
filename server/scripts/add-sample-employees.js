const pool = require('../config/db');

async function addSampleEmployees() {
  try {
    console.log('👥 Adding sample employees to test hierarchy...');
    
    // Get unit IDs for assignment
    const [units] = await pool.query('SELECT unit_id, name FROM units');
    console.log('Available units:', units);
    
    // Sample employees with hierarchy assignments
    const sampleEmployees = [
      {
        name: 'Ahmed Hassan',
        shift: 'Morning',
        phone: '252611234567',
        unit_id: 2 // Content Creator
      },
      {
        name: 'Fatima Ali',
        shift: 'Afternoon',
        phone: '252612345678',
        unit_id: 3 // Editor
      },
      {
        name: 'Omar Mohamed',
        shift: 'Evening',
        phone: '252613456789',
        unit_id: 4 // Social Media Specialist
      },
      {
        name: 'Amina Yusuf',
        shift: 'Morning',
        phone: '252614567890',
        unit_id: 1 // Agent
      },
      {
        name: 'Khalid Abdi',
        shift: 'Afternoon',
        phone: '252615678901',
        unit_id: 2 // Content Creator
      }
    ];
    
    // Insert sample employees
    for (const employee of sampleEmployees) {
      const [result] = await pool.query(
        'INSERT INTO employees (name, shift, phone, unit_id) VALUES (?, ?, ?, ?)',
        [employee.name, employee.shift, employee.phone, employee.unit_id]
      );
      console.log(`✅ Added employee: ${employee.name} (ID: ${result.insertId})`);
    }
    
    console.log('\n📊 Sample employees added successfully!');
    
    // Display current employees with hierarchy
    console.log('\nCurrent employees with hierarchy:');
    const [employees] = await pool.query(`
      SELECT 
        e.employee_id,
        e.name,
        e.shift,
        e.phone,
        u.name AS unit,
        s.name AS section,
        d.name AS department
      FROM employees e
      LEFT JOIN units u ON e.unit_id = u.unit_id
      LEFT JOIN sections s ON u.section_id = s.section_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      ORDER BY e.name
    `);
    
    employees.forEach(emp => {
      console.log(`  ${emp.name} → ${emp.department} → ${emp.section} → ${emp.unit} (${emp.shift})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding sample employees:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  addSampleEmployees()
    .then(() => {
      console.log('✅ Sample employees added successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to add sample employees:', error);
      process.exit(1);
    });
}

module.exports = addSampleEmployees; 