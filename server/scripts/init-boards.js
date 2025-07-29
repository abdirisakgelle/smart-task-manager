const pool = require('../config/db');

async function initBoards() {
  try {
    console.log('Initializing boards and tasks tables...');
    
    // Create boards table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS boards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        board_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        start_date DATE,
        end_date DATE,
        assign_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes
    try {
      await pool.query('CREATE INDEX idx_tasks_board_id ON tasks(board_id)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') throw error;
    }
    
    try {
      await pool.query('CREATE INDEX idx_tasks_created_at ON tasks(created_at)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') throw error;
    }
    
    console.log('✅ Boards and tasks tables created successfully!');
    
    // Check if there are any existing boards
    const [boards] = await pool.query('SELECT * FROM boards');
    
    if (boards.length === 0) {
      console.log('Creating sample boards...');
      
      // Create sample boards
      const sampleBoards = [
        { title: 'Backlog' },
        { title: 'In Progress' },
        { title: 'Done' }
      ];
      
      for (const board of sampleBoards) {
        await pool.query('INSERT INTO boards (title) VALUES (?)', [board.title]);
      }
      
      console.log('✅ Created sample boards: Backlog, In Progress, Done');
    } else {
      console.log(`Found ${boards.length} existing boards`);
    }
    
    console.log('🎉 Boards system initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing boards:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the initialization
if (require.main === module) {
  initBoards()
    .then(() => {
      console.log('Boards initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Boards initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initBoards }; 