const pool = require('../config/db');

async function testFrontendAPI() {
  try {
    console.log('🧪 Testing if frontend is using real API...');
    
    // Check current boards in database
    console.log('\n📋 Current boards in database:');
    const [boards] = await pool.query('SELECT * FROM boards');
    console.log(`Found ${boards.length} boards:`, boards.map(b => b.title));
    
    // Check current tasks in database
    console.log('\n📋 Current tasks in database:');
    const [tasks] = await pool.query('SELECT * FROM tasks');
    console.log(`Found ${tasks.length} tasks:`, tasks.map(t => t.title));
    
    console.log('\n🎯 Now try creating a task from the frontend:');
    console.log('1. Go to http://localhost:5173 (frontend)');
    console.log('2. Login as any user');
    console.log('3. Go to Boards in the sidebar');
    console.log('4. Create a new task and assign it to Harun');
    console.log('5. Check the server console for logs');
    console.log('6. Check if notifications are created');
    
    console.log('\n📊 Expected behavior:');
    console.log('- You should see "🎯 Frontend boards request received" in server console');
    console.log('- You should see "🎯 Frontend task creation request" when creating a task');
    console.log('- You should see "✅ Task assignment notifications created" when assigning to Harun');
    console.log('- Harun should receive a notification');
    
  } catch (error) {
    console.error('❌ Error testing frontend API:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testFrontendAPI()
    .then(() => {
      console.log('\nTest completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testFrontendAPI }; 