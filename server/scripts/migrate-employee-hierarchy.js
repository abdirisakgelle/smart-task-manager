const pool = require('../config/db');

async function migrateEmployeeHierarchy() {
  try {
    console.log('🔄 Starting Employee Hierarchy Migration...');
    
    // Check if hierarchy tables already exist
    const [departmentsExist] = await pool.query('SHOW TABLES LIKE "departments"');
    const [sectionsExist] = await pool.query('SHOW TABLES LIKE "sections"');
    const [unitsExist] = await pool.query('SHOW TABLES LIKE "units"');
    
    if (departmentsExist.length === 0) {
      console.log('📋 Creating departments table...');
      await pool.query(`
        CREATE TABLE departments (
          department_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL
        )
      `);
      console.log('✅ Departments table created');
    }
    
    if (sectionsExist.length === 0) {
      console.log('📋 Creating sections table...');
      await pool.query(`
        CREATE TABLE sections (
          section_id INT AUTO_INCREMENT PRIMARY KEY,
          department_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Sections table created');
    }
    
    if (unitsExist.length === 0) {
      console.log('📋 Creating units table...');
      await pool.query(`
        CREATE TABLE units (
          unit_id INT AUTO_INCREMENT PRIMARY KEY,
          section_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Units table created');
    }
    
    // Check if unit_id column exists in employees table
    const [employeeColumns] = await pool.query('DESCRIBE employees');
    const hasUnitId = employeeColumns.some(col => col.Field === 'unit_id');
    
    if (!hasUnitId) {
      console.log('📋 Adding unit_id column to employees table...');
      await pool.query(`
        ALTER TABLE employees
        ADD COLUMN unit_id INT,
        ADD FOREIGN KEY (unit_id) REFERENCES units(unit_id) ON DELETE SET NULL
      `);
      console.log('✅ unit_id column added to employees table');
    }
    
    // Check if department column still exists
    const hasDepartment = employeeColumns.some(col => col.Field === 'department');
    
    if (hasDepartment) {
      console.log('📋 Removing department column from employees table...');
      await pool.query('ALTER TABLE employees DROP COLUMN department');
      console.log('✅ department column removed from employees table');
    }
    
    // Insert sample hierarchy data if tables are empty
    const [departments] = await pool.query('SELECT COUNT(*) as count FROM departments');
    if (departments[0].count === 0) {
      console.log('📋 Inserting sample hierarchy data...');
      
      // Insert departments
      await pool.query(`
        INSERT INTO departments (name) VALUES 
        ('Marcom')
      `);
      
      // Insert sections
      await pool.query(`
        INSERT INTO sections (department_id, name) VALUES 
        (1, 'Customer Support'),
        (1, 'Digital Media')
      `);
      
      // Insert units
      await pool.query(`
        INSERT INTO units (section_id, name) VALUES 
        (1, 'Agent'),
        (2, 'Content Creator'),
        (2, 'Editor'),
        (2, 'Social Media Specialist')
      `);
      
      console.log('✅ Sample hierarchy data inserted');
    }
    
    console.log('🎉 Employee Hierarchy Migration completed successfully!');
    
    // Display current hierarchy structure
    console.log('\n📊 Current Hierarchy Structure:');
    const [hierarchyData] = await pool.query(`
      SELECT 
        d.name as department,
        s.name as section,
        u.name as unit
      FROM departments d
      LEFT JOIN sections s ON d.department_id = s.department_id
      LEFT JOIN units u ON s.section_id = u.section_id
      ORDER BY d.name, s.name, u.name
    `);
    
    hierarchyData.forEach(row => {
      console.log(`  ${row.department} → ${row.section} → ${row.unit}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateEmployeeHierarchy()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateEmployeeHierarchy; 