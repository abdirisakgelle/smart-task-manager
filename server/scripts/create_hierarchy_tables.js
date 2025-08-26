const mysql = require('mysql2/promise');

async function createHierarchyTables() {
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

    // Create departments table
    console.log('Creating departments table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS departments (
        department_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sections table
    console.log('Creating sections table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sections (
        section_id INT AUTO_INCREMENT PRIMARY KEY,
        department_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(department_id),
        UNIQUE KEY unique_section_per_dept (department_id, name)
      )
    `);

    // Create units table
    console.log('Creating units table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS units (
        unit_id INT AUTO_INCREMENT PRIMARY KEY,
        section_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES sections(section_id),
        UNIQUE KEY unique_unit_per_section (section_id, name)
      )
    `);

    console.log('✅ Hierarchy tables created successfully');

    // Check if we need to populate with sample data
    const [deptCount] = await connection.execute('SELECT COUNT(*) as count FROM departments');
    
    if (deptCount[0].count === 0) {
      console.log('\nPopulating with sample hierarchy data...');
      
      // Insert sample departments
      await connection.execute(`
        INSERT INTO departments (name) VALUES 
        ('Customer Support'),
        ('Digital Media'),
        ('VOD'),
        ('Product Development')
      `);

      // Get department IDs
      const [departments] = await connection.execute('SELECT department_id, name FROM departments');
      
      // Insert sections for each department
      for (const dept of departments) {
        if (dept.name === 'Customer Support') {
          await connection.execute(`
            INSERT INTO sections (department_id, name) VALUES 
            (?, 'Support')
          `, [dept.department_id]);
        } else if (dept.name === 'Digital Media') {
          await connection.execute(`
            INSERT INTO sections (department_id, name) VALUES 
            (?, 'Content'),
            (?, 'Production'),
            (?, 'Social Media')
          `, [dept.department_id, dept.department_id, dept.department_id]);
        } else if (dept.name === 'VOD') {
          await connection.execute(`
            INSERT INTO sections (department_id, name) VALUES 
            (?, 'VOD Operations')
          `, [dept.department_id]);
        } else if (dept.name === 'Product Development') {
          await connection.execute(`
            INSERT INTO sections (department_id, name) VALUES 
            (?, 'Product Dev')
          `, [dept.department_id]);
        }
      }

      // Get section IDs and insert units
      const [sections] = await connection.execute(`
        SELECT s.section_id, s.name, d.name as dept_name 
        FROM sections s 
        JOIN departments d ON s.department_id = d.department_id
      `);

      for (const section of sections) {
        if (section.dept_name === 'Customer Support' && section.name === 'Support') {
          await connection.execute(`
            INSERT INTO units (section_id, name) VALUES 
            (?, 'Support Agent'),
            (?, 'Supervisor'),
            (?, 'Team Lead')
          `, [section.section_id, section.section_id, section.section_id]);
        } else if (section.dept_name === 'Digital Media') {
          if (section.name === 'Content') {
            await connection.execute(`
              INSERT INTO units (section_id, name) VALUES 
              (?, 'Content Creator'),
              (?, 'Editor'),
              (?, 'Script Writer')
            `, [section.section_id, section.section_id, section.section_id]);
          } else if (section.name === 'Production') {
            await connection.execute(`
              INSERT INTO units (section_id, name) VALUES 
              (?, 'Director'),
              (?, 'Producer'),
              (?, 'Camera Operator')
            `, [section.section_id, section.section_id, section.section_id]);
          } else if (section.name === 'Social Media') {
            await connection.execute(`
              INSERT INTO units (section_id, name) VALUES 
              (?, 'Social Media Specialist'),
              (?, 'Content Manager')
            `, [section.section_id, section.section_id]);
          }
        } else if (section.dept_name === 'VOD' && section.name === 'VOD Operations') {
          await connection.execute(`
            INSERT INTO units (section_id, name) VALUES 
            (?, 'VOD Operator'),
            (?, 'VOD Manager')
          `, [section.section_id, section.section_id]);
        } else if (section.dept_name === 'Product Development' && section.name === 'Product Dev') {
          await connection.execute(`
            INSERT INTO units (section_id, name) VALUES 
            (?, 'Developer'),
            (?, 'Product Manager'),
            (?, 'QA Engineer')
          `, [section.section_id, section.section_id, section.section_id]);
        }
      }

      console.log('✅ Sample hierarchy data populated successfully');
    } else {
      console.log('ℹ️  Departments already exist, skipping sample data population');
    }

    // Show the hierarchy
    console.log('\n📋 Current hierarchy:');
    const [hierarchy] = await connection.execute(`
      SELECT 
        d.name as department,
        s.name as section,
        u.name as unit
      FROM departments d
      LEFT JOIN sections s ON d.department_id = s.department_id
      LEFT JOIN units u ON s.section_id = u.section_id
      ORDER BY d.name, s.name, u.name
    `);

    let currentDept = '';
    let currentSection = '';
    
    hierarchy.forEach(row => {
      if (row.department !== currentDept) {
        console.log(`\n🏢 ${row.department}`);
        currentDept = row.department;
        currentSection = '';
      }
      
      if (row.section !== currentSection) {
        console.log(`  📁 ${row.section}`);
        currentSection = row.section;
      }
      
      if (row.unit) {
        console.log(`    👤 ${row.unit}`);
      }
    });

    console.log('\n✅ Hierarchy tables setup completed!');

  } catch (error) {
    console.error('❌ Error creating hierarchy tables:', error);
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
  createHierarchyTables()
    .then(() => {
      console.log('\n🎉 Hierarchy setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Hierarchy setup failed:', error);
      process.exit(1);
    });
}

module.exports = createHierarchyTables;
