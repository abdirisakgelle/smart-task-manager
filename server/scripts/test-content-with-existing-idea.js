const pool = require('../config/db');

async function testContentWithExistingIdea() {
  try {
    console.log('🎬 Testing Content Creation with existing idea...');
    
    // Get an existing idea
    const [ideas] = await pool.query('SELECT idea_id, title FROM ideas LIMIT 1');
    
    if (ideas.length === 0) {
      console.log('❌ No ideas found in database. Please create an idea first.');
      return;
    }
    
    const existingIdea = ideas[0];
    console.log('Using existing idea:', existingIdea);
    
    const testContentData = {
      idea_id: existingIdea.idea_id,
      script_status: "completed",
      content_status: "in_production",
      director_id: 6, // Ahmed Hussein Abdi
      filming_date: "2024-02-20",
      cast_and_presenters: [3, 8], // Harun and Edna
      notes: "This is a test content for notification testing"
    };
    
    console.log('Test content data:', testContentData);
    
    // Simulate the API call
    const { createContent } = require('../controllers/contentController');
    
    const mockContentReq = {
      body: testContentData
    };
    
    const mockContentRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`\n✅ Content created successfully (${code}):`);
          console.log(data);
        }
      })
    };
    
    await createContent(mockContentReq, mockContentRes);
    
    // Check if content notifications were created
    console.log('\n🔍 Checking for content notifications...');
    const [contentNotifications] = await pool.query(`
      SELECT n.*, u.username 
      FROM notifications n 
      JOIN users u ON n.user_id = u.user_id 
      WHERE n.type IN ('content_assignment', 'cast_assignment')
      ORDER BY n.created_at DESC 
      LIMIT 5
    `);
    
    console.log('\nContent notifications created:');
    contentNotifications.forEach(notif => {
      console.log(`- ID: ${notif.notification_id}, User: ${notif.username}, Type: ${notif.type}, Title: "${notif.title}"`);
    });
    
    // Show all recent notifications
    console.log('\n📊 All recent notifications:');
    const [allRecentNotifications] = await pool.query(`
      SELECT n.*, u.username 
      FROM notifications n 
      JOIN users u ON n.user_id = u.user_id 
      ORDER BY n.created_at DESC 
      LIMIT 10
    `);
    
    allRecentNotifications.forEach(notif => {
      console.log(`- ID: ${notif.notification_id}, User: ${notif.username}, Type: ${notif.type}, Title: "${notif.title}", Created: ${notif.created_at}`);
    });
    
    console.log('\n🎉 Content notification system test completed!');
    
  } catch (error) {
    console.error('❌ Error testing content notifications:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testContentWithExistingIdea()
    .then(() => {
      console.log('\nTest completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testContentWithExistingIdea }; 