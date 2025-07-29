const pool = require('../config/db');

async function testTaskNotification() {
  try {
    console.log('🧪 Testing task notification creation...');
    
    // Test data
    const taskData = {
      title: "Test Task for Harun",
      description: "This is a test task assignment"
    };
    
    const assignedUsers = [
      { value: "3", label: "Harun Mohamud Ahmed" } // Harun's employee_id
    ];
    
    console.log('\nTest data:');
    console.log('Task:', taskData);
    console.log('Assigned Users:', assignedUsers);
    
    // Test the notification creation function
    const { createTaskAssignmentNotification } = require('../controllers/notificationsController');
    
    console.log('\nCreating notifications...');
    const notifications = await createTaskAssignmentNotification(taskData, assignedUsers);
    
    console.log('\n✅ Notifications created:');
    console.log(notifications);
    
    // Verify the notifications were created in the database
    console.log('\n🔍 Verifying notifications in database...');
    
    const [harunNotifications] = await pool.query(`
      SELECT * FROM notifications WHERE user_id = 5 ORDER BY created_at DESC LIMIT 5
    `);
    
    console.log('\nHarun\'s notifications after test:');
    console.log(harunNotifications);
    
    // Test the API endpoint directly
    console.log('\n🌐 Testing API endpoint...');
    
    const testRequest = {
      taskData: taskData,
      assignedUsers: assignedUsers
    };
    
    console.log('Request data:', JSON.stringify(testRequest, null, 2));
    
    // Simulate the API call
    const { createTaskAssignmentNotifications } = require('../controllers/notificationsController');
    
    // Create a mock request and response
    const mockReq = {
      body: testRequest
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`Response (${code}):`, data);
        }
      })
    };
    
    await createTaskAssignmentNotifications(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ Error testing task notification:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testTaskNotification()
    .then(() => {
      console.log('\nTest completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testTaskNotification }; 