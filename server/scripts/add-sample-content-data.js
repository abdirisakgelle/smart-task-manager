const pool = require('../config/db');

async function addSampleContentData() {
  try {
    console.log('📝 Adding sample content data for media user...');
    
    // Get the media user's employee ID
    const [mediaUser] = await pool.query(`
      SELECT employee_id FROM users WHERE username = 'media'
    `);
    
    if (mediaUser.length === 0) {
      console.log('❌ Media user not found');
      return;
    }
    
    const employeeId = mediaUser[0].employee_id;
    console.log(`📋 Using employee ID: ${employeeId}`);
    
    // Add sample ideas
    const sampleIdeas = [
      {
        title: 'How to Make Traditional Somali Tea',
        submission_date: new Date(),
        contributor_id: employeeId,
        script_writer_id: employeeId,
        status: 'approved',
        priority: 'high'
      },
      {
        title: 'Somali Cultural Traditions Explained',
        submission_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        contributor_id: employeeId,
        script_writer_id: employeeId,
        status: 'in_progress',
        priority: 'medium'
      },
      {
        title: 'Modern Somali Fashion Trends',
        submission_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        contributor_id: employeeId,
        script_writer_id: employeeId,
        status: 'completed',
        priority: 'low'
      }
    ];
    
    for (const idea of sampleIdeas) {
      const [result] = await pool.query(`
        INSERT INTO ideas (title, submission_date, contributor_id, script_writer_id, status, priority)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [idea.title, idea.submission_date, idea.contributor_id, idea.script_writer_id, idea.status, idea.priority]);
      
      console.log(`✅ Added idea: ${idea.title} (ID: ${result.insertId})`);
      
      // Add content for completed ideas
      if (idea.status === 'completed') {
        const [contentResult] = await pool.query(`
          INSERT INTO content (idea_id, title, script_status, content_status, director_id)
          VALUES (?, ?, ?, ?, ?)
        `, [result.insertId, idea.title, 'completed', 'Completed', employeeId]);
        
        console.log(`✅ Added content for idea: ${idea.title} (Content ID: ${contentResult.insertId})`);
        
        // Add social media post for completed content
        const [socialResult] = await pool.query(`
          INSERT INTO social_media (content_id, platforms, post_type, post_date, status)
          VALUES (?, ?, ?, ?, ?)
        `, [contentResult.insertId, 'Instagram,Facebook', 'video', new Date(), 'published']);
        
        console.log(`✅ Added social media post for content: ${idea.title}`);
      }
    }
    
    console.log('\n📊 Sample content data added successfully!');
    
    // Display summary
    const [ideasCount] = await pool.query(`
      SELECT COUNT(*) as total FROM ideas WHERE contributor_id = ?
    `, [employeeId]);
    
    const [contentCount] = await pool.query(`
      SELECT COUNT(*) as total FROM content WHERE director_id = ?
    `, [employeeId]);
    
    const [socialCount] = await pool.query(`
      SELECT COUNT(*) as total FROM social_media WHERE content_id IN (
        SELECT content_id FROM content WHERE director_id = ?
      )
    `, [employeeId]);
    
    console.log('\n📈 Content Dashboard Summary:');
    console.log(`  • Ideas submitted: ${ideasCount[0].total}`);
    console.log(`  • Content produced: ${contentCount[0].total}`);
    console.log(`  • Social posts: ${socialCount[0].total}`);
    
  } catch (error) {
    console.error('❌ Error adding sample content data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  addSampleContentData()
    .then(() => {
      console.log('✅ Sample content data added successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to add sample content data:', error);
      process.exit(1);
    });
}

module.exports = addSampleContentData; 