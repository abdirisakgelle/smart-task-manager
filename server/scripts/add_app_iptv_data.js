const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTestData() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'nasiye@2025',
      database: process.env.DB_NAME || 'nasiye_tasks'
    });

    console.log('Connected to database');

    // Add test tickets with App and IPTV categories
    const testTickets = [
      {
        customer_phone: '+252123456789',
        communication_channel: 'Phone',
        device_type: 'Mobile',
        issue_type: 'App',
        issue_description: 'App login issue',
        agent_id: 1,
        first_call_resolution: true,
        resolution_status: 'done',
        end_time: new Date(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        customer_phone: '+252123456790',
        communication_channel: 'Phone',
        device_type: 'TV',
        issue_type: 'IPTV',
        issue_description: 'IPTV streaming problem',
        agent_id: 1,
        first_call_resolution: false,
        resolution_status: 'done',
        end_time: new Date(),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        customer_phone: '+252123456791',
        communication_channel: 'Phone',
        device_type: 'Mobile',
        issue_type: 'App',
        issue_description: 'App payment issue',
        agent_id: 2,
        first_call_resolution: true,
        resolution_status: 'done',
        end_time: new Date(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        customer_phone: '+252123456792',
        communication_channel: 'Phone',
        device_type: 'TV',
        issue_type: 'IPTV',
        issue_description: 'IPTV channel not working',
        agent_id: 2,
        first_call_resolution: false,
        resolution_status: 'done',
        end_time: new Date(),
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        customer_phone: '+252123456793',
        communication_channel: 'Phone',
        device_type: 'Mobile',
        issue_type: 'App',
        issue_description: 'App update problem',
        agent_id: 1,
        first_call_resolution: true,
        resolution_status: 'done',
        end_time: new Date(),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        customer_phone: '+252123456794',
        communication_channel: 'Phone',
        device_type: 'TV',
        issue_type: 'IPTV',
        issue_description: 'IPTV subscription expired',
        agent_id: 2,
        first_call_resolution: true,
        resolution_status: 'done',
        end_time: new Date(),
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      }
    ];

    for (const ticket of testTickets) {
      await connection.execute(`
        INSERT INTO tickets (
          customer_phone, communication_channel, device_type, 
          issue_type, issue_description, agent_id, 
          first_call_resolution, resolution_status, end_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        ticket.customer_phone,
        ticket.communication_channel,
        ticket.device_type,
        ticket.issue_type,
        ticket.issue_description,
        ticket.agent_id,
        ticket.first_call_resolution,
        ticket.resolution_status,
        ticket.end_time,
        ticket.created_at
      ]);
    }

    console.log('✅ Added test data for App and IPTV categories');
    
    // Verify the data was added
    const [rows] = await connection.execute(`
      SELECT issue_type, COUNT(*) as count 
      FROM tickets 
      WHERE issue_type IN ('App', 'IPTV') 
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY issue_type
    `);
    
    console.log('📊 Current App and IPTV ticket counts:');
    rows.forEach(row => {
      console.log(`  ${row.issue_type}: ${row.count} tickets`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addTestData(); 