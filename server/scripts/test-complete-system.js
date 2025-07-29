const pool = require('../config/db');

async function testCompleteSystem() {
  try {
    console.log('🧪 Testing complete task creation and notification system...');
    
    // Get Harun's employee ID
    const [harunEmployee] = await pool.query('SELECT employee_id FROM users WHERE username = ?', ['harun']);
    console.log('\nHarun\'s employee ID:', harunEmployee[0]?.employee_id);
    
    // Get a board to create a task in
    const [boards] = await pool.query('SELECT * FROM boards LIMIT 1');
    if (boards.length === 0) {
      console.log('❌ No boards found. Please create boards first.');
      return;
    }
    
    const boardId = boards[0].id;
    console.log('\nUsing board ID:', boardId);
    
    // Test task data
    const taskData = {
      title: "Test Task for Harun - Complete System Test",
      priority: "high",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      assign: [
        { value: "3", label: "Harun Mohamud Ahmed" } // Harun's employee_id
      ]
    };
    
    console.log('\nTest task data:');
    console.log(taskData);
    
    // Create the task using the boards controller
    const { createTask } = require('../controllers/boardsController');
    
    // Mock request and response
    const mockReq = {
      params: { boardId },
      body: taskData
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`\n✅ Task created successfully (${code}):`);
          console.log(data);
        }
      })
    };
    
    console.log('\nCreating task...');
    await createTask(mockReq, mockRes);
    
    // Check if notification was created
    console.log('\n🔍 Checking for notifications...');
    const [harunNotifications] = await pool.query(`
      SELECT * FROM notifications WHERE user_id = 5 ORDER BY created_at DESC LIMIT 5
    `);
    
    console.log('\nHarun\'s notifications after task creation:');
    console.log(harunNotifications);
    
    // Check the created task
    console.log('\n📋 Checking created task...');
    const [createdTasks] = await pool.query(`
      SELECT * FROM tasks WHERE board_id = ? ORDER BY created_at DESC LIMIT 1
    `);
    
    console.log('\nCreated task:');
    console.log(createdTasks[0]);
    
    console.log('\n🎉 Complete system test finished!');
    
  } catch (error) {
    console.error('❌ Error testing complete system:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testCompleteSystem()
    .then(() => {
      console.log('\nTest completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCompleteSystem }; 