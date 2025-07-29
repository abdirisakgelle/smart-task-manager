const pool = require('../config/db');

async function testIdeasContentNotifications() {
  try {
    console.log('🧪 Testing Ideas and Content notification system...');
    
    // Test creating an idea with assignments
    console.log('\n📝 Testing Idea Creation with Script Writer and Contributor...');
    
    const testIdeaData = {
      title: "Test Idea for Notifications",
      contributor_id: 3, // Harun
      script_writer_id: 5, // Abdullahi Rage Dahir
      script_deadline: "2024-02-15",
      priority: "high",
      status: "active",
      notes: "This is a test idea for notification testing"
    };
    
    console.log('Test idea data:', testIdeaData);
    
    // Simulate the API call
    const { createIdea } = require('../controllers/ideasController');
    
    const mockReq = {
      body: testIdeaData
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`\n✅ Idea created successfully (${code}):`);
          console.log(data);
        }
      })
    };
    
    await createIdea(mockReq, mockRes);
    
    // Check if notifications were created
    console.log('\n🔍 Checking for idea notifications...');
    const [ideaNotifications] = await pool.query(`
      SELECT n.*, u.username 
      FROM notifications n 
      JOIN users u ON n.user_id = u.user_id 
      WHERE n.type IN ('script_assignment', 'idea_assignment')
      ORDER BY n.created_at DESC 
      LIMIT 5
    `);
    
    console.log('\nIdea notifications created:');
    ideaNotifications.forEach(notif => {
      console.log(`- ID: ${notif.notification_id}, User: ${notif.username}, Type: ${notif.type}, Title: "${notif.title}"`);
    });
    
    // Test creating content with assignments
    console.log('\n🎬 Testing Content Creation with Director and Cast...');
    
    const testContentData = {
      idea_id: 1, // Use existing idea
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
    
    console.log('\n🎉 Ideas and Content notification system test completed!');
    
  } catch (error) {
    console.error('❌ Error testing ideas and content notifications:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testIdeasContentNotifications()
    .then(() => {
      console.log('\nTest completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testIdeasContentNotifications }; 