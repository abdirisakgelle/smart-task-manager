const pool = require('../config/db');
const moment = require('moment-timezone');

// Dashboard daily stats - simplified for today only
exports.getDashboardStats = async (req, res) => {
  try {
    // Total tickets today
    const [tickets] = await pool.query(
      "SELECT COUNT(*) as total, SUM(LOWER(resolution_status) = 'done') as done, AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_handle_time FROM tickets WHERE DATE(created_at) = CURDATE()"
    );

    // Total content today (content table doesn't have created_at, so we'll get all content)
    const [contents] = await pool.query(
      "SELECT COUNT(*) as total, SUM(script_status = 'done') as done FROM content"
    );

    // Total posts today
    const [posts] = await pool.query(
      "SELECT COUNT(*) as total, SUM(status = 'published') as published FROM social_media WHERE DATE(post_date) = CURDATE()"
    );

    res.json({
      tickets: {
        total: tickets[0].total || 0,
        done: tickets[0].done || 0,
        avgHandleTimeMinutes: Math.round(tickets[0].avg_handle_time || 0),
      },
      contents: {
        total: contents[0].total || 0,
        done: contents[0].done || 0,
      },
      posts: {
        total: posts[0].total || 0,
        published: posts[0].published || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin KPIs for Call Center and Digital Media - Today's Performance Only
exports.getAdminKPIs = async (req, res) => {
  try {
    // 1. Tickets Today & Done Count
    const [ticketsToday] = await pool.query(`
      SELECT COUNT(*) as total, SUM(LOWER(resolution_status) = 'done') as done
      FROM tickets WHERE DATE(created_at) = CURDATE()
    `);
    const [ticketsYesterday] = await pool.query(`
      SELECT COUNT(*) as total, SUM(LOWER(resolution_status) = 'done') as done
      FROM tickets WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
    `);
    const ticketsTotal = ticketsToday[0].total || 0;
    const ticketsDone = ticketsToday[0].done || 0;
    const ticketsTotalYesterday = ticketsYesterday[0].total || 0;
    const ticketsDoneYesterday = ticketsYesterday[0].done || 0;

    // 2. Average Resolution Time (for tickets resolved today/yesterday only)
    const [avgResTime] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_minutes
      FROM tickets 
      WHERE DATE(created_at) = CURDATE() 
        AND LOWER(resolution_status) = 'done' 
        AND end_time IS NOT NULL
    `);
    const [avgResTimeYesterday] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, end_time)) as avg_minutes
      FROM tickets 
      WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
        AND LOWER(resolution_status) = 'done' 
        AND end_time IS NOT NULL
    `);
    const avgResolutionTime = Math.round(avgResTime[0].avg_minutes || 0);
    const avgResolutionTimeYesterday = Math.round(avgResTimeYesterday[0].avg_minutes || 0);

    // 3. Escalation Rate (tickets escalated to supervisor reviews today/yesterday)
    const [escalated] = await pool.query(`
      SELECT COUNT(DISTINCT t.ticket_id) as escalated
      FROM tickets t
      INNER JOIN supervisor_reviews sr ON t.ticket_id = sr.ticket_id
      WHERE DATE(t.created_at) = CURDATE()
    `);
    const [escalatedYesterday] = await pool.query(`
      SELECT COUNT(DISTINCT t.ticket_id) as escalated
      FROM tickets t
      INNER JOIN supervisor_reviews sr ON t.ticket_id = sr.ticket_id
      WHERE DATE(t.created_at) = CURDATE() - INTERVAL 1 DAY
    `);
    const escalationCount = escalated[0].escalated || 0;
    const escalationCountYesterday = escalatedYesterday[0].escalated || 0;

    // 4. Reopened Tickets (tickets marked as Reopened today/yesterday)
    const [reopened] = await pool.query(`
      SELECT COUNT(*) as total
      FROM tickets 
      WHERE DATE(created_at) = CURDATE() 
        AND resolution_status = 'Reopened'
    `);
    const [reopenedYesterday] = await pool.query(`
      SELECT COUNT(*) as total
      FROM tickets 
      WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY
        AND resolution_status = 'Reopened'
    `);
    const reopenedTickets = reopened[0].total || 0;
    const reopenedTicketsYesterday = reopenedYesterday[0].total || 0;

    // 5. Customer Satisfaction (based on today's/yesterday's follow-up data)
    const [satisfaction] = await pool.query(`
      SELECT COUNT(*) as total, SUM(satisfied = 1) as satisfied
      FROM follow_ups 
      WHERE DATE(follow_up_date) = CURDATE() 
        AND satisfied IS NOT NULL
    `);
    const [satisfactionYesterday] = await pool.query(`
      SELECT COUNT(*) as total, SUM(satisfied = 1) as satisfied
      FROM follow_ups 
      WHERE DATE(follow_up_date) = CURDATE() - INTERVAL 1 DAY
        AND satisfied IS NOT NULL
    `);
    const satisfactionTotal = satisfaction[0].total || 0;
    const satisfactionCount = satisfaction[0].satisfied || 0;
    const satisfactionRate = satisfactionTotal > 0 ? Math.round((satisfactionCount / satisfactionTotal) * 100) : 0;
    const satisfactionTotalYesterday = satisfactionYesterday[0].total || 0;
    const satisfactionCountYesterday = satisfactionYesterday[0].satisfied || 0;
    const satisfactionRateYesterday = satisfactionTotalYesterday > 0 ? Math.round((satisfactionCountYesterday / satisfactionTotalYesterday) * 100) : 0;

    // 6. Ideas Executed (production ideas submitted today/yesterday)
    const [ideas] = await pool.query(`
      SELECT COUNT(*) as production
      FROM ideas 
      WHERE DATE(submission_date) = CURDATE() 
        AND status = 'production'
    `);
    const [ideasYesterday] = await pool.query(`
      SELECT COUNT(*) as production
      FROM ideas 
      WHERE DATE(submission_date) = CURDATE() - INTERVAL 1 DAY
        AND status = 'production'
    `);
    const ideasExecuted = ideas[0].production || 0;
    const ideasExecutedYesterday = ideasYesterday[0].production || 0;

    // 7. Content Produced (content marked completed today/yesterday)
    const [content] = await pool.query(`
      SELECT COUNT(*) as completed
      FROM content 
      WHERE content_status = 'Completed' AND DATE(created_at) = CURDATE()
    `);
    const [contentYesterday] = await pool.query(`
      SELECT COUNT(*) as completed
      FROM content 
      WHERE content_status = 'Completed' AND DATE(created_at) = CURDATE() - INTERVAL 1 DAY
    `);
    const contentCompleted = content[0].completed || 0;
    const contentCompletedYesterday = contentYesterday[0].completed || 0;

    // 8. Production Efficiency (productions completed today/yesterday)
    const [prodEff] = await pool.query(`
      SELECT COUNT(*) as completed_today
      FROM production 
      WHERE DATE(completion_date) = CURDATE() 
        AND completion_date IS NOT NULL 
        AND production_status = 'completed'
    `);
    const [prodEffYesterday] = await pool.query(`
      SELECT COUNT(*) as completed_today
      FROM production 
      WHERE DATE(completion_date) = CURDATE() - INTERVAL 1 DAY
        AND completion_date IS NOT NULL 
        AND production_status = 'completed'
    `);
    const avgProductionTime = prodEff[0].completed_today || 0;
    const avgProductionTimeYesterday = prodEffYesterday[0].completed_today || 0;

    // 9. Publishing Consistency (posts published today/yesterday)
    const [postsPublished] = await pool.query(`
      SELECT COUNT(*) as published
      FROM social_media 
      WHERE DATE(post_date) = CURDATE() 
        AND status = 'published'
    `);
    const [postsPublishedYesterday] = await pool.query(`
      SELECT COUNT(*) as published
      FROM social_media 
      WHERE DATE(post_date) = CURDATE() - INTERVAL 1 DAY
        AND status = 'published'
    `);
    const postsPublishedToday = postsPublished[0].published || 0;
    const postsPublishedYesterdayCount = postsPublishedYesterday[0].published || 0;

    res.json({
      callCenter: {
        ticketsToday: ticketsTotal,
        ticketsYesterday: ticketsTotalYesterday,
        ticketsDone: ticketsDone,
        ticketsDoneYesterday: ticketsDoneYesterday,
        avgResolutionTime,
        avgResolutionTimeYesterday,
        escalationCount,
        escalationCountYesterday,
        reopenedTickets,
        reopenedTicketsYesterday,
        satisfactionRate,
        satisfactionRateYesterday,
        satisfactionCount,
        satisfactionCountYesterday,
        satisfactionTotal,
        satisfactionTotalYesterday,
      },
      digitalMedia: {
        ideasExecuted,
        ideasExecutedYesterday,
        contentCompleted,
        contentCompletedYesterday,
        avgProductionTime,
        avgProductionTimeYesterday,
        postsPublishedToday,
        postsPublishedYesterday: postsPublishedYesterdayCount,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Top Contributors This Week
exports.getTopContributors = async (req, res) => {
  try {
    // Get top 5 contributors for this week
    const [rows] = await pool.query(`
      SELECT e.name, COUNT(i.idea_id) AS total_ideas, MIN(i.submission_date) as first_idea_date
      FROM ideas i
      JOIN employees e ON i.contributor_id = e.employee_id
      WHERE i.submission_date >= CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY
      GROUP BY i.contributor_id
      ORDER BY total_ideas DESC
      LIMIT 5
    `);
    // For each contributor, check if they have ideas before this week (for icon logic)
    const contributorIds = rows.map(r => r.name);
    const [repeatRows] = await pool.query(`
      SELECT e.name
      FROM ideas i
      JOIN employees e ON i.contributor_id = e.employee_id
      WHERE i.submission_date < CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY
        AND e.name IN (?)
      GROUP BY i.contributor_id
    `, [contributorIds]);
    const repeatNames = new Set(repeatRows.map(r => r.name));
    const result = rows.map(r => ({
      name: r.name,
      total_ideas: r.total_ideas,
      icon: repeatNames.has(r.name) ? 'repeat' : 'new',
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Top Complained Issues Today
exports.getTopComplainedIssues = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT issue_type, COUNT(*) AS issue_count
      FROM tickets
      WHERE DATE(created_at) = CURDATE()
      GROUP BY issue_type
      ORDER BY issue_count DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ticket Resolution Overview for Today
exports.getTicketResolutionOverview = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT resolution_status, COUNT(*) as count
      FROM tickets
      WHERE DATE(created_at) = CURDATE()
      GROUP BY resolution_status
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Weekly Ticket Trends (Grouped Bar Chart)
exports.getWeeklyTicketTrends = async (req, res) => {
  try {
    // Get the start of the current week (Saturday) in Africa/Mogadishu time
    const now = moment().tz('Africa/Mogadishu');
    let startOfWeek = now.clone().startOf('week').add(6, 'days'); // Saturday
    if (now.day() !== 6) {
      // If today is not Saturday, go back to the most recent Saturday
      startOfWeek = now.clone().day(6);
      if (startOfWeek.isAfter(now)) {
        startOfWeek = startOfWeek.subtract(7, 'days');
      }
    }
    const endOfWeek = now; // Up to today

    // Query tickets for the current week, grouped by day and status
    const [rows] = await pool.query(`
      SELECT 
        DATE(CONVERT_TZ(created_at, '+00:00', '+03:00')) as day,
        resolution_status,
        COUNT(*) as count
      FROM tickets
      WHERE 
        created_at >= CONVERT_TZ(?, '+00:00', '+03:00')
        AND created_at <= CONVERT_TZ(?, '+00:00', '+03:00')
      GROUP BY day, resolution_status
      ORDER BY day ASC
    `, [startOfWeek.format('YYYY-MM-DD 00:00:00'), endOfWeek.format('YYYY-MM-DD 23:59:59')]);

    // Build a result array for each day from Saturday to today
    const days = [];
    for (let i = 0; i <= now.diff(startOfWeek, 'days'); i++) {
      days.push(startOfWeek.clone().add(i, 'days').format('YYYY-MM-DD'));
    }
    const statuses = ['Done', 'In Progress', 'Pending', 'Reopened'];
    const result = days.map(day => {
      const dayData = { day };
      statuses.forEach(status => {
        const found = rows.find(r => r.day === day && r.resolution_status === status);
        dayData[status] = found ? found.count : 0;
      });
      return dayData;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Daily Ticket Volume (Current Operational Week - Saturday to Friday)
exports.getDailyTicketVolume = async (req, res) => {
  try {
    // Use UTC for consistency - this matches how the database stores dates
    const now = moment.utc();
    
    // Calculate the current operational week (Saturday to Friday)
    let startOfWeek = now.clone().startOf('week').add(6, 'days'); // Saturday
    if (now.day() !== 6) {
      // If today is not Saturday, go back to the most recent Saturday
      startOfWeek = now.clone().day(6);
      if (startOfWeek.isAfter(now)) {
        startOfWeek = startOfWeek.subtract(7, 'days');
      }
    }
    const endOfWeek = startOfWeek.clone().add(6, 'days'); // Friday

    console.log('=== Daily Ticket Volume Debug ===');
    console.log('Current time (UTC):', now.format('YYYY-MM-DD HH:mm:ss'));
    console.log('Operational week start:', startOfWeek.format('YYYY-MM-DD'));
    console.log('Operational week end:', endOfWeek.format('YYYY-MM-DD'));

    // Simple query using UTC dates - no timezone conversion needed
    const query = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE 
        DATE_FORMAT(created_at, '%Y-%m-%d') >= ?
        AND DATE_FORMAT(created_at, '%Y-%m-%d') <= ?
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY day ASC
    `;
    
    const params = [startOfWeek.format('YYYY-MM-DD'), endOfWeek.format('YYYY-MM-DD')];
    console.log('SQL Query:', query);
    console.log('Query parameters:', params);

    const [rows] = await pool.query(query, params);
    console.log('Raw query results:', rows);

    // Generate all 7 days from Saturday to Friday, ensuring every day is represented
    const result = [];
    const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.clone().add(i, 'days');
      const dayStr = currentDay.format('YYYY-MM-DD');
      const dayName = dayNames[i];
      
      const found = rows.find(r => r.day === dayStr);
      const ticketCount = found ? found.total_tickets : 0;
      
      console.log(`Day ${i + 1}: ${dayStr} (${dayName}) - Found: ${found ? 'Yes' : 'No'} - Tickets: ${ticketCount}`);
      
      result.push({
        day: dayStr,
        dayName: dayName,
        total_tickets: ticketCount
      });
    }

    console.log('Final result:', result);
    console.log('=== End Debug ===');

    res.json(result);
  } catch (err) {
    console.error('Daily Ticket Volume Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Simple Ticket Volume (Fallback - Last 7 days)
exports.getSimpleTicketVolume = async (req, res) => {
  try {
    // Use the same logic as getDailyTicketVolume for consistency
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(DATE(created_at), '%Y-%m-%d') as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d')
      ORDER BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d') ASC
    `);

    // Generate the last 7 days (including today)
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      const found = rows.find(r => r.day === dayStr);
      result.push({
        day: dayStr,
        total_tickets: found ? found.total_tickets : 0
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Simple Ticket Volume Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// All Ticket Volume (Last 7 days - Consistent with other endpoints)
exports.getAllTicketVolume = async (req, res) => {
  try {
    // Use the same logic as getDailyTicketVolume for consistency
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(DATE(created_at), '%Y-%m-%d') as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d')
      ORDER BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d') ASC
    `);

    // Generate the last 7 days (including today)
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      const found = rows.find(r => r.day === dayStr);
      result.push({
        day: dayStr,
        total_tickets: found ? found.total_tickets : 0
      });
    }

    res.json(result);
  } catch (err) {
    console.error('All Ticket Volume Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Ticket Volume by Issue Category (App vs IPTV) - Last 7 days
exports.getTicketVolumeByCategory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(DATE(created_at), '%Y-%m-%d') as date,
        issue_category,
        COUNT(*) as count
      FROM tickets
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND issue_category IN ('App', 'IPTV')
      GROUP BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d'), issue_category
      ORDER BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d') ASC, issue_category
    `);

    // Generate the last 7 days (including today)
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      const appTickets = rows.find(r => r.date === dayStr && r.issue_category === 'App');
      const iptvTickets = rows.find(r => r.date === dayStr && r.issue_category === 'IPTV');
      
      result.push({
        date: dayStr,
        app: appTickets ? appTickets.count : 0,
        iptv: iptvTickets ? iptvTickets.count : 0
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Ticket Volume by Category Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Ticket States (Open vs Closed based on end_time) - Today Only
exports.getTicketStates = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS total_tickets,
        COUNT(CASE WHEN end_time IS NULL THEN 1 END) AS open_tickets,
        COUNT(CASE WHEN end_time IS NOT NULL THEN 1 END) AS closed_tickets
      FROM tickets
      WHERE DATE(created_at) = CURDATE()
    `);
    
    const result = rows[0];
    res.json({
      total_tickets: result.total_tickets || 0,
      open_tickets: result.open_tickets || 0,
      closed_tickets: result.closed_tickets || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// First Call Resolution (FCR) Rate for Today
exports.getFcrRate = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS total_tickets,
        SUM(first_call_resolution = 1) AS fcr_tickets
      FROM tickets
      WHERE DATE(created_at) = CURDATE()
    `);
    const { total_tickets, fcr_tickets } = rows[0];
    const fcr_rate = total_tickets > 0 ? Math.round((fcr_tickets / total_tickets) * 100) : 0;
    res.json({ total_tickets, fcr_tickets, fcr_rate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Test endpoint to create sample data for chart testing
exports.createTestTickets = async (req, res) => {
  try {
    // Insert test tickets for the last few days
    const testTickets = [
      { date: 'CURDATE()', count: 4 }, // Today - 4 tickets
      { date: 'DATE_SUB(CURDATE(), INTERVAL 1 DAY)', count: 2 }, // Yesterday - 2 tickets  
      { date: 'DATE_SUB(CURDATE(), INTERVAL 2 DAY)', count: 6 }, // 2 days ago - 6 tickets
      { date: 'DATE_SUB(CURDATE(), INTERVAL 3 DAY)', count: 1 }, // 3 days ago - 1 ticket
    ];

    for (const ticket of testTickets) {
      for (let i = 0; i < ticket.count; i++) {
        await pool.query(`
          INSERT INTO tickets (customer_phone, issue_category, issue_type, issue_description, agent_id, created_at)
          VALUES (?, ?, ?, ?, 1, ${ticket.date})
        `, [
          `123456789${i}`,
          'Technical',
          'System Issue',
          `Test ticket for chart testing - ${ticket.date}`
        ]);
      }
    }

    res.json({ 
      message: 'Test tickets created successfully',
      tickets_created: testTickets.reduce((sum, t) => sum + t.count, 0)
    });
  } catch (err) {
    console.error('Error creating test tickets:', err);
    res.status(500).json({ error: err.message });
  }
}; 

// Debug endpoint to check tickets in database
exports.debugTickets = async (req, res) => {
  try {
    const [allTickets] = await pool.query(`
      SELECT 
        ticket_id,
        DATE(created_at) as day,
        created_at,
        issue_type
      FROM tickets 
      ORDER BY created_at DESC 
      LIMIT 20
    `);

    const [todayCount] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM tickets 
      WHERE DATE(created_at) = CURDATE()
    `);

    const [dateRange] = await pool.query(`
      SELECT 
        MIN(created_at) as earliest,
        MAX(created_at) as latest,
        COUNT(*) as total
      FROM tickets
    `);

    res.json({
      recent_tickets: allTickets,
      today_count: todayCount[0].count,
      date_range: dateRange[0],
      current_date: new Date().toISOString().split('T')[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Debug endpoint: Show current operational week range and all ticket days (Africa/Mogadishu)
exports.getTicketVolumeDebug = async (req, res) => {
  try {
    const now = moment().tz('Africa/Mogadishu');
    let startOfWeek = now.clone().startOf('week').add(6, 'days'); // Saturday
    if (now.day() !== 6) {
      startOfWeek = now.clone().day(6);
      if (startOfWeek.isAfter(now)) {
        startOfWeek = startOfWeek.subtract(7, 'days');
      }
    }
    const endOfWeek = startOfWeek.clone().add(6, 'days'); // Friday

    // All ticket days after timezone conversion
    const [rows] = await pool.query(`
      SELECT 
        DATE(CONVERT_TZ(created_at, '+00:00', '+03:00')) as local_day,
        COUNT(*) as count
      FROM tickets
      GROUP BY local_day
      ORDER BY local_day ASC
    `);

    res.json({
      operational_week: {
        start: startOfWeek.format('YYYY-MM-DD'),
        end: endOfWeek.format('YYYY-MM-DD'),
        days: Array.from({length: 7}, (_, i) => startOfWeek.clone().add(i, 'days').format('YYYY-MM-DD'))
      },
      ticket_days: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Test timezone conversion
exports.testTimezoneConversion = async (req, res) => {
  try {
    // Test with a few sample dates
    const [testRows] = await pool.query(`
      SELECT 
        created_at,
        DATE(created_at) as utc_date,
        DATE(CONVERT_TZ(created_at, '+00:00', '+03:00')) as local_date
      FROM tickets
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      message: 'Timezone conversion test',
      sample_tickets: testRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Simple debug endpoint to see what's in the database
exports.debugDatabase = async (req, res) => {
  try {
    // Get current time in different timezones
    const nowUTC = moment.utc();
    const nowLocal = moment();
    const nowMogadishu = moment().tz('Africa/Mogadishu');
    
    // Get some sample tickets with their dates
    const [tickets] = await pool.query(`
      SELECT 
        ticket_id,
        created_at,
        DATE(created_at) as date_only,
        NOW() as server_now,
        @@global.time_zone as server_timezone
      FROM tickets 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.json({
      current_time: {
        utc: nowUTC.format('YYYY-MM-DD HH:mm:ss'),
        local: nowLocal.format('YYYY-MM-DD HH:mm:ss'),
        mogadishu: nowMogadishu.format('YYYY-MM-DD HH:mm:ss')
      },
      sample_tickets: tickets,
      server_info: {
        timezone: tickets[0]?.server_timezone || 'unknown',
        server_now: tickets[0]?.server_now || 'unknown'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Comprehensive debug endpoint
exports.debugAllDates = async (req, res) => {
  try {
    // Get current time in UTC
    const now = moment.utc();
    
    // Calculate operational week
    let startOfWeek = now.clone().startOf('week').add(6, 'days'); // Saturday
    if (now.day() !== 6) {
      startOfWeek = now.clone().day(6);
      if (startOfWeek.isAfter(now)) {
        startOfWeek = startOfWeek.subtract(7, 'days');
      }
    }
    const endOfWeek = startOfWeek.clone().add(6, 'days'); // Friday

    // Get all ticket dates
    const [allTickets] = await pool.query(`
      SELECT 
        DATE(created_at) as ticket_date,
        COUNT(*) as count
      FROM tickets
      GROUP BY DATE(created_at)
      ORDER BY ticket_date DESC
    `);

    // Test the specific query
    const [weekTickets] = await pool.query(`
      SELECT 
        DATE(created_at) as day,
        COUNT(*) as total_tickets
      FROM tickets
      WHERE 
        DATE(created_at) >= ?
        AND DATE(created_at) <= ?
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `, [startOfWeek.format('YYYY-MM-DD'), endOfWeek.format('YYYY-MM-DD')]);

    res.json({
      current_info: {
        now_utc: now.format('YYYY-MM-DD HH:mm:ss'),
        current_day_of_week: now.day(), // 0=Sunday, 6=Saturday
        operational_week_start: startOfWeek.format('YYYY-MM-DD'),
        operational_week_end: endOfWeek.format('YYYY-MM-DD')
      },
      all_ticket_dates: allTickets,
      week_query_results: weekTickets,
      week_query_params: [startOfWeek.format('YYYY-MM-DD'), endOfWeek.format('YYYY-MM-DD')]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Recent Tickets Widget
exports.getRecentTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.ticket_id,
        t.customer_phone,
        t.issue_category,
        t.issue_type,
        t.resolution_status as status,
        t.created_at,
        t.end_time
      FROM tickets t
      ORDER BY t.created_at DESC
      LIMIT 10
    `);
    
    const tickets = rows.map(ticket => ({
      ticket_id: ticket.ticket_id,
      customer_phone: ticket.customer_phone,
      issue_category: ticket.issue_category,
      issue_type: ticket.issue_type,
      status: ticket.status,
      created_at: ticket.created_at,
      end_time: ticket.end_time
    }));
    
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ideas Produced Today Widget
exports.getIdeasProducedToday = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.idea_id,
        i.title,
        i.priority,
        i.status,
        i.submission_date as created_at,
        e.name as submitted_by
      FROM ideas i
      LEFT JOIN employees e ON i.contributor_id = e.employee_id
      WHERE DATE(i.submission_date) = CURDATE()
      ORDER BY i.submission_date DESC
      LIMIT 10
    `);
    
    const ideas = rows.map(idea => ({
      idea_id: idea.idea_id,
      title: idea.title,
      priority: idea.priority,
      status: idea.status,
      created_at: idea.created_at,
      submitted_by: idea.submitted_by
    }));
    
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 