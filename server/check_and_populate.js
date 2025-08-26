const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndPopulateData() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'nasiye@2025',
      database: process.env.DB_NAME || 'nasiye_tasks'
    });

    console.log('Connected to database');

    // Check existing data
    const [existingTickets] = await connection.execute('SELECT COUNT(*) as count FROM tickets');
    console.log('Existing tickets:', existingTickets[0].count);

    // Check if we have any tickets with issue_category
    const [categoryTickets] = await connection.execute('SELECT COUNT(*) as count FROM tickets WHERE issue_category IS NOT NULL');
    console.log('Tickets with issue_category:', categoryTickets[0].count);

    // Check current week data
    const [currentWeekTickets] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM tickets 
      WHERE issue_category IN ('App', 'IPTV')
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        AND created_at < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
    `);
    console.log('Current week App/IPTV tickets:', currentWeekTickets[0].count);

    // If no current week data, add sample data
    if (currentWeekTickets[0].count === 0) {
      console.log('Adding sample data for current week...');
      
      const sampleTickets = [
        {
          customer_phone: '+252123456789',
          communication_channel: 'Phone',
          device_type: 'Mobile',
          issue_category: 'App',
          issue_type: 'App',
          issue_description: 'App login issue',
          agent_id: 1,
          first_call_resolution: true,
          resolution_status: 'done',
          end_time: new Date(),
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          customer_phone: '+252123456790',
          communication_channel: 'Phone',
          device_type: 'TV',
          issue_category: 'IPTV',
          issue_type: 'IPTV',
          issue_description: 'IPTV streaming problem',
          agent_id: 1,
          first_call_resolution: false,
          resolution_status: 'done',
          end_time: new Date(),
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          customer_phone: '+252123456791',
          communication_channel: 'Phone',
          device_type: 'Mobile',
          issue_category: 'App',
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
          issue_category: 'IPTV',
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
          issue_category: 'App',
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
          issue_category: 'IPTV',
          issue_type: 'IPTV',
          issue_description: 'IPTV subscription expired',
          agent_id: 2,
          first_call_resolution: true,
          resolution_status: 'done',
          end_time: new Date(),
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
        }
      ];

      for (const ticket of sampleTickets) {
        await connection.execute(`
          INSERT INTO tickets (
            customer_phone, communication_channel, device_type, 
            issue_category, issue_type, issue_description, agent_id, 
            first_call_resolution, resolution_status, end_time, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          ticket.customer_phone,
          ticket.communication_channel,
          ticket.device_type,
          ticket.issue_category,
          ticket.issue_type,
          ticket.issue_description,
          ticket.agent_id,
          ticket.first_call_resolution,
          ticket.resolution_status,
          ticket.end_time,
          ticket.created_at
        ]);
      }
      console.log('Added sample ticket data for current week');
    } else {
      console.log('Current week data already exists');
    }

    console.log('Database check completed successfully');
  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAndPopulateData();
