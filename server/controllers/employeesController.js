import pool from '../config/db.js';

// Register a new employee with auto-generated job title
export const registerEmployee = async (req, res) => {
  const { name, shift, unit_id, phone } = req.body;
  
  if (!name || !shift || !unit_id) {
    return res.status(400).json({ 
      error: 'Name, shift, and unit_id are required.' 
    });
  }
  
  try {
    // First, get the unit and section information to generate job title
    const [unitInfo] = await pool.query(`
      SELECT u.name AS unit_name, s.name AS section_name
      FROM units u
      JOIN sections s ON u.section_id = s.section_id
      WHERE u.unit_id = ?
    `, [unit_id]);
    
    if (unitInfo.length === 0) {
      return res.status(400).json({ error: 'Invalid unit_id provided.' });
    }
    
    // Generate job title
    const jobTitle = `${unitInfo[0].unit_name} – ${unitInfo[0].section_name}`;
    
    // Insert the new employee with the generated job title
    const [result] = await pool.query(
      'INSERT INTO employees (name, shift, phone, unit_id, job_title) VALUES (?, ?, ?, ?, ?)',
      [name, shift, phone || null, unit_id, jobTitle]
    );
    
    res.status(201).json({
      employee_id: result.insertId,
      name,
      shift,
      phone: phone || null,
      unit_id,
      job_title: jobTitle,
      unit_name: unitInfo[0].unit_name,
      section_name: unitInfo[0].section_name
    });
  } catch (err) {
    console.error('Error registering employee:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create a new employee (updated to include job_title)
export const createEmployee = async (req, res) => {
  const { name, shift, unit_id, phone, job_title } = req.body;
  if (!name || !shift) {
    return res.status(400).json({ error: 'Name and shift are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO employees (name, shift, unit_id, phone, job_title) VALUES (?, ?, ?, ?, ?)',
      [name, shift, unit_id || null, phone || null, job_title || null]
    );
    res.status(201).json({
      employee_id: result.insertId,
      name,
      shift,
      unit_id: unit_id || null,
      phone: phone || null,
      job_title: job_title || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all employees with hierarchy info
export const getAllEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.employee_id,
        e.name,
        e.shift,
        e.phone,
        e.unit_id,
        e.job_title,
        u.name AS unit,
        s.name AS section,
        d.name AS department
      FROM employees e
      LEFT JOIN units u ON e.unit_id = u.unit_id
      LEFT JOIN sections s ON u.section_id = s.section_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      ORDER BY e.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get employee by ID with hierarchy info
export const getEmployeeById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.employee_id,
        e.name,
        e.shift,
        e.phone,
        e.unit_id,
        e.job_title,
        u.name AS unit,
        s.name AS section,
        d.name AS department
      FROM employees e
      LEFT JOIN units u ON e.unit_id = u.unit_id
      LEFT JOIN sections s ON u.section_id = s.section_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      WHERE e.employee_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update employee by ID
export const updateEmployee = async (req, res) => {
  const { name, shift, unit_id, phone } = req.body;
  if (!name || !shift) {
    return res.status(400).json({ error: 'Name and shift are required.' });
  }
  
  try {
    let jobTitle = null;
    
    // If unit_id is provided, generate new job title
    if (unit_id) {
      const [unitInfo] = await pool.query(`
        SELECT u.name AS unit_name, s.name AS section_name
        FROM units u
        JOIN sections s ON u.section_id = s.section_id
        WHERE u.unit_id = ?
      `, [unit_id]);
      
      if (unitInfo.length > 0) {
        jobTitle = `${unitInfo[0].unit_name} – ${unitInfo[0].section_name}`;
      }
    }
    
    const [result] = await pool.query(
      'UPDATE employees SET name = ?, shift = ?, unit_id = ?, phone = ?, job_title = ? WHERE employee_id = ?',
      [name, shift, unit_id || null, phone || null, jobTitle, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json({
      employee_id: req.params.id,
      name,
      shift,
      unit_id: unit_id || null,
      phone: phone || null,
      job_title: jobTitle
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete employee by ID
export const deleteEmployee = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM employees WHERE employee_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ message: 'Employee deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get employees by department
export const getEmployeesByDepartment = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.employee_id,
        e.name,
        e.shift,
        e.phone,
        e.unit_id,
        e.job_title,
        u.name AS unit,
        s.name AS section,
        d.name AS department
      FROM employees e
      LEFT JOIN units u ON e.unit_id = u.unit_id
      LEFT JOIN sections s ON u.section_id = s.section_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      WHERE d.name = ?
      ORDER BY e.name
    `, [req.params.department]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get employees by shift
export const getEmployeesByShift = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.employee_id,
        e.name,
        e.shift,
        e.phone,
        e.unit_id,
        e.job_title,
        u.name AS unit,
        s.name AS section,
        d.name AS department
      FROM employees e
      LEFT JOIN units u ON e.unit_id = u.unit_id
      LEFT JOIN sections s ON u.section_id = s.section_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      WHERE e.shift = ?
      ORDER BY e.name
    `, [req.params.shift]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 