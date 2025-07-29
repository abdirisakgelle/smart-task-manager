require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Drop existing users table to fix schema
    try {
      await pool.query('DROP TABLE IF EXISTS users');
      console.log('Dropped existing users table');
    } catch (error) {
      console.log('No existing users table to drop');
    }
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('Database schema created successfully!');
    
    // Create a test admin user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE username = username',
      ['admin', hashedPassword, 'admin']
    );
    
    console.log('Test user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Role: admin');
    
    // Create a test regular user
    const userHashedPassword = await bcrypt.hash('user123', saltRounds);
    
    await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE username = username',
      ['user', userHashedPassword, 'user']
    );
    
    console.log('Test user created successfully!');
    console.log('Username: user');
    console.log('Password: user123');
    console.log('Role: user');
    
    console.log('Database initialization completed!');
    
    // Initialize notifications system
    console.log('Initializing notifications system...');
    const { initNotifications } = require('./init-notifications');
    await initNotifications();
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    process.exit(0);
  }
}

initializeDatabase(); 