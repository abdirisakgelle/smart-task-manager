const pool = require('../config/db');

async function debugFrontendTask() {
  try {
    console.log('🔍 Debugging frontend task creation...');
    
    // Check recent tasks in database
    console.log('\n📋 Recent tasks in database:');
    const [recentTasks] = await pool.query(`
      SELECT t.*, b.title as board_title 
      FROM tasks t 
      JOIN boards b ON t.board_id = b.id 
      ORDER BY t.created_at DESC 
      LIMIT 10
    `);
    
    if (recentTasks.length === 0) {
      console.log('No tasks found in database.');
    } else {
      recentTasks.forEach(task => {
        console.log(`- Task ID: ${task.id}, Title: "${task.title}", Board: ${task.board_title}, Assign: ${task.assign_data}, Created: ${task.created_at}`);
      });
    }
    
    // Check recent notifications
    console.log('\n🔔 Recent notifications in database:');
    const [recentNotifications] = await pool.query(`
      SELECT n.*, u.username 
      FROM notifications n 
      JOIN users u ON n.user_id = u.user_id 
      ORDER BY n.created_at DESC 
      LIMIT 10
    `);
    
    if (recentNotifications.length === 0) {
      console.log('No notifications found in database.');
    } else {
      recentNotifications.forEach(notif => {
        console.log(`- ID: ${notif.notification_id}, User: ${notif.username}, Title: "${notif.title}", Created: ${notif.created_at}`);
      });
    }
    
    // Check if there are any tasks with assignments
    console.log('\n📊 Tasks with assignments:');
    const [tasksWithAssignments] = await pool.query(`
      SELECT id, title, assign_data 
      FROM tasks 
      WHERE assign_data IS NOT NULL AND assign_data != '[]' AND assign_data != 'null'
      ORDER BY created_at DESC
    `);
    
    if (tasksWithAssignments.length === 0) {
      console.log('No tasks with assignments found.');
    } else {
      tasksWithAssignments.forEach(task => {
        console.log(`- Task ID: ${task.id}, Title: "${task.title}", Assign: ${task.assign_data}`);
      });
    }
    
    // Test the API endpoint directly
    console.log('\n🧪 Testing API endpoint with sample data...');
    
    const testTaskData = {
      title: "Frontend Test Task",
      priority: "medium",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      assign: [
        { value: "3", label: "Harun Mohamud Ahmed" }
      ]
    };
    
    console.log('Test data:', JSON.stringify(testTaskData, null, 2));
    
    // Simulate the API call
    const { createTask } = require('../controllers/boardsController');
    
    const mockReq = {
      params: { boardId: 1 },
      body: testTaskData
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`\n✅ API Response (${code}):`);
          console.log(data);
        }
      })
    };
    
    await createTask(mockReq, mockRes);
    
    // Check if notification was created
    console.log('\n🔍 Checking for new notifications...');
    const [newNotifications] = await pool.query(`
      SELECT * FROM notifications WHERE user_id = 5 ORDER BY created_at DESC LIMIT 3
    `);
    
    console.log('\nNew notifications after API test:');
    console.log(newNotifications);
    
  } catch (error) {
    console.error('❌ Error debugging frontend task:', error);
  } finally {
    await pool.end();
  }
}

// Run the debug
if (require.main === module) {
  debugFrontendTask()
    .then(() => {
      console.log('\nDebug completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Debug failed:', error);
      process.exit(1);
    });
}

module.exports = { debugFrontendTask }; 