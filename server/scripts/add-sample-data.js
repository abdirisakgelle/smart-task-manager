const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'nasiye@2025',
  database: process.env.DB_NAME || 'nasiye_tasks',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function addSampleData() {
  try {
    console.log('Adding sample data for testing dashboards...');
    
    // Get user IDs for different roles
    const [users] = await pool.query('SELECT user_id, username, role FROM users');
    const userMap = {};
    users.forEach(user => {
      userMap[user.role] = user.user_id;
    });
    
    // Add sample employees
    const employees = [
      { name: 'Agent Test User', department: 'Call Center', shift: 'Day' },
      { name: 'Content Creator Test', department: 'Media', shift: 'Day' },
      { name: 'Supervisor Test User', department: 'Quality Assurance', shift: 'Day' },
      { name: 'Follow-up Specialist', department: 'Customer Service', shift: 'Day' }
    ];
    
    for (const emp of employees) {
      await pool.query(
        'INSERT INTO employees (name, department, shift) VALUES (?, ?, ?)',
        [emp.name, emp.department, emp.shift]
      );
    }
    
    // Get employee IDs
    const [employeeIds] = await pool.query('SELECT employee_id FROM employees ORDER BY employee_id DESC LIMIT 4');
    
    // Add sample tickets for agents
    const tickets = [
      { customer_phone: '1234567890', issue_type: 'Technical Support', agent_id: userMap.agent || 1, resolution_status: 'Done' },
      { customer_phone: '2345678901', issue_type: 'Billing Issue', agent_id: userMap.agent || 1, resolution_status: 'In Progress' },
      { customer_phone: '3456789012', issue_type: 'Account Access', agent_id: userMap.agent || 1, resolution_status: 'Done' },
      { customer_phone: '4567890123', issue_type: 'Service Request', agent_id: userMap.agent || 1, resolution_status: 'Pending' }
    ];
    
    for (const ticket of tickets) {
      await pool.query(
        'INSERT INTO tickets (customer_phone, issue_type, agent_id, resolution_status, created_at) VALUES (?, ?, ?, ?, NOW())',
        [ticket.customer_phone, ticket.issue_type, ticket.agent_id, ticket.resolution_status]
      );
    }
    
    // Add sample ideas for content creators
    const ideas = [
      { title: 'Social Media Campaign', contributor_id: employeeIds[0]?.employee_id || 1, status: 'approved' },
      { title: 'Video Tutorial Series', contributor_id: employeeIds[0]?.employee_id || 1, status: 'production' },
      { title: 'Customer Success Stories', contributor_id: employeeIds[0]?.employee_id || 1, status: 'bank' }
    ];
    
    for (const idea of ideas) {
      await pool.query(
        'INSERT INTO ideas (title, contributor_id, script_writer_id, submission_date, status) VALUES (?, ?, ?, CURDATE(), ?)',
        [idea.title, idea.contributor_id, idea.contributor_id, idea.status]
      );
    }
    
    // Add sample follow-ups
    const followUps = [
      { ticket_id: 1, follow_up_agent_id: userMap.follow_up || 1, satisfied: 1, issue_solved: 1 },
      { ticket_id: 2, follow_up_agent_id: userMap.follow_up || 1, satisfied: 0, issue_solved: 0 },
      { ticket_id: 3, follow_up_agent_id: userMap.follow_up || 1, satisfied: 1, issue_solved: 1 }
    ];
    
    for (const followUp of followUps) {
      await pool.query(
        'INSERT INTO follow_ups (ticket_id, follow_up_agent_id, follow_up_date, satisfied, issue_solved) VALUES (?, ?, CURDATE(), ?, ?)',
        [followUp.ticket_id, followUp.follow_up_agent_id, followUp.satisfied, followUp.issue_solved]
      );
    }
    
    // Add sample supervisor reviews
    const reviews = [
      { ticket_id: 1, supervisor_id: userMap.supervisor || 1, issue_status: 'resolved' },
      { ticket_id: 2, supervisor_id: userMap.supervisor || 1, issue_status: 'escalated' }
    ];
    
    for (const review of reviews) {
      await pool.query(
        'INSERT INTO supervisor_reviews (ticket_id, supervisor_id, issue_status) VALUES (?, ?, ?)',
        [review.ticket_id, review.supervisor_id, review.issue_status]
      );
    }
    
    // Add sample content
    const content = [
      { title: 'Product Demo Video', content_status: 'Completed', script_status: 'Done' },
      { title: 'Customer Testimonial', content_status: 'In Progress', script_status: 'Done' }
    ];
    
    for (const cont of content) {
      await pool.query(
        'INSERT INTO content (idea_id, title, script_status, content_status, director_id) VALUES (?, ?, ?, ?, ?)',
        [1, cont.title, cont.script_status, cont.content_status, employeeIds[0]?.employee_id || 1]
      );
    }
    
    // Add sample social media posts
    const socialPosts = [
      { platforms: 'Facebook,Instagram', post_type: 'Video', status: 'published' },
      { platforms: 'Twitter', post_type: 'Image', status: 'published' }
    ];
    
    for (const post of socialPosts) {
      await pool.query(
        'INSERT INTO social_media (content_id, platforms, post_type, post_date, status) VALUES (?, ?, ?, NOW(), ?)',
        [1, post.platforms, post.post_type, post.status]
      );
    }
    
    console.log('✅ Sample data added successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log('  • 4 Sample Tickets');
    console.log('  • 3 Sample Ideas');
    console.log('  • 3 Sample Follow-ups');
    console.log('  • 2 Sample Reviews');
    console.log('  • 2 Sample Content Items');
    console.log('  • 2 Sample Social Media Posts');
    console.log('\n🎯 You can now test all dashboards with realistic data!');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await pool.end();
  }
}

addSampleData(); 